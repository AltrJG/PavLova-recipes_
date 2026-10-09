# Motor de Puntuación Nutricional de Recetas Basado en IA

## Resumen ejecutivo

El **Módulo de Puntuación Nutricional** evalúa automáticamente el perfil nutricional de las recetas enviadas por los usuarios mediante una escala estandarizada de **0 a 500 puntos**. Al combinar cálculos nutricionales en tiempo real en el frontend con un modelo de aprendizaje automático basado en un **Random Forest Regressor**, la plataforma proporciona métricas nutricionales y recomendaciones automatizadas para la planificación de comidas, sin requerir una revisión humana manual de cada receta nueva.

---

## Flujo de datos y generación inicial del conjunto de entrenamiento supervisado

Para entrenar un modelo inicial sin depender de API propietarias externas de puntuación nutricional, implementamos un proceso de inicialización mediante **aprendizaje supervisado con intervención humana (Human-in-the-Loop, HITL)**:

1. **Cálculo nutricional en tiempo real en el cliente:**

   Cuando un usuario crea o modifica una receta, las cantidades de los ingredientes y sus unidades de medida (por ejemplo, gramos y cucharadas) se procesan en el frontend. Esto permite calcular en tiempo real los totales nutricionales por porción, incluyendo proteínas, grasas, carbohidratos, sodio y calorías, evitando una carga innecesaria de procesamiento y agregación en el backend.

2. **Etiquetado de referencia mediante moderación:**

   Los administradores del sistema y los moderadores nutricionales revisan una receta y asignan una puntuación nutricional verificada dentro del intervalo [0, 500], considerando su categoría y perfil de macronutrientes. Una vez verificadas, estas recetas se marcan en la base de datos (`Verificado = True`) y constituyen el conjunto de referencia de alta calidad (*gold standard*) utilizado para entrenar el modelo.

---

## Arquitectura de aprendizaje automático e ingeniería de características

### Selección del algoritmo: Random Forest Regressor

Seleccionamos un **Random Forest Regressor (regresor de bosque aleatorio)** en lugar de modelos lineales simples por dos motivos principales:

* **Contexto categórico no lineal:** los perfiles de macronutrientes por sí solos (por ejemplo, un contenido elevado de grasas o proteínas) no capturan todo el contexto nutricional. Al incorporar la característica categórica `Categorias`, el modelo puede aprender patrones específicos de cada categoría; por ejemplo, evaluar de manera diferente un postre rico en grasas y un plato principal con un contenido similar de grasas.

* **Robustez ante el ruido y los conjuntos de datos pequeños:** los modelos de ensamble basados en árboles pueden capturar interacciones no lineales entre características y ofrecen mecanismos útiles para controlar el sobreajuste durante las primeras etapas de crecimiento del conjunto de datos.

### Preprocesamiento y normalización de datos

Antes del entrenamiento, los datos pasan por un proceso de ingeniería de características compuesto por varias etapas:

1. **Normalización por porción:**

   Las métricas de cada receta se estandarizan a una porción de referencia mediante factores de conversión de unidades de medida:

   $$\text{Nutriente normalizado} = \frac{\text{Cantidad del nutriente} \times \text{Factor de conversión}}{\text{Porciones de la receta}}$$

2. **Estandarización calórica y reducción de características:**

   Para distinguir la densidad nutricional de la cantidad total de alimento, calculamos un promedio calórico de referencia (`Promedio_calorias`) a partir de las recetas del conjunto de entrenamiento. Las características nutricionales se ajustan en relación con esta referencia calórica.

   Debido a que las características de entrada ya están ajustadas según este criterio, la variable de calorías sin procesar se excluye antes del entrenamiento para reducir la redundancia y el ruido entre características.

---

## Entrenamiento, validación y despliegue del modelo

1. **Estrategia de validación:**

   El modelo se entrena utilizando **validación cruzada K-Fold**, con el objetivo de evaluar su capacidad de generalización entre distintas categorías de recetas y reducir el riesgo de sobreajuste a ingredientes o patrones culinarios regionales específicos.

2. **Métricas de rendimiento:**

   El rendimiento del modelo se evalúa utilizando como referencia un umbral objetivo de **error absoluto medio (MAE) de 50 puntos**, equivalente al 10 % del intervalo total de puntuación de 0 a 500.

   Se generan informes automatizados para los administradores, que permiten evaluar si el modelo alcanza un rendimiento suficiente para su puesta en producción o si necesita más ejemplos con puntuaciones de referencia verificadas por personas.

3. **Predicción y estrategia de respaldo durante la planificación de comidas:**

   Al generar planes de comidas automatizados, el sistema comprueba el estado de verificación de cada receta:

   * **Recetas verificadas:** se utiliza directamente la puntuación de referencia asignada por un moderador, priorizando la evaluación humana disponible.
   * **Recetas no verificadas o creadas por usuarios:** se ejecuta el proceso de inferencia, que incluye la estandarización calórica y la predicción del modelo, para calcular una puntuación nutricional estimada en milisegundos.

Este enfoque híbrido permite ampliar el catálogo de recetas de la plataforma mientras se mantiene un criterio nutricional uniforme para la generación automatizada de planes de comidas.
