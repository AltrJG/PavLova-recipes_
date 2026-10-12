# Visión General de la Arquitectura del Sistema

## Descripción Ejecutiva
La aplicación sigue una **Arquitectura Cliente-Servidor Desacoplada** compuesta por un *Single-Page Application* (SPA) en React para el *frontend* y una API REST basada en Django para el *backend*.

La arquitectura delega intencionalmente los cálculos combinatorios pesados —como el cálculo nutricional de recetas en tiempo real y la optimización de planes alimenticios de varios días— al **Lado del Cliente (Motor del Navegador)**. Esto mantiene las operaciones del backend sin estado (*stateless*), rápidas y ligeras en cómputo, limitando la actividad del servidor a la persistencia de datos, autenticación e inferencia asíncrona de Inteligencia Artificial.

## 1. Arquitectura del Frontend (`Client-Side`)

La interfaz de usuario está desarrollada como una Aplicación de Página Única (SPA) diseñada para ofrecer mínima latencia y máxima capacidad de respuesta en el cliente.

### Tecnologías y Librerías Principales:
* **Framework Base:** React.js (JavaScript, HTML5, CSS3).
* **Gestión de Estado:** Componentes funcionales con React Hooks para la gestión del estado de la interfaz.
* **Edición de Texto Enriquecido:** Editor integrado para las instrucciones y procedimientos de preparación de recetas.
* **Visualización de Datos:** Librería de gráficos para mostrar dinámicamente gráficos circulares (*pie charts*) de distribución de macronutrientes y barras de progreso.
* **Generación de Documentos:** Utilidades de cliente para la compilación de PDF y compresión ZIP, permitiendo exportar planes alimenticios directamente desde el navegador sin conexión.

### Responsabilidades de la Arquitectura:
* **Cálculo Nutricional Dinámico:** Transforma baselines de ingredientes y unidades de medida (gramos, cucharadas, tazas) en totales de macronutrientes calculados dinámicamente sin peticiones repetitivas al servidor.
* **Motor Planificador Combinatorio:** Ejecuta el algoritmo heurístico codicioso (*greedy*) para planes alimenticios, gestionando funciones de decaimiento de variedad y ajuste condicional de brechas (*gap-filling*) localmente en el motor V8 del navegador.

---

## 2. Arquitectura del Backend (`Server-Side`)

El backend está estructurado como un monolito RESTful utilizando **Django**, proporcionando una infraestructura robusta y lista para producción.

### Tecnologías y Librerías Principales:
* **Framework Web:** Django (Python).
* **Procesamiento de Datos:** Pandas (para reestructuración de datos, preparación de matrices de características y pipelines de normalización).
* **Runtime de Machine Learning:** Scikit-learn (Random Forest Regressor).
* **Acceso a Datos:** ORM de Django para la abstracción del esquema y optimización de consultas SQL.

### Responsabilidades de la Arquitectura y Decisiones Clave:
* **Inferencia y Serialización del Modelo:** Los artefactos del modelo entrenado (`.joblib` / `.pkl`) se cargan en memoria durante el arranque del servidor. Las recetas no verificadas disparan solicitudes de inferencia ligeras que devuelven puntuaciones de salud predichas ($0–500$) al cliente.
* **Pipeline de Entrenamiento y Bootstrapping:** Utiliza Pandas para agregar recetas verificadas por moderadores (`Verificado = True`), ejecutar validación cruzada ($K$-fold) y evaluar métricas de error (MAE).
* **Seguridad y Control de Acceso (RBAC):** Sistema de autenticación/autorización nativo de Django para gestionar la jerarquía de roles entre **Usuarios Regulares**, **Moderadores** y **Administradores**.

---

## 3. Flujo de Datos y Patrones de Comunicación

### Escenario A: Inferencia de Receta No Verificada
1. El cliente identifica una receta no verificada necesaria para un plan alimenticio automático.
2. Una petición `POST` asíncrona envía las características de macronutrientes normalizadas al endpoint de inferencia en Django.
3. Django canaliza las características hacia el modelo cargado en `scikit-learn`.
4. La puntuación predicha se retorna en formato JSON ($<50\text{ms}$) y se integra directamente en el planificador del cliente.

### Escenario B: Persistencia y Exportación de Planes Alimenticios
1. El motor heurístico del cliente finaliza el esquema del plan alimenticio de varios días.
2. La interfaz renderiza el reporte en PDF exportable localmente utilizando los recursos del navegador.
3. El esquema del plan resultante se envía mediante `POST` a Django para ser guardado en la base de datos relacional a través del ORM.

---

## 4. Beneficios Operativos y de Rendimiento

* **Escalabilidad Infinito de Cómputo:** Al delegar bucles combinatorios y generación de archivos PDF a los dispositivos de los usuarios, el consumo de CPU en el servidor se reduce a niveles mínimos.
* **Separación Estricta de Responsabilidades:** Frontera clara entre lógica de presentación/optimización (Frontend) y gobernanza de datos/inferencia de IA (Backend).
* **Mantenibilidad:** La estructura estándar Model-View-Template (MVT/MVC) de Django facilita el entendimiento e incorporación de nuevos desarrolladores al proyecto.
