import RecipeHeader from '../Components/RecipeHeader';
import styles from './RecipeDetails.module.css';

export default function RecipeDetails(){
    return(
        <div className={styles.recipeDetailsContainer}>
            <RecipeHeader/>
        </div>
    )
}