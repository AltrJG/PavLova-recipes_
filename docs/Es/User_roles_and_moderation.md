# Arquitectura de Roles de Usuario y Control de Acceso (RBAC)

## Descripción Ejecutiva
La aplicación implementa un modelo de **Control de Acceso Basado en Roles (RBAC)** para gestionar las capacidades del sistema, la moderación de contenido y los privilegios administrativos. La plataforma categoriza el acceso en tres niveles principales:

* **Usuario Regular (`User`):** Nivel estándar de consumidor con acceso a la gestión personal de recetas, creación de ingredientes, personalización de perfil y generación de planes alimenticios.
* **Moderador (`Moderator`):** Nivel de gobernanza de contenido con privilegios elevados para curar activos globales, moderar publicaciones de la comunidad, evaluar la puntuación nutricional de recetas y gestionar categorías del sistema.
* **Superusuario / Administrador (`Superuser`):** Nivel de administración del sistema responsable de la gestión de usuarios, escalación de roles, seguridad de cuentas y ejecución del reentrenamiento del modelo de Machine Learning.

## 1. Matriz de Capacidades por Rol

| Capacidad / Recurso | Usuario Regular | Moderador | Superusuario |
| :--- | :---: | :---: | :---: |
| **CRUD de Recetas e Ingredientes Personales** | Completo | Completo | Completo |
| **Favoritos de la Comunidad y Exportación PDF** | Completo | Completo | Completo |
| **Motor de Generación de Planes (Client-Side)** | Completo | Completo | Completo |
| **Promoción de Ingredientes a Nivel Global** | ✖ | Lectura / Escritura | Lectura / Escritura |
| **Moderación de Activos Globales (Eliminar Cualquiera)** | ✖ | Lectura / Escritura | Lectura / Escritura |
| **Gestión de Categorías y Etiquetas** | Solo Lectura | Completo | Completo |
| **Presets de Preferencias Nutricionales** | Solo Lectura | Completo | Completo |
| **Escalación de Roles y Suspensión de Cuentas** | ✖ | ✖ | Completo |
| **Reentrenamiento de ML y Ejecución del Pipeline** | ✖ | ✖ | Completo |

---

## 2. Desglose Granular de Roles

### Nivel 1: Usuario Regular (`User`)
Otorga acceso a todas las funcionalidades requeridas por el usuario final para el catálogo culinario y la planificación alimenticia:

#### Gestión de Ingredientes
* **Acceso al Catálogo:** Visualizar ingredientes personales e ingredientes globales aprobados por moderadores.
* **Creación de Ingredientes:** Registrar nuevos ingredientes no disponibles en el catálogo público definiendo los valores macro y micronutricionales requeridos (Calorías, Proteínas, Carbohidratos, Grasas Saturadas/Insaturadas/Trans y Sodio) junto con una imagen opcional para facilitar su reconocimiento.
* **Derechos de Modificación:** Actualizar o eliminar ingredientes de autoría propia (requiere el envío completo de datos nutricionales al actualizar).

#### Gestión de Recetas e Interacción con la Comunidad
* **Creación de Recetas:** Asimilar recetas utilizando ingredientes accesibles, configurando el rendimiento por porción, metadatos de categoría, etiquetas e instrucciones paso a paso.
* **Control de Visibilidad y Privacidad:** Alternar la visibilidad entre `Pública` (descubrible por la comunidad) y `Privada` (restringida exclusivamente al autor).
* **Consumo de Recetas:** Visualizar desgloses nutricionales completos por porción, renderizar reportes PDF sin conexión y guardar recetas de la comunidad como favoritas para incluirlas en planes alimenticios.
* **Interacción Social:** Publicar comentarios en recetas públicas de la comunidad y eliminar comentarios en recetas de autoría propia.

<img width="1836" height="912" alt="Sección de creación de recetas" src="https://github.com/user-attachments/assets/bdaf1f9f-ecc1-4a17-b9a6-f2198c53ab68" />

*Figura 1: Sección de creación de recetas.*

<img width="1836" height="912" alt="Vista detallada de receta" src="https://github.com/user-attachments/assets/3d574658-d715-417c-bd27-6ce999c9c726" />

*Figura 2: Vista detallada de receta.*

#### Perfil y Planificación Alimenticia
* **Perfiles de Usuario:** Personalizar la información del perfil propio e inspeccionar catálogos públicos de otros usuarios.
* **Motor de Planificación:** Acceso completo a la configuración de objetivos metabólicos manuales (Mifflin-St Jeor TDEE) y al generador automático heurístico *greedy*.

<img width="1836" height="912" alt="Perfil de usuario" src="https://github.com/user-attachments/assets/fa34aa45-d8eb-40be-8cee-130270e8afb0" />

*Figura 3: Interfaz de perfil de usuario.*

---

### Nivel 2: Moderador de Contenido (`Moderator`)
Hereda todas las capacidades del **Usuario Regular** agregando derechos de curaduría y gobernanza en la plataforma:

* **Promoción Global de Ingredientes:** Elevar ingredientes creados por usuarios al estado `Global`, haciéndolos accesibles para toda la comunidad y bloqueando ediciones no autorizadas.
* **Moderación Global de Contenido:** Editar o eliminar cualquier ingrediente, receta o comentario de la comunidad en toda la plataforma para mantener los estándares de calidad y seguridad.
* **Gestión de Taxonomía:** Acceso al **Panel de Administración de Categorías y Etiquetas** para crear, actualizar o eliminar etiquetas y categorías del sistema (las categorías con recetas activas vinculadas están protegidas contra eliminación).
* **Calificación Nutricional de Recetas (`Health Score`):** Asignar manualmente un puntaje en el rango $[0, 500]$ basado en el perfil nutricional de una receta. Esta puntuación sirve como *ground-truth* para el entrenamiento del modelo de IA y fuente de verdad para la creación de planes alimenticios.
* **Curaduría de Presets de Objetivos:** Diseñar y publicar presets de preferencias nutricionales preconfigurados (ej. *Hiperproteico*, *Keto*, *Bajo en Sodio*) para simplificar la configuración a usuarios novatos.

<img width="1836" height="912" alt="Vista de categorías y etiquetas" src="https://github.com/user-attachments/assets/853ed78f-df78-42cd-b27e-eb18e139105e" />

*Figura 4: Vista del panel de categorías y etiquetas.*

<img width="1836" height="912" alt="Modificación de puntuación de receta" src="https://github.com/user-attachments/assets/4ce1a528-c1ef-4f4e-8909-766e0c39f761" />

*Figura 5: Interfaz de asignación y modificación de puntuación de receta.*

---

### Nivel 3: Superusuario / Administrador (`Superuser`)
Hereda todas las capacidades del **Moderador** y posee autoridad exclusiva sobre la gestión de usuarios y operaciones de IA del sistema:

* **Gestión de Cuentas de Usuario:** Deshabilitar o suspender cuentas que no sean superusuarios para hacer cumplir las políticas de seguridad.
* **Escalación de Roles:** Promover usuarios regulares al rol de `Moderador` (no es posible promover a `Superusuario` a menos que se autentique mediante la infraestructura administrativa del servidor).
* **Ejecución del Pipeline de Machine Learning:** Invocar manualmente el reentrenamiento del modelo en el backend (`scikit-learn` Random Forest Regressor). Esto agrega recetas recién verificadas (`Verificado = True`), reevalúa las métricas de validación cruzada ($K$-Fold) y reemplaza los pesos del modelo en producción si se mejoran los umbrales de precisión (MAE).
