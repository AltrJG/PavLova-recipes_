# Database Design Overview

> **Note:** This document references the Entity-Relationship (ER) diagram below to detail the relational architecture and design decisions behind the core domain models.

<img width="1109" height="1305" alt="image" src="https://github.com/user-attachments/assets/a973ce8f-f4d5-47a8-b657-14b5961dd6c7" />

The database centers around three primary domain entities: **Recipes**, **Users**, and **Meal Plans**. **Recipes** form the operational core of the platform, while **Users** represent the social and administrative backbone.

---

## 1. Recipes (`Receta`)

The `Receta` table serves as the primary entity in the database, establishing relations with nearly all major domain tables. It encapsulates metadata such as recipe name, creator identification, preparation steps, and user-generated ratings.

### Key Architectural & Design Decisions:
* **Client-Side Computed Nutritional Values:** 
  To optimize database performance and eliminate redundant write operations, static nutritional summaries are deliberately omitted from the database schema. Instead, nutritional values are computed dynamically on the client side using ingredient baseline metrics. This approach removes the need for cascading database updates whenever an ingredient's nutritional profile changes, delegating lightweight calculations to user devices and reducing backend server overhead.
* **Nutritional Scoring & ML Readiness (`Puntuacion` & `Verificado`):** 
  * `Puntuacion` represents an algorithmic nutritional score derived from ingredient profiles (distinct from user-submitted `Rating` metrics).
  * `Verificado` acts as a boolean flag indicating whether the recipe’s score is validated and eligible for use as training data for our machine learning model.
* **Portion Normalization (`Porciones`):** 
  The `Porciones` field specifies the baseline serving yield for the recipe's ingredient quantities. This value is critical for:
  1. Dynamically scaling ingredient quantities when users request customized serving sizes (e.g., single-serving vs. multi-serving).
  2. Calculating per-serving macro/micronutrient breakdowns.
  3. Standardizing input features for ML feature engineering.
* **Many-to-Many Ingredient Mapping:** 
  Recipes maintain a Many-to-Many relationship with `Ingredientes` via a junction table. Ingredients store foundational nutritional metrics—including macronutrients (Proteins, Fats, Carbohydrates), Total Calories, and Sodium. Allowing users to register custom ingredients based on standard product packaging labels keeps the data model extensible.

### Additional Relational Hooks:
* **Categories (`Categorias`):** A Many-to-One relationship defining a high-level category (e.g., Rice, Pasta, Dessert). Each recipe belongs to exactly one category, which is also used as a feature during ML training.
* **Tags (`Etiquetas`):** A Many-to-Many mapping for granular descriptors (e.g., *Gluten-Free*, *Quick & Easy*, *Dinner*).
* **Meal Plan Association:** Linked through `PlanAlimenticioDia_Receta` to map recipes into multi-day meal schedules.

---

## 2. Users (`Usuarios`)

The `Usuarios` entity models user identities across standard accounts, moderators, and administrators (superusers), alongside social networking attributes.

### Key Relational Features:
* **Engagement & Social Layers:** Linked to `Comentarios` (Comments) and `RecetaFavoritos` (Favorited Recipes), enabling community engagement and personalized saved lists.
* **Content Ownership:** Maintains One-to-Many relationships with both `Recetas` and `Ingredientes`, enforcing clear user ownership for custom user-generated content.
* **Meal Plan Ownership:** Maintains a One-to-Many relationship with `PlanAlimenticio`, allowing users to build and persist customized meal plans over time.

*(For detailed authorization roles and permission scopes, see `Users_and_authorization.md`.)*

---

## 3. Meal Plans (`PlanAlimenticio`)

The Meal Planning subsystem aggregates user goals, day-level scheduling, and recipe portioning into a structured relational workflow.

### Relational Hierarchy:
1. **Meal Plan Header (`PlanAlimenticio`):** Stores high-level plan targets, such as target macro/micro ranges, target headcount, and plan duration (up to a 7-day cycle).
2. **Daily Breakdown (`PlanAlimenticioDia`):** Represents specific days within a planned period, acting as a parent container for daily schedules.
3. **Daily Recipe Junction (`PlanAlimenticioDia_Receta`):** Maps specific recipes to a designated day within a meal plan. It stores a custom `Portion` override field, allowing users to adjust recipe yields specifically for that meal instance.
4. **Meal plan objectives (`Objetivos_ia`):** Serves as selection of premade configurations that an inexperienced user on nutrition can pick to define the goal of its meal plan, whenever its rich on protein, low on carbs, etc. It does not have any other relation as the values within this table are used for the algorithm that builds the meal plan.
5. **Calories average (`Promedio_calorias`):** Singleton table used for the algorithm to normalize any recipe with the amount of calories stored to determine its nutritional score. 

*(For detailed meal plan generation, see `Meal_plan_creation.md`.)*
