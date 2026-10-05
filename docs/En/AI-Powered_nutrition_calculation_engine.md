# AI-Powered nutrition calculation
The goal of this module in the project is to determine how healthy or unhealthy a recipe is based on the nutritional profile of a given recipe, to determine this, the following steps are performed to receive a close estimate of the recipe's nutritional score

## Users and moderators
1. First, when an user creates a recipe, the nutritional profile of that recipe is calculated on real-time in the frontend with the help of the stored nutritional information of each recipe, each containing how much and what measurement is used (grams, teaspoon, tablespoon, etc), then, calculating the sum of all the
ingredients based on their nutritional information and portion, the nutritional profile of a recipe is calculated and can be adjusted for different amount of servings.
2. Then, either a moderator or administrator (superuser) checks the nutritional profile and what category the recipe belongs to (rice, spaguetti, dessert, etc) and assigns a score between 0 and 500, where 0 means very unhealthy and 500 is very healthy. With enough recipes, we can learn the general nutritional trend
of the recipes of a category and what metrics improve score and which metrics downgrade the healthyness of a recipe.

## Machine learning algorithm training
First and foremost, the model itself that determines the healthyness of a recipe is a random forest regressor, the explanation for this choice is the following:
- Random forest regressor solves an important problem: Since the amount of nutrients that we reference to obtain the general healthyness of a recipe (Fats, Protein, Carbohydrates, Calories and sodium) arent enough to tell the whole picture, we used them alongside the category of the recipe, this way, even if 2
different foods shared similar nutritional scores but had important differences that the nutritional information cannot tell us, the algorithm would "infer" those differences by taking a look at how the category of a dish health range was while keeping the required information simple.
