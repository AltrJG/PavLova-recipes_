import pandas as pd
from django.db.models import Prefetch
from app.models import Receta, PromedioCalorias, RecetaIngrediente
from .utils import calcular_nutrientes
from .load_model import get_modelo

def predecir_puntuacion(ids_recetas):

    try:
        modelo = get_modelo()
    except FileNotFoundError:
        return {'error': 'El modelo no está disponible. Por favor, entrene el modelo primero o asegúrese de que el archivo exista.'}

    recetas = Receta.objects.filter(id__in=ids_recetas).prefetch_related(
        Prefetch('receta_ingredientes', queryset=RecetaIngrediente.objects.select_related('ingrediente'))
    )

    calorias_promedio = PromedioCalorias.objects.first().calorias_promedio if PromedioCalorias.objects.exists() else 1
    resultados = []

    datos_prediccion = []
    recetas_a_predecir = []

    for receta in recetas:
        if receta.puntuacion > 0:
            resultados.append({
                'id': receta.id,
                'puntuacion': receta.puntuacion,
                'estado': 'existente'
            })
        else:
            nutrientes = calcular_nutrientes(receta)
            nutrientes = {k: float(v) for k, v in nutrientes.items()}
            receta_info = {
                **nutrientes,
                'categoria': receta.categoria.nombre if receta.categoria else 'Desconocida',
                'id': receta.id
            }
            datos_prediccion.append(receta_info)
            recetas_a_predecir.append(receta.id)

    if datos_prediccion:
        df = pd.DataFrame(datos_prediccion)

        for nutrient in ['proteina', 'carbohidratos', 'grasas_saturadas', 'grasas_insaturadas', 'grasas_trans', 'sodio']:
            df[nutrient] = (df[nutrient] / df['calorias']) * calorias_promedio

        df = df.drop(columns=['calorias'])

        df = pd.get_dummies(df, columns=['categoria'])
        df[df.columns] = df[df.columns].astype(int)
        columnas_modelo = modelo.feature_names_in_

        for col in columnas_modelo:
            if col not in df.columns:
                df[col] = 0
        df = df[columnas_modelo]

        predicciones = modelo.predict(df)

        for receta_id, puntuacion in zip(recetas_a_predecir, predicciones):
            resultados.append({
                'id': receta_id,
                'puntuacion': round(float(puntuacion), 2),
                'estado': 'predicha'
            })

    return resultados
    