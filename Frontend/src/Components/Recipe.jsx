import styles from "./Recipe.module.css";
import temporaryImage from "../assets/receta_test.jpg";

export default function Recipe(){
    return(
        <div className={styles.recipeContainer}>
            <div className={styles.recipeImageContent}>
                <img className={styles.recipeImage} src={temporaryImage}/>
                <p className={styles.recipeRating}><ion-icon name="star"></ion-icon>4.9</p>
            </div>
            <div className={styles.recipeData}>
                <h4 className={styles.recipeName}>Supreme Pavlova Mexicana Global Mundial</h4>
                <p className={styles.recipeAuthor}>Brandon Yahir Castañeda Godinez</p>
                <p className={styles.recipeTime}><ion-icon name="timer"></ion-icon> 150 Minutos</p>
                <p className={styles.recipeDifficulty}><ion-icon name="flame"></ion-icon> Dificil</p>
            </div>
        </div>
    )
}