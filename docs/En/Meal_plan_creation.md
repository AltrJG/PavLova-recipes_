# Meal Plan Creation & Optimization Engine

## Overview
The **Meal Planning Module** serves as the central operational hub of the application, synthesizing user health goals, recipe selection, and nutritional metrics into structured multi-day schedules (up to 7 days). 

### Key Capabilities:
* **Custom Recipe Curation:** Users can assemble plans using self-authored recipes or favorited submissions from the broader community.
* **Nutritional Feedback & Analysis:** Calculates aggregate macro/micronutrient distributions, total caloric load, and sodium levels in real time to generate contextual health recommendations.
* **Dynamic Goal Configuration:** Supports custom nutritional objectives ranging from general wellness to specialized hyper-protein or muscle-growth targets.
* **Automated Ingredient Aggregation:** Automatically compiles a consolidated shopping list of raw ingredients and quantities across all selected recipes for the chosen duration.
* **Export & Portability:** Generates a downloadable PDF report containing the complete plan schedule, nutritional breakdowns, and ingredient lists for offline use or sharing.  
  *(Sample generated export: [plan_alimenticio_2026-01-17_a_2026-01-23.zip](https://github.com/user-attachments/files/33293321/plan_alimenticio_2026-01-17_a_2026-01-23.1.zip))*

Meal plans can be constructed either **manually** with real-time constraint validation or **automatically** via an optimized client-side heuristic engine.

---

## 1. Manual Meal Plan Construction

Users can interactively build multi-day schedules by selecting custom recipe combinations for each designated day.

<img width="1915" height="940" alt="Manual Recipe Picker" src="https://github.com/user-attachments/assets/3a538455-5ee3-405f-b4c4-02f37aa8c0c7" />

*Figure 1: Manual recipe selection interface showcasing personal catalog and community favorite integration.*

### Metabolic Goal Configuration
By default, newly created meal plans initialize using baseline nutritional standards established by the World Health Organization (WHO). Users can customize these targets via two modes:

1. **Advanced Mode (Direct Input):** Allows manual specification of exact daily targets for Calories (kcal), Protein (g), Saturated/Unsaturated/Trans Fats (g), Carbohydrates (g), and Sodium (mg).
2. **Automated Metabolic Calculation:** Evaluates user physical metrics (Weight, Height, Age, Biological Sex, and Physical Activity Factor) to derive daily Total Daily Energy Expenditure (TDEE) targets using the **Mifflin-St Jeor Equation**:

$$\text{BMR}_{\text{male}} = (10 \times \text{weight}_{\text{kg}}) + (6.25 \times \text{height}_{\text{cm}}) - (5 \times \text{age}_{\text{yrs}}) + 5$$

$$\text{BMR}_{\text{female}} = (10 \times \text{weight}_{\text{kg}}) + (6.25 \times \text{height}_{\text{cm}}) - (5 \times \text{age}_{\text{yrs}}) - 161$$

$$\text{TDEE} = \text{BMR} \times \text{Activity Multiplier } (1.2 \text{ to } 1.9)$$

<img width="1915" height="940" alt="Nutritional Objective Configuration" src="https://github.com/user-attachments/assets/c7f76a1b-146a-4af7-a114-787a9e4506eb" />

*Figure 2: Automated metabolic goal configuration panel.*

### Real-Time Validation & Reporting
The client-side engine continuously recalculates daily macro ratios against set goals. If a user exceeds or severely undershoots a recommended threshold, the UI fires real-time warning indicators detailing potential health impacts.

<img width="267" height="359" alt="Nutritional Warning Modal" src="https://github.com/user-attachments/assets/fefdb45f-a978-4bae-b4a2-0d1f5a6b7102" />

*Figure 3: Warning notice triggered when protein intake exceeds daily recommended bounds.*

Plan summaries display nutrient-to-calorie ratios, total ingredient requirements, and day-by-day macro distribution charts, all of which are compiled into the exported PDF document upon creation.

<img width="600" height="732" alt="Nutrient Summary" src="https://github.com/user-attachments/assets/362b2dee-520a-4350-9ed1-fadac97a5d36" />

<img width="405" height="731" alt="Macro Distribution" src="https://github.com/user-attachments/assets/46bbb21d-d10e-42c4-a114-c55e1e26fc50" />

<img width="1109" height="622" alt="Ingredient Aggregation" src="https://github.com/user-attachments/assets/13a27a4a-36ba-42e2-b1eb-047fe429f17b" />

*Figure 4: All the metrics displayed when a meal plan is being created.*

---

## 2. Automated Meal Plan Generation Architecture

The automated planner executes an efficient, **client-side greedy heuristic pipeline with dynamic penalties** to discover optimal recipe combinations without incurring heavy backend computation or network latency.

<img width="1851" height="910" alt="Automatic Configuration Interface" src="https://github.com/user-attachments/assets/c9be4ba0-4b4b-4413-ab9f-a48aa91f447e" />

*Figure 5: Automated planner configuration panel for meal counts, variety parameters, and nutrient weightings.*

### User Preference Parameters:
* **Macronutrient Weighting ($0\% \text{ to } 200\%$):** Adjusts scoring priority relative to caloric density. $100\%$ represents neutral weight, $>100\%$ prioritizes higher macro density, and $<100\%$ penalizes recipes rich in that macro.
* **Sodium Penalty Factor ($0\% \text{ to } 100\%$):** Enforces a strict upper-bound constraint. Recipes approaching or exceeding the daily sodium threshold incur a heavy score reduction, zeroing out recipes that violate limits.
* **Temporal Variety Decay:**
  * **Standard Decay:** Reduces a recipe's base score by a fixed percentage for subsequent days once selected.
  * **Maximum Variety Mode:** Applies an immediate $50\%$ score penalty upon selection, recovering $10\%$ per subsequent unselected day back toward its baseline.

---

### Pipeline Execution Steps (Client-Side)
1. **Score Resolution (Hybrid Inference):**  
   The candidate pool is evaluated. Recipes with human-verified scores (`Verificado = True`) use their ground-truth rating ($y \in [0, 500]$). Unverified user recipes issue an asynchronous request to the backend **Random Forest Regressor** to compute a predicted health score.

2. **Portion Yield Normalization:**  
   Ingredient quantities and macro values are linearly scaled to match the target serving size selected in the configuration.

3. **Preference Re-weighting:**  
   Scores are adjusted based on user-defined macronutrient multipliers ($0\% - 200\%$). The algorithm evaluates each nutrient's proportional energy contribution to the total caloric profile and scales the overall recipe score accordingly.

4. **Greedy Candidate Selection & Conditional Gap-Filling:**  
   Recipes are ranked in descending order of their adjusted scores and selected for each daily slot:
   * **Standard Mode:** Directly assigns the top $K$ highest-scoring recipes for each day.
   * **Auto-Adjust Mode (Conditional Gap-Filling):** If accumulating recipes for a day causes an objective nutrient threshold to be exceeded, the algorithm triggers a targeted search for the **final meal slot of the day**. It selectively swaps the last candidate with a recipe that best balances the remaining macro delta ("fills the gap").

5. **Temporal Penalty Application:**  
   Selected recipes suffer a score penalty based on the active variety mode, updating candidate scores before moving to the next day in the schedule.

---

### Architectural Design Trade-off
By offloading the combinatorial planning math entirely to the client-side JavaScript engine (V8), the algorithm's actual execution time takes **under 100ms of local CPU time**. 

Total end-to-end latency is governed almost entirely by network round-trips for backend API requests (fetching ML predictions for unverified recipes and persisting the final plan payload). This fat-client architecture eliminates heavy server-side processing queues, keeping backend CPU usage near zero and allowing the system to scale infinitely at minimal infrastructure cost.
