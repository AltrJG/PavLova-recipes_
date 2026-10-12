## 1. Frontend Architecture (`Client-Side`)

The user interface is built as a Single Page Application (SPA) designed for minimal latency and rich client-side responsiveness.

### Tech Stack & Core Libraries:
* **Framework:** React.js (JavaScript, HTML5, CSS3)
* **State Management:** Functional components with React Hooks for UI state management.
* **Rich Text Editing:** Integrated rich-text editor for user recipe instructions.
* **Data Visualization:** Charting library for dynamic macronutrient distribution pie charts and progress trackers.
* **Document Generation:** Client-side PDF and ZIP compression utilities for generating offline exportable meal plans directly in the browser.

### Architectural Responsibilities:
* **Dynamic Nutrition Computation:** Converts raw ingredient baselines and unit measurements (grams, teaspoons, cups) into calculated macro totals without making round-trip API calls.
* **Combinatorial Planner Engine:** Executes the multi-day greedy heuristic meal-planning algorithm, managing variety decay functions and conditional gap-filling locally in the V8 engine.

---

## 2. Backend Architecture (`Server-Side`)

The backend is built as a RESTful monolith using **Django**, providing enterprise-ready infrastructure out of the box.

### Tech Stack & Core Libraries:
* **Web Framework:** Django (Python)
* **Data Processing:** Pandas (for data restructuring, feature matrix preparation, and normalization pipelines)
* **Machine Learning Runtime:** Scikit-learn (Random Forest Regressor)
* **Data Access:** Django ORM for schema abstraction and SQL query optimization.

### Architectural Responsibilities & Key Decisions:
* **Model Serialization & Inference:** Trained Random Forest model artifacts (`.joblib` / `.pkl`) are loaded into memory during application bootstrap. Unverified recipes trigger lightweight inference requests that return predicted health scores ($0–500$) to the client.
* **Model Training & Bootstrapping Pipeline:** Uses Pandas to aggregate human-verified recipes (`Verificado = True`), execute $K$-fold cross-validation, and evaluate MAE performance metrics.
* **Security & Access Control (RBAC):** Built-in Django authentication/authorization framework managing role hierarchy across **Regular Users**, **Moderators**, and **Administrators**.

---

## 3. Data Flow & Communication Patterns

### Scenario A: Unverified Recipe Inference
1. The Client identifies an unverified recipe required for an automated meal plan.
2. An asynchronous `POST` request carries normalized macronutrient features to the Django inference endpoint.
3. Django routes features to the loaded `scikit-learn` model pipeline.
4. The predicted score is returned as a JSON response and ingested into the client-side planner.

### Scenario B: Meal Plan Persistence & Export
1. The client-side heuristic engine finalizes a multi-day meal schedule.
2. The UI renders an exportable PDF report locally using browser resources.
3. The resulting meal plan schema is posted to Django to be persisted in the relational database via the ORM.

---

## 4. Operational & Performance Benefits

* **Infinite Compute Scalability:** Offloading combinatorial loops and PDF generation to user devices reduces backend CPU usage to near zero.
* **Strict Separation of Concerns:** Clear boundary between presentation/optimization logic (Frontend) and data governance/AI inference (Backend).
* **Maintainability:** Standard Django Model-View-Template (MVC) project structure ensures seamless onboarding for external developers.
