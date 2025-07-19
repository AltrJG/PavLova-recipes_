from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import KFold, cross_val_predict
from sklearn.metrics import mean_squared_error
from sklearn.impute import SimpleImputer
import pandas as pd
import joblib
import random
from decimal import Decimal, ROUND_HALF_UP, getcontext
import numpy as np
from datetime import datetime

from app.models import Receta, RecetaIngrediente, PromedioCalorias

getcontext().prec = 6

def redondear(valor):
    return Decimal(valor).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

def calcular_nutrientes(receta, porcion_final=1):
    info = {
        'calorias': Decimal(0),
        'proteina': Decimal(0),
        'carbohidratos': Decimal(0),
        'grasas_saturadas': Decimal(0),
        'grasas_insaturadas': Decimal(0),
        'grasas_trans': Decimal(0),
        'sodio': Decimal(0)
    }

    porcion_inicial = receta.porciones
    receta_ingredientes = RecetaIngrediente.objects.filter(receta=receta).select_related('ingrediente')

    for ri in receta_ingredientes:
        ingrediente = ri.ingrediente
        unidad = ri.unidad.lower()
        escala_agua = Decimal(ingrediente.escala_agua or 1)

        if unidad == 'cucharadita':
            metrica = Decimal(5) * escala_agua
        elif unidad == 'cucharada':
            metrica = Decimal(15) * escala_agua
        elif unidad == 'taza':
            metrica = Decimal(250) * escala_agua
        else:
            metrica = Decimal(1)

        conversion = (Decimal(ri.cantidad) * metrica / porcion_inicial) * porcion_final

        info['calorias'] += Decimal(ingrediente.calorias) * conversion
        info['proteina'] += Decimal(ingrediente.proteinas) * conversion
        info['carbohidratos'] += Decimal(ingrediente.carbohidratos) * conversion
        info['grasas_saturadas'] += Decimal(ingrediente.grasas_saturadas) * conversion
        info['grasas_insaturadas'] += Decimal(ingrediente.grasas_insaturadas) * conversion
        info['grasas_trans'] += Decimal(ingrediente.grasas_trans) * conversion
        info['sodio'] += Decimal(ingrediente.sodio) * conversion

    info = {k: redondear(v) for k, v in info.items()}

    #print(f'Nutrientes calculados para receta "{receta.nombre}": {info}')
    return info

def entrenar_modelo():
    recetas = Receta.objects.filter(verificado=True).exclude(puntuacion=0)

    datos = []
    calorias_totales = []

    for receta in recetas:
        nutrientes = calcular_nutrientes(receta)
        calorias_totales.append(nutrientes['calorias'])
        datos.append({
            **nutrientes,
            'categoria': receta.categoria.nombre if receta.categoria else 'Desconocida',
            'puntuacion': receta.puntuacion
        })

    if not datos:
        return {'error': 'No hay suficientes recetas verificadas con puntuacion para entrenar.'}

    df = pd.DataFrame(datos)

    calorias_promedio = float(sum(calorias_totales) / len(calorias_totales))
    PromedioCalorias.objects.all().delete()
    PromedioCalorias.objects.create(calorias_promedio=calorias_promedio)

    for col in ['calorias', 'proteina', 'carbohidratos', 'grasas_saturadas', 'grasas_insaturadas', 'grasas_trans', 'sodio']:
        df[col] = df[col].astype(float)

    imputer = SimpleImputer(strategy='mean')
    df[['calorias', 'proteina', 'carbohidratos', 'grasas_saturadas', 'grasas_insaturadas', 'grasas_trans', 'sodio']] = \
        imputer.fit_transform(df[['calorias', 'proteina', 'carbohidratos', 'grasas_saturadas', 'grasas_insaturadas', 'grasas_trans', 'sodio']])

    for nutrient in ['proteina', 'carbohidratos', 'grasas_saturadas', 'grasas_insaturadas', 'grasas_trans', 'sodio']:
        df[nutrient] = (df[nutrient] / df['calorias']) * calorias_promedio

    df = df.drop(columns=['calorias'])
    df = pd.get_dummies(df, columns=['categoria'])

    X = df.drop(columns=['puntuacion'])
    y = df['puntuacion']

    seed = random.randint(0, 10000)
    modelo = RandomForestRegressor(random_state=seed)

    k = 5
    kf = KFold(n_splits=k, shuffle=True, random_state=seed)

    y_pred = cross_val_predict(modelo, X, y, cv=kf)
    rmse = np.sqrt(mean_squared_error(y, y_pred))

    modelo.fit(X, y)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    modelo_filename = f'modelo_randomforest_{timestamp}_{seed}_{round(rmse, 2)}.pkl'

    joblib.dump(modelo, modelo_filename)

    rango_puntuacion = 500
    umbral_tolerancia = 0.10 * rango_puntuacion
    porcentaje_error = (rmse / rango_puntuacion) * 100
    dentro_tolerancia = rmse <= umbral_tolerancia

    mensaje = (
        f"El modelo está dentro del 10% de tolerancia (RMSE: {round(rmse, 2)})."
        if dentro_tolerancia else
        f"El modelo supera el 10% de tolerancia (RMSE: {round(rmse, 2)})."
    )

    return {
        'modelo': 'RandomForestRegressor',
        'semilla': seed,
        'k_folds': k,
        'rmse_promedio': round(rmse, 2),
        'error_%': round(porcentaje_error, 2),
        'tolerancia_10%': umbral_tolerancia,
        'calorias_promedio': round(calorias_promedio, 2),
        'message': mensaje
    }