import styles from "./Recipe.module.css";
import temporaryImage from "../assets/receta_test.jpg";
import { ReactSVG } from "react-svg";
import CardButton from "./CardButton";

export default function Recipe({ isModificationAllowed = false }){
    return(
        <div className={styles.recipeContainer}>
            <div className={styles.recipeImageContent}>
                <img className={styles.recipeImage} src={temporaryImage}/>
                <div className={styles.recipeRating}><ReactSVG src={`/src/assets/Iconos/star.svg`}/>4.9</div>
            </div>
            <div className={styles.recipeData}>
                <h4 className={styles.recipeName}>Supreme Pavlova Mexicana Global Mundial</h4>
                <p className={styles.recipeCategoria}>Postre</p>
                <p className={styles.recipeAuthor}>Brandon Yahir Castañeda Godinez</p>
                <div className={styles.recipeTime}><ReactSVG src={`/src/assets/Iconos/timer.svg`}/> 20 Minutos</div>
                <div className={styles.recipeDifficulty}><ReactSVG src={`/src/assets/Iconos/flame.svg`}/> 150 Minutos</div>
            </div>
            { isModificationAllowed && <CardButton
                text="Ver Detalles"
                hoverWidth="12rem"
                top={.5}
                left={2}
                icon="eye"
                onClick={() => console.log("Me clickearon")}
            /> }
            { isModificationAllowed && <CardButton
                text="Editar"
                hoverWidth="8rem"
                top={4.5}
                left={2}
                icon="create"
                onClick={() => console.log("Me clickearon")}
            /> }
            { isModificationAllowed && <CardButton
                text="Eliminar"
                hoverWidth="10rem"
                top={.5}
                left={80}
                showRight={true}
                icon="trash"
                onClick={() => console.log("Me clickearon")}
            /> }
        </div>
    )
}