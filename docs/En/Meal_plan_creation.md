## Meal plan creation
Meal plan creation is one of the most important aspects of this projects. In this module, users can create meal plans with recipes of their liking and receive useful feedback, such as the following:
- Users can pick recipes that they either created or marked recipes from other users as their favorites.
- Can learn the nutritional profile of their meal plan after they created it, such as the macronutrients, sodium and total calories, by which the system can then give recommendations.
- Adjust the nutritional objectives that users want to achieve, which can go from a simple, healthy meal plan or one focused on muscle-growth.
- Learn the neccesary ingredients needed to make all the recipes of their choice.
- Download the meal plan in PDF format if they want to have it available locally or share it with others (below there is a zip file, which contains the result of a created meal plan by an user):
[plan_alimenticio_2026-01-17_a_2026-01-23 (1).zip](https://github.com/user-attachments/files/33293321/plan_alimenticio_2026-01-17_a_2026-01-23.1.zip)

Meal plans can be created either manually or automatically with the help of an AI-Model that searches for the optimal combination that aligns with the user's goals.

## Manually-created meal plans.
Users can create meal plans that can range up to a week (7 days) and use different sets of recipes for every day:
<img width="1915" height="940" alt="image" src="https://github.com/user-attachments/assets/3a538455-5ee3-405f-b4c4-02f37aa8c0c7" />
Figure 1. The manual recipe picker for the meal plan, it allows user to click on any recipe that is either theirs or a favorite from another user.

By default, all newly created meal plans share a set of nutritional goals that start with the minimum recommended of every nutrient by the WHO organization and it can be changed in 2 ways:
- Manually: Advance users can manually input all the nutritional goals that they have for that meal plan, they pick the amount of Calories (kcal), Protein (grams), Saturated fats (grams), Insaturated fats (grams), Carbohydrates (grams) Trans fats (grams) and sodium (miligrams).
- Automatically: Amateur users input basic nutritional information about their health, such as their weight, height, age, genre and how often they exercise, we use the Harris benedict formula that is as it follows:

(10 * weight) + (6.25 * height) - (5 * age) + 5 * exercise_intensity (1.2-1.9 depending on intensity) -- for male users

(10 * weight) + (6.25 * height) - (5 * age) - 161 * exercise_intensity (1.2-1.9 depending on intensity) -- for female users

<img width="1915" height="940" alt="image" src="https://github.com/user-attachments/assets/c7f76a1b-146a-4af7-a114-787a9e4506eb" />
Figure 2. The nutrition objective configuration, it currently displays the automatic option of an user.

All these recommended values are used to warn the user if it overeats or undereats in one nutrient, giving simple advice of the consequences of ignoring that difference.

<img width="267" height="359" alt="image" src="https://github.com/user-attachments/assets/fefdb45f-a978-4bae-b4a2-0d1f5a6b7102" />

Figure 3. An example of a warning that pops up when the app detects that the user overeats protein.

All the results are also shown, such as the nutrients-per calories ratio, ingredients needed and nutritional values:
<img width="395" height="732" alt="image" src="https://github.com/user-attachments/assets/46bbb21d-d10e-42c4-a114-c55e1e26fc50" />
<img width="405" height="321" alt="image" src="https://github.com/user-attachments/assets/362b2dee-520a-4350-9ed1-fadac97a5d36" />

All the results of a meal plan are stored in the PDF document that is generated when the user clicks on the button to create it.

## Automatically created meal plans.
