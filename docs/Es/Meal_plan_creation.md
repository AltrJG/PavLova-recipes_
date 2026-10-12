# Motor de Creación y Optimización de Planes Alimenticios

## Descripción General
El **Módulo de Planificación Alimenticia** es el núcleo operativo de la aplicación, sintetizando objetivos de salud del usuario, selección de recetas y métricas nutricionales en esquemas estructurados de varios días (hasta 7 días).

### Capacidades Clave:
* **Selección de Recetas Personalizadas:** Los usuarios pueden estructurar planes utilizando recetas de su propia autoría o recetas guardadas de la comunidad.
* **Análisis y Retroalimentación Nutricional:** Calcula las distribuciones de macronutrientes, micronutrientes, carga calórica total y niveles de sodio en tiempo real para generar recomendaciones contextuales.
* **Configuración Dinámica de Objetivos:** Permite definir metas nutricionales personalizadas que van desde un plan enfocado en bienestar general hasta objetivos especializados en bajar de peso o crecimiento muscular.
* **Agregación Automatizada de Ingredientes:** Compila automáticamente una lista consolidada de compras con los ingredientes y cantidades exactas requeridas para preparar todas las recetas seleccionadas durante el período.
* **Exportación y Portabilidad:** Genera un reporte descargable en formato PDF que contiene la programación completa del plan, desgloses nutricionales y listas de ingredientes para uso sin conexión o para compartir.  
  *(Ejemplo de reporte generado: [plan_alimenticio_2026-01-17_a_2026-01-23.zip](https://github.com/user-attachments/files/33293321/plan_alimenticio_2026-01-17_a_2026-01-23.1.zip))*

Los planes alimenticios pueden construirse de forma **manual** mediante validación de restricciones en tiempo real o de forma **automática** utilizando un motor heurístico optimizado que ejecuta en el *client-side*.

---

## 1. Construcción Manual de Planes Alimenticios

Los usuarios pueden construir interactivamente planes de varios días seleccionando combinaciones personalizadas de recetas para cada día designado.

<img width="1915" height="940" alt="Selector Manual de Recetas" src="https://github.com/user-attachments/assets/3a538455-5ee3-405f-b4c4-02f37aa8c0c7" />

*Figura 1: Interfaz de selección manual de recetas integrada con el catálogo personal y favoritos de la comunidad.*

### Configuración de Objetivos Metabólicos
Por defecto, los planes alimenticios recién creados se inicializan utilizando las recomendaciones nutricionales base establecidas por la Organización Mundial de la Salud (OMS). Los usuarios pueden personalizar estos objetivos a través de dos modalidades:

1. **Modo Avanzado (Entrada Directa):** Permite la especificación manual de límites diarios exactos para Calorías (kcal), Proteínas (g), Grasas Saturadas/Insaturadas/Trans (g), Carbohidratos (g) y Sodio (mg).
2. **Cálculo Metabólico Automatizado:** Evalúa métricas físicas del usuario (Peso, Estatura, Edad, Sexo Biológico y Factor de Actividad Física) para calcular el Gasto Energético Total Diario (TDEE) mediante la **Ecuación de Mifflin-St Jeor**:

$$\text{BMR}_{\text{hombre}} = (10 \times \text{peso}_{\text{kg}}) + (6.25 \times \text{estatura}_{\text{cm}}) - (5 \times \text{edad}_{\text{años}}) + 5$$

$$\text{BMR}_{\text{mujer}} = (10 \times \text{peso}_{\text{kg}}) + (6.25 \times \text{estatura}_{\text{cm}}) - (5 \times \text{edad}_{\text{años}}) - 161$$

$$\text{TDEE} = \text{BMR} \times \text{Multiplicador de Actividad } (1.2 \text{ a } 1.9)$$

<img width="1915" height="940" alt="Configuración de Objetivos Nutricionales" src="https://github.com/user-attachments/assets/c7f76a1b-146a-4af7-a114-787a9e4506eb" />

*Figura 2: Panel de configuración automatizada de objetivos metabólicos.*

### Validaciones y Reportes en Tiempo Real
El motor en el *frontend* recalculaba continuamente la distribución de macronutrientes frente a los objetivos establecidos. Si un usuario excede o queda significativamente por debajo de un umbral recomendado, la interfaz muestra advertencias en tiempo real detallando los posibles impactos en la salud.

<img width="267" height="359" alt="Modal de Advertencia Nutricional" src="https://github.com/user-attachments/assets/fefdb45f-a978-4bae-b4a2-0d1f5a6b7102" />

*Figura 3: Notificación de advertencia cuando la ingesta proteica excede los límites diarios recomendados.*

Los resúmenes del plan muestran la relación nutrientes-por-caloría, el total de ingredientes requeridos y gráficos de distribución macro por día, los cuales son compilados en el documento PDF exportable al finalizar el plan.

<img width="500" height="500" alt="Resumen Nutricional" src="https://github.com/user-attachments/assets/362b2dee-520a-4350-9ed1-fadac97a5d36" />
<img width="405" height="721" alt="Distribución de Macronutrientes" src="https://github.com/user-attachments/assets/46bbb21d-d10e-42c4-a114-c55e1e26fc50" />
<img width="1109" height="622" alt="Agregación de Ingredientes" src="https://github.com/user-attachments/assets/13a27a4a-36ba-42e2-b1eb-047fe429f17b" />

*Figura 4: Todas las métricas que se muestran cuando se crea un plan de alimentación.*

---

## 2. Arquitectura de Generación Automática de Planes Alimenticios

El generador automático ejecuta un **pipeline heurístico codicioso (*greedy*) en el lado del cliente con penalizaciones dinámicas**, diseñado para descubrir combinaciones óptimas de recetas sin incurrir en un procesamiento pesado en el servidor ni en latencias de red innecesarias.

<img width="1851" height="910" alt="Interfaz de Configuración Automática" src="https://github.com/user-attachments/assets/c9be4ba0-4b4b-4413-ab9f-a48aa91f447e" />

*Figura 5: Panel de configuración del planificador automático para número de comidas, parámetros de variedad y ponderaciones nutricionales.*

### Parámetros de Preferencia del Usuario:
* **Ponderación de Macronutrientes ($0\% \text{ a } 200\%$):** Ajusta la prioridad de puntuación relativa a la densidad calórica. $100\%$ representa una ponderación neutra, $>100\%$ prioriza recetas con mayor densidad de ese nutriente y $<100\%$ penaliza recetas ricas en el mismo.
* **Factor de Penalización de Sodio ($0\% \text{ a } 100\%$):** Aplica una restricción de límite superior estricto. Las recetas que se aproximan o exceden el umbral diario de sodio y el usuario selecciona una penalizacion muy grande (80%-100%) sufren una penalización drástica en su puntuación.
* **Decaimiento Dinámico de Variedad:**
  * **Decaimiento Estándar:** Reduce la puntuación base de una receta en un porcentaje fijo para los días subsecuentes una vez seleccionada.
  * **Modo Máxima Variedad:** Aplica una penalización inmediata del $50\%$ a la puntuación tras su selección, recuperando un $10\%$ por cada día subsecuente sin ser seleccionada hasta retornar a su baseline.

---

### Pasos de Ejecución del Pipeline (Client-Side)
1. **Resolución de Puntuación (Inferencia Híbrida):**  
   Se evalúa el conjunto de recetas candidatas. Las recetas con puntuaciones verificadas por un moderador (`Verificado = True`) utilizan su calificación *ground-truth* ($y \in [0, 500]$). Las recetas no verificadas de usuarios emiten una solicitud asíncrona al **Random Forest Regressor** en el backend para predecir su puntuación nutricional.

2. **Normalización por Rendimiento de Porciones:**  
   Las cantidades de ingredientes y valores nutricionales se escalan linealmente para coincidir con el tamaño de porción objetivo configurado por el usuario.

3. **Re-ponderación por Preferencias:**  
   Las puntuaciones se ajustan según los multiplicadores de macronutrientes seleccionados ($0\% - 200\%$). El algoritmo evalúa la contribución energética proporcional de cada nutriente respecto al perfil calórico total y escala la puntuación general de la receta.

4. **Selección Codiciosa de Candidatos y Ajuste Condicional de Brechas (*Gap-Filling*):**  
   Las recetas se ordenan de forma descendente según su puntuación ajustada y se asignan a cada espacio diario:
   * **Modo Estándar:** Asigna directamente las $K$ recetas con mayor puntuación para cada día.
   * **Modo Auto-Ajuste (Ajuste Condicional de Brechas):** Si la acumulación de recetas seleccionadas para un día hace que se exceda un objetivo nutricional, el algoritmo activa una búsqueda dirigida **únicamente para el último espacio de comida del día**. Reemplaza este último candidato con una receta que balancee óptimamente el delta nutricional restante ("llena la brecha").

5. **Aplicación de Penalización Temporal:**  
   Las recetas seleccionadas sufren una penalización de puntuación basada en el modo de variedad activo, actualizando sus valores en el pool de candidatos antes de avanzar al siguiente día del plan.

---

### Compromiso de Arquitectura e Impacto en Rendimiento
Al delegar la totalidad del cálculo combinatorio al motor de JavaScript del navegador (V8), el tiempo real de ejecución del algoritmo toma **menos de 100 ms de CPU local**. 

La latencia total percibida por el usuario depende casi exclusivamente de los tiempos de ida y vuelta de red (RTT) requeridos para las peticiones API del backend (obtener predicciones de ML para recetas no verificadas y guardar el *payload* del plan final). Esta arquitectura de *client-side processing* elimina colas pesadas de procesamiento en el servidor, manteniendo el uso de CPU en el backend cercano a cero y permitiendo al sistema escalar eficientemente a un costo de infraestructura mínimo.
