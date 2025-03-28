import styles from "./Recipe.module.css";
import temporaryImage from "../assets/receta_test.jpg";
import { ReactSVG } from "react-svg";

export default function Recipe(){
    return(
        <div className={styles.recipeContainer}>
            <div className={styles.recipeImageContent}>
                <img className={styles.recipeImage} src={temporaryImage}/>
                <p className={styles.recipeRating}><ReactSVG src={`/src/assets/Iconos/star.svg`}/>4.9</p>
            </div>
            <div className={styles.recipeData}>
                <h4 className={styles.recipeName}>Supreme Pavlova Mexicana Global Mundial</h4>
                <p className={styles.recipeAuthor}>Brandon Yahir Castañeda Godinez</p>
                <p className={styles.recipeTime}><ReactSVG src={`/src/assets/Iconos/timer.svg`}/> 150 Minutos</p>
                <p className={styles.recipeDifficulty}><ReactSVG src={`/src/assets/Iconos/flame.svg`}/> Dificil</p>
            </div>
        </div>
    )
}