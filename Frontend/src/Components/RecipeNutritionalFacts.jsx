import styles from './RecipeNutritionalFacts.module.css';

export default function RecipeNutritionalFacts(){
    return(
        <div className={styles.recipeNutritionContainer}>
            <h4 className={styles.recipeContentsText}>Informacion Nutricional:</h4>
            <div className={styles.recipeContentsUsefulData}>

            </div>
        </div>
    )
}