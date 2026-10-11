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
<img width="1109" height="622" alt="image" src="https://github.com/user-attachments/assets/13a27a4a-36ba-42e2-b1eb-047fe429f17b" />

All the results of a meal plan are stored in the PDF document that is generated when the user clicks on the button to create it.

## Automatically created meal plans.
User's can create meal plans automatically and adjust the selection so the resulting meal plan with align with the previously defined goals or find a new meal plan selection that they never considered before.
First, an user has to select the configuration of the creation of a new plan, such as the amount of recipes to include, the days they want to define automatically and the configuration or nutritional preferences.
Nutritional preferences can be selected by either using a premade one by a moderator or an administrator and can be configured manually, for example, if you want to prioritize recipes with more protein, you can 
increase the % of protein, so the algorithm gives more priority with recipes whose protein values are more per calories.
1. For all macronutrients the percentage can go from 0% (will actually avoid recipes with higher values of the macronutrient selected) to 200% (will prioritize recipes with the most of this macronutrient) while 100% is the default for all macronutrients. Sodium can only go from 0% to 100% and as this values goes up, it means the user doesnt want sodium, which works as a penalty for the score of a recipe.
2. Variety works in two ways:
   1. by substracting a fixed % defined in user-friendly options of the recipe's final score every day, for example, if a recipe has a score of 360 points, if its chosen in one day, for the next day, that recipe will lose that fixed % of points for that day and again if its chosen again in another day, encouraging the algorithm to consider variety depending on the option chosen by the user.
   2. The most diverse option works diferently, by subtracting 50% of a recipes score for the next day if its chosen for one day, which will remain penalized by that 50% if its chosen again but recover 10% of its score for every day that is not chosen until it is chosen again, which will put it back at the 50% penalized score. It is the option that grants way more variety, hence, this option is represented as such in the client.

<img width="1851" height="910" alt="image" src="https://github.com/user-attachments/assets/c9be4ba0-4b4b-4413-ab9f-a48aa91f447e" />
Figure 4. Automatic meal plan configuration, allows you to pick portions, amount of recipes, days in which the automatic generation take place, how much variety to include for each day and the nutritional preferences.

Then, the user picks all the recipes it wants to use for the days it picked and once all the recipes have been selected, the creation of the meal plan begins:
1. All the recipes are checked to determine whenever they have a score defined by a moderator, if a recipe do, it will use that score for the creation, if it doesnt, it will receive a predicted score from the AI model and that predicted score will be used in the creation.
2. All the recipes will be normalized for the amount of servings the user chose in the configuration.
3. All the recipes's score will be altered depending on the nutritional preferences of the user, first, it will take the nutrients-per-calories ratio, this works by determining how much % each nutrient consist its calories from the recipe. The resulting percentages for each nutrient will also be normalize so when we add up all values we get 100%, which in this case, is the total score of the recipe and we will multiply the nutrients by the amount of the priorities of the user, meaning, if protein was selected to have 150% and a given recipe that has a score of 360 which 40% of that score comes from protein. The percentage itself will be multiplied by 1.5 (equal to 150%), which means protein now has a 60%, this process is repeated for every nutrient that is not sodium, we add up all the resulting percentages, if the final percentage is higher than 100%, then that percentage will increase the final score of a recipe. Finally, for sodium, we take the recipe's sodium and divide it by the sodium defined by the nutritional objectives then we multiply by the % of the preferences of sodium, meaning that if a recipe has 2300mg and the objective for sodium was a maximum of 2300mg and the user selects 100% of penalty, this means that the recipe will have 0 points, meaning the recipe will never ever appear in the meal plan.
4. All recipes will be sorted from highest score to lowest score and then, we finally pick the recipes for the meal plan, which will pick depending whenever the auto-adjust is on or off:
    1. If the auto adjust is off, it will simply take the amount of recipes defined by an user for that day.
    2. If the auto adjust is on, in the event that a nutrient exceeds a nutritional objective, it will instead search for a recipe that better "fills the nutritional gaps", which means a recipe that can fill the nutritional goals better will be the last one to be picked for the day.
5. Finally, all the recipes that were picked for the day will receive a penalty depending on the selection of the user and continue to the next day until all the days have receive the recipes.

All this automatic process results in a meal plan that can either prioritize the goals of the user, experiment with how different preferences could impact its health or simply learn how unhealthy a recipe selection can be.
The automatic meal plan can be edited manually by the user or it can run the automatic selection once again.
