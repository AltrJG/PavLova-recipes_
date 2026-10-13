# User Roles & Access Control Architecture

## Executive Overview
The application enforces a **Role-Based Access Control (RBAC)** model to manage system capabilities, content moderation, and administrative privileges. The platform categorizes access across three primary role tiers:

* **Regular User (`User`):** Standard consumer tier with access to personal recipe management, ingredient creation, profile customization, and meal plan generation.
* **Moderator (`Moderator`):** Content governance tier with elevated privileges to curate global assets, moderate community submissions, and manage system categories.
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

#### Profile & Meal Planning
* **User Profiles:** Customize personal profile information and inspect public catalogs of other users.
* **Meal Planning Engine:** Full access to manual metabolic targets (Mifflin-St Jeor TDEE) and the automated greedy heuristic meal plan generator.

---

### Tier 2: Content Moderator (`Moderator`)
Inherits all **Regular User** capabilities while adding platform governance and curation rights:

* **Global Ingredient Promotion:** Elevate user-created ingredients to `Global` status, making them globally accessible to all system users while locking them from unauthorized end-user edits.
* **Global Content Moderation:** Edit or delete any ingredient, recipe, or community comment across the platform to enforce platform quality and safety standards.
* **Taxonomy Management:** Access the **Categories & Tags Admin Panel** to create, update, or delete system-wide tags and recipe categories (categories with active recipe references are protected from deletion).
* **Preset Goal Curation:** Design and publish pre-configured nutritional preference presets (e.g., *Hyper-Protein*, *Keto*, *Low-Sodium*) to simplify setup for novice users.

---

### Tier 3: Superuser / Administrator (`Superuser`)
Inherits all **Moderator** capabilities and holds exclusive authority over user account management and system AI operations:

* **User Account Management:** Disable or suspend non-superuser accounts to enforce safety policies.
* **Role Escalation:** Promote standard users to `Moderator` status (cannot promote users to `Superuser` unless authenticated via administrative infrastructure).
* **Machine Learning Pipeline Execution:** Manually invoke the backend ML re-training pipeline (`scikit-learn` Random Forest Regressor). This aggregates newly verified ground-truth recipes (`Verificado = True`), re-evaluates $K$-Fold cross-validation metrics, and replaces production model weights if accuracy thresholds (MAE) are improved.
