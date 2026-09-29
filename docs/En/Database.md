# Database design
Note: the following ER Diagram will be used as a reference to explain it's design:
<img width="1109" height="1305" alt="image" src="https://github.com/user-attachments/assets/a973ce8f-f4d5-47a8-b657-14b5961dd6c7" />

The most important tables in our database is the table of recipes, meal plan and users, recipes holding the building blocks of most of the functionality of this project and users who are those that will use the social media app.

## Recipes
The recipes table holds a relation to almost all other tables in our database, it contains the basic information of a recipe, such as its name, who made it, how to prepare it and how other users rate the recipe.
There are key points in this recipe that are in purpose to its design:
- The actual nutritional information isnt actually stored in the database, this is because the nutritional information is calculated in real time by an algorithm that runs in the frontend side of the project, this way, we avoid storing this information and updating it every time the nutritional values of the ingredients or when the ingredients needed for the recipe changes. Leaving this responsability to the frontend allows us to release some resources from the backend server, as the calculation itself of the nutritional information is rather lightweight and is an opeation the device of an user can perform with ease.
- There are two columns that are named as "Puntuacion (score)" and "Verificado (verified)", score being a nutritional score of the recipe (not to be confused with "Rating" as this is a user's metric) and verified serving as a flag that determines whenever the recipe's score can be used to trarin the machine learning algorithm.
- "Porciones (portions)" is actually a reference to know how many people can eat, given the amount of ingredients given by the user, this metric is vital, as it allows us to adjust this value and give the user the amount of ingredients needed to prepare the recipe for one person. It is also useful for users to learn the nutritional values of a recipe for one serving and for normalization purposes for the machine learning algorithm.
- Recipes has a many-to-many relation to the table "ingredientes (ingredients)", this is because, as mentioned previously, a recipe is made out of ingredients, and these ingredients hold the nutritional values that we require to determine the nutritional profile of a recipe, it includes all macronutrients (Fats, Protein, Carbohidrates), calories and sodium. This decision was to make sure users only needed the nutritional information provided by the table of contents of several products and ingredients, to make it easy for them to register new ingredients that werent available in the selection of ingredients.
- Recipes also have relationships to other tables, such as the following:
  - Categorias (Categories): A generic category for the recipe, a recipe can be of the category of rice, spaguetti, dessert, etc. Recipes can only have one category at a time. It is worth mentioning that this value is also used in the training of the machine learning algorithm.
  - Etiquetas (tags): Tags are more descriptive features of a recipe, which might be gluten-free, easy to make, perfect for dinners, etc.
  - PlanAlimenticio_dia (mealPlan_day): It is used to determine which recipes are used in a meal plan, more on that later.
 

## Users
Users are also a vital component of our project, as those represent the people who use it, the database holds basic social information about each user, whenever they want to add another link to a different social media site and whenever the user is a regular user, a moderator or an administrator (super user). Users have other several features:
- User's table has a relation to the tables "Comentarios (comments)" and "RecetaFavoritos (recipeFavorites)", these two tables represent the ability users have to leave a comment on a recipe and add them as part of their favorite recipes of another users.
- An user can create as many recipes as it wants, as every recipe must belong to one user.
- An user can also create as many ingredients as it wants, as every ingredient must belong to one user.
- An user can create meal plans that belong to them, as it is stated in the relationship between the table users and "PlanAlimenticio (mealPlan)".
Note: The actions and how they interact with the system are described more in-depth in the "Users_and_authorization.md" file.
