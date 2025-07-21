from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import KFold, cross_val_predict
from sklearn.metrics import mean_squared_error
from sklearn.impute import SimpleImputer
import pandas as pd
import joblib
import random
import numpy as np
from .utils import calcular_nutrientes

from app.models import Receta, PromedioCalorias

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

    cols_dummies = [col for col in df.columns if col.startswith('categoria_')]
    df[cols_dummies] = df[cols_dummies].astype(int)

    X = df.drop(columns=['puntuacion'])
    y = df['puntuacion']

    seed = random.randint(0, 10000)
    modelo = RandomForestRegressor(random_state=seed)

    k = 5
    kf = KFold(n_splits=k, shuffle=True, random_state=seed)

    y_pred = cross_val_predict(modelo, X, y, cv=kf)
    rmse = np.sqrt(mean_squared_error(y, y_pred))

    modelo.fit(X, y)

    modelo_filename = f'modelo_randomforest.pkl'

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