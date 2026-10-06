# AI-Powered Recipe Nutritional Scoring Engine

## Executive Overview
The **Nutritional Scoring Module** automatically evaluates the health profile of user-submitted recipes on a standardized **0–500 scale**. By combining frontend client-side nutrition calculations with a backend **Random Forest Regressor**, the platform delivers real-time health metrics and automated meal-plan recommendations without requiring manual human review for every newly created recipe.

---

## Data Pipeline & Supervised Bootstrapping

To train an initial model without relying on external proprietary scoring APIs, we implemented a **supervised human-in-the-loop (HITL) bootstrapping pipeline**:

1. **Client-Side Real-Time Calculation:**
   When a user creates or modifies a recipe, ingredient quantities and unit measurements (e.g., grams, tablespoons) are calculated on the frontend. This computes per-serving macronutrient totals (Proteins, Fats, Carbohydrates, Sodium, Calories) in real time, avoiding heavy backend aggregation overhead.

2. **Ground-Truth Labeling (Moderator Bootstrapping):**
   System administrators and nutrition moderators review a baseline subset of recipes, assigning a verified health score ($y \in [0, 500]$) based on category and macro profiles. Once verified, these recipes are flagged in the database (`Verificado = True`) to serve as our gold-standard training set.

---

## Machine Learning Architecture & Feature Engineering

### Algorithm Selection: Random Forest Regressor
We selected a **Random Forest Regressor** over simple linear models for two key reasons:
* **Non-Linear Category Context:** Macro profiles alone (e.g., high fat/protein) don't capture full nutritional context. By including the categorical feature (`Categorias`), the model learns category-specific baselines (e.g., evaluating a high-fat dessert differently than a high-fat main dish).
* **Robustness to Noise & Small Sample Sizes:** Ensemble tree models handle non-linear feature interactions well and resist overfitting during initial dataset growth.

### Preprocessing & Normalization Pipeline
Before training, data is transformed through a multi-step feature engineering pipeline:

1. **Portion Normalization:**
   All recipe metrics are standardized to a single baseline serving size using unit-conversion modifiers:
   $$\text{Normalized Nutrient} = \frac{\text{Nutrient Quantity} \times \text{Measurement Modifier}}{\text{Recipe Servings}}$$

2. **Caloric Standardization & Feature Reduction:**
   To isolate nutrient density from raw volume, we compute a single-row reference average (`Promedio_calorias`) across all training recipes. Nutrient features are scaled relative to this caloric baseline. Because all input features are calorie-adjusted, raw **Calories** are dropped prior to training to eliminate redundant variance and feature noise.

---

## Model Training, Validation & Deployment

1. **Validation Strategy:**
   The model is trained using **K-Fold Cross-Validation** to ensure generalizability across diverse recipe categories and prevent overfitting on regional ingredients.

2. **Performance Metrics:**
   Model accuracy is evaluated against a target **Mean Absolute Error (MAE) threshold of 50 points** (10% on the 0–500 scale). Automated reports are emitted to administrators to determine whether model weights are ready for production or require additional ground-truth samples.

3. **Inference & Fallback Strategy in Meal Planning:**
   When generating automated meal plans, the system checks the recipe's verification status:
   * **Verified Recipes:** Use the human-assigned ground-truth score directly for maximum accuracy.
   * **Unverified / User-Generated Recipes:** Pass through the inference pipeline (caloric standardization -> model prediction) to dynamically compute an estimated health score in milliseconds.

This hybrid approach allows the platform to scale its recipe catalog infinitely while maintaining consistent quality in automated meal plan generation.
