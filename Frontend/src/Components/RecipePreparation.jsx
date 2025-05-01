import RecipeInstructions from './RecipeInstructions';
import styles from './RecipePreparation.module.css';
import imgTest from '../assets/smile.png';

export default function RecipePreparation({procedimiento}){
    return(
        <div className={styles.recipePreparationContainer}>
            <h4 className={styles.recipeContentsText}>Procedimiento:</h4>
            <div className={styles.recipeContentsUsefulData}>
                <RecipeInstructions recipeProcess={procedimiento}/>
            </div>
        </div>
    )
}