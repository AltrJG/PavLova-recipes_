# Descripción General del Diseño de la Base de Datos

> **Nota:** Este documento toma como referencia el diagrama Entidad-Relación (ER) presentado a continuación para detallar la arquitectura relacional y las decisiones de diseño de los modelos de dominio principales.

<img width="1109" height="1305" alt="image" src="https://github.com/user-attachments/assets/a973ce8f-f4d5-47a8-b657-14b5961dd6c7" />

La base de datos se estructura en torno a tres entidades de dominio principales: **Recetas**, **Usuarios** y **Planes Alimenticios**. Las **Recetas** constituyen el núcleo operativo de la plataforma, mientras que los **Usuarios** representan la columna vertebral social y administrativa.

---

## 1. Recetas (`Receta`)

La tabla `Receta` actúa como la entidad principal de la base de datos, estableciendo relaciones con casi todas las demás tablas del sistema. Encapsula metadatos esenciales como el nombre de la receta, la identificación del creador, los pasos de preparación y las valoraciones de los usuarios.

### Decisiones Clave de Arquitectura y Diseño:
* **Cálculo Nutricional en el Lado del Cliente:**  
  Con el fin de optimizar el rendimiento de la base de datos y eliminar operaciones de escritura redundantes, se omitió deliberadamente el almacenamiento de resúmenes nutricionales estáticos en el esquema. En su lugar, los valores nutricionales se calculan dinámicamente en el *frontend* utilizando las métricas base de los ingredientes. Este enfoque evita la necesidad de realizar actualizaciones en cascada cada vez que cambia el perfil nutricional de un ingrediente, delegando cálculos ligeros al dispositivo del usuario y reduciendo la carga en el servidor.
* **Puntuación Nutricional y Preparación para ML (`Puntuacion` y `Verificado`):**  
  * `Puntuacion` representa una calificación nutricional algorítmica derivada del perfil de los ingredientes (independiente de la métrica `Rating` otorgada por los usuarios).
  * `Verificado` funciona como una bandera booleana que determina si la puntuación de la receta ha sido validada y es apta para utilizarse como dato de entrenamiento en el modelo de *machine learning*.
* **Normalización de Porciones (`Porciones`):**  
  El campo `Porciones` especifica el rendimiento base de raciones para las cantidades de ingredientes definidas. Este valor es fundamental para:
  1. Escalar dinámicamente la cantidad de ingredientes cuando el usuario solicita ajustar el número de porciones (ej. para una persona vs. múltiples personas).
  2. Calcular el desglose de macro y micronutrientes por porción individual.
  3. Estandarizar los atributos de entrada para la ingeniería de características del modelo de ML.
* **Mapeo Muchos a Muchos con Ingredientes:**  
  Las recetas mantienen una relación Muchos a Muchos con `Ingredientes` a través de una tabla intermedia (*junction table*). Los ingredientes almacenan la información nutricional fundamental, incluyendo macronutrientes (proteínas, grasas, carbohidratos), calorías totales y sodio. Esto permite a los usuarios registrar ingredientes personalizados basándose en la tabla de información nutricional de productos comerciales, manteniendo el modelo de datos extensible.

### Conexiones Relacionales Adicionales:
* **Categorías (`Categorias`):** Relación Muchos a Uno que define una categoría general para la receta (ej. arroz, pastas, postres). Cada receta pertenece a una sola categoría, la cual también se utiliza como atributo durante el entrenamiento del modelo de ML.
* **Etiquetas (`Etiquetas`):** Relación Muchos a Muchos para descriptores más detallados (ej. *Sin Gluten*, *Fácil de Preparar*, *Cena*).
* **Asociación con Planes Alimenticios:** Se conecta a través de `PlanAlimenticioDia_Receta` para vincular recetas dentro de la programación de un plan de alimentación.

---

## 2. Usuarios (`Usuarios`)

La entidad `Usuarios` modela la identidad de los usuarios a través de roles de cuentas estándar, moderadores y administradores (*superusers*), además de incluir atributos de red social.

### Características Relacionales Clave:
* **Capa Social y de Interacción:** Se conecta con `Comentarios` y `RecetaFavoritos`, permitiendo la participación de la comunidad y la creación de listas de recetas guardadas.
* **Propiedad de Contenido:** Mantiene relaciones Uno a Muchos tanto con `Receta` como con `Ingredientes`, asegurando una clara autoría sobre el contenido generado por los usuarios.
* **Propiedad de Planes Alimenticios:** Mantiene una relación Uno a Muchos con `PlanAlimenticio`, lo que permite a los usuarios crear y persistir planes de alimentación personalizados a lo largo del tiempo.

*(Para más detalles sobre los roles de autorización y alcances de permisos, consultar `Users_and_authorization.md`.)*

---

## 3. Planes Alimenticios (`PlanAlimenticio`)

El subsistema de planificación alimenticia consolida los objetivos del usuario, la programación diaria y el porcionado de recetas en un flujo de trabajo relacional estructurado.

### Jerarquía Relacional y Tablas Auxiliares:
1. **Encabezado del Plan Alimenticio (`PlanAlimenticio`):** Almacena las metas generales del plan, tales como rangos objetivo de macronutrientes y micronutrientes, número de personas a las que está destinado y la duración del plan (ciclos de hasta 7 días).
2. **Desglose Diario (`PlanAlimenticioDia`):** Representa un día específico dentro del periodo planificado, actuando como contenedor padre para la agenda diaria.
3. **Intersección Diaria de Recetas (`PlanAlimenticioDia_Receta`):** Mapea recetas específicas a un día determinado del plan. Incluye un campo personalizado de sobrescritura de porción (`Portion`), permitiendo al usuario ajustar la cantidad a preparar para esa ocasión específica.
4. **Objetivos de IA / ML (`Objetivos_ia`):** Contiene configuraciones predefinidas de metas nutricionales (ej. *Alta en Proteínas*, *Baja en Carbohidratos*) diseñadas para usuarios sin experiencia previa en nutrición. Funciona sin llaves foráneas directas, ya que sus valores son consumidos directamente por el algoritmo de generación de planes alimenticios.
5. **Línea Base Calórica (`Promedio_calorias`):** Tabla utilitaria de un solo registro (*singleton*) no vinculada mediante relaciones directas. El motor de recomendación utiliza este promedio de referencia para normalizar las recetas según su densidad calórica y determinar su puntuación nutricional.

*(Para más detalles sobre el proceso de generación de planes alimenticios, consultar `Meal_plan_creation.md`.)*
