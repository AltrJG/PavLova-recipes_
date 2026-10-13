# User Roles & Access Control Architecture

## Executive Overview
The application enforces a **Role-Based Access Control (RBAC)** model to manage system capabilities, content moderation, and administrative privileges. The platform categorizes access across three primary role tiers:

* **Regular User (`User`):** Standard consumer tier with access to personal recipe management, ingredient creation, profile customization, and meal plan generation.
* **Moderator (`Moderator`):** Content governance tier with elevated privileges to curate global assets, moderate community submissions, recipe health scoring and manage system categories.
* **Superuser / Administrator (`Superuser`):** System administrative tier responsible for user management, role escalation, account safety, and triggering Machine Learning model re-training.

## 1. Role Capabilities Matrix

| Capability / Resource | Regular User | Moderator | Superuser |
| :--- | :---: | :---: | :---: |
| **Personal Recipe & Ingredient CRUD** | Full | Full | Full |
| **Community Recipe Favoriting & PDF Export** | Full | Full | Full |
| **Client-Side Meal Plan Generation Engine** | Full | Full | Full |
| **Global Ingredient Promotion** | ✖ | Read / Write | Read / Write |
| **Global Asset & Content Moderation (Delete Any)** | ✖ | Read / Write | Read / Write |
| **Category & Tag Management** | Read Only | Full | Full |
| **Nutritional Preference Presets** | Read Only | Full | Full |
| **User Role Escalation & Account Suspension** | ✖ | ✖ | Full |
| **ML Model Re-Training & Pipeline Execution** | ✖ | ✖ | Full |

---

## 2. Granular Role Breakdown

### Tier 1: Regular User (`User`)
Grants access to all end-user functionality required for culinary cataloging and meal planning:

#### Ingredient Management
* **Catalog Access:** View personal ingredients and global ingredients approved by moderators.
* **Ingredient Creation:** Create custom ingredients missing from the public catalog by defining required macro/micronutrient totals (Calories, Protein, Carbohydrates, Saturated/Unsaturated/Trans Fats, and Sodium) and an optional thumbnail image for visual recognition.
* **Modification Rights:** Update or delete self-authored ingredients (requires complete nutritional payload on update).

#### Recipe Management & Community Interaction
* **Recipe Creation:** Assemble recipes using accessible ingredients, configuring portion yield, category metadata, tags, and step-by-step instructions.
* **Privacy Visibility Controls:** Toggle recipe visibility between `Public` (discoverable by community) and `Private` (restricted exclusively to author).
* **Recipe Consumption:** View full nutritional breakdowns per serving, render offline PDF reports, and favorite community recipes to include them in personalized meal plans.
* **Social Engagement:** Post comments on public community recipes and delete comments on self-authored recipe posts.

<img width="1836" height="912" alt="image" src="https://github.com/user-attachments/assets/bdaf1f9f-ecc1-4a17-b9a6-f2198c53ab68" />
*Figure 1. Recipe creation section*

<img width="1836" height="912" alt="image" src="https://github.com/user-attachments/assets/3d574658-d715-417c-bd27-6ce999c9c726" />
*Figure 2. Recipe view*

#### Profile & Meal Planning
* **User Profiles:** Customize personal profile information and inspect public catalogs of other users.
* **Meal Planning Engine:** Full access to manual metabolic targets (Mifflin-St Jeor TDEE) and the automated greedy heuristic meal plan generator.

<img width="1836" height="912" alt="image" src="https://github.com/user-attachments/assets/fa34aa45-d8eb-40be-8cee-130270e8afb0" />
*Figure 3. Profile of an user*

---

### Tier 2: Content Moderator (`Moderator`)
Inherits all **Regular User** capabilities while adding platform governance and curation rights:

* **Global Ingredient Promotion:** Elevate user-created ingredients to `Global` status, making them globally accessible to all system users while locking them from unauthorized end-user edits.
* **Global Content Moderation:** Edit or delete any ingredient, recipe, or community comment across the platform to enforce platform quality and safety standards.
* **Taxonomy Management:** Access the **Categories & Tags Admin Panel** to create, update, or delete system-wide tags and recipe categories (categories with active recipe references are protected from deletion).
* **Recipe Health Score:** Have the ability to give recipes a score of [0-500] depending on the nutritional contents of a recipe, this score will be used to train the AI-model and a source of truth for the meal plan creation.
* **Preset Goal Curation:** Design and publish pre-configured nutritional preference presets (e.g., *Hyper-Protein*, *Keto*, *Low-Sodium*) to simplify setup for novice users.

<img width="1836" height="912" alt="image" src="https://github.com/user-attachments/assets/853ed78f-df78-42cd-b27e-eb18e139105e" />
*Figure 4. Categories and tags view*

<img width="1836" height="912" alt="image" src="https://github.com/user-attachments/assets/4ce1a528-c1ef-4f4e-8909-766e0c39f761" />
*Figure 5. Recipe score modification*

---

### Tier 3: Superuser / Administrator (`Superuser`)
Inherits all **Moderator** capabilities and holds exclusive authority over user account management and system AI operations:

* **User Account Management:** Disable or suspend non-superuser accounts to enforce safety policies.
* **Role Escalation:** Promote standard users to `Moderator` status (cannot promote users to `Superuser` unless authenticated via administrative infrastructure).
* **Machine Learning Pipeline Execution:** Manually invoke the backend ML re-training pipeline (`scikit-learn` Random Forest Regressor). This aggregates newly verified ground-truth recipes (`Verificado = True`), re-evaluates $K$-Fold cross-validation metrics, and replaces production model weights if accuracy thresholds (MAE) are improved.
