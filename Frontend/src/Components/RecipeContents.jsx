import styles from './RecipeContents.module.css';

export default function RecipeContents(){
    return(
        <div className={styles.recipeContentsContainer}>
            <h4 className={styles.recipeContentsText}>Ingredientes:</h4>
            <div className={styles.recipeContentsUsefulData}>

            </div>
        </div>
    )
}