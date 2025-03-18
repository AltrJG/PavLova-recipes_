import styles from "./RecipeHeader.module.css";
import tempImg from '../assets/receta_test.jpg';
import tempUser from '../assets/smile.png';
import CircleButton from "./CircleButton";

export default function RecipeHeader(){
    return(
        <div className={styles.recipeHeaderContainer}>
            <div className={styles.recipeHeaderData}>
                <h3 className={styles.recipeHeaderName}>Pavlova suprema mexicana global mundial</h3>
                <p className={styles.recipeHeaderType}>Postre</p>
                <div className={styles.recipeHeaderRating}>
                    <ion-icon name="star"></ion-icon>
                    <ion-icon name="star"></ion-icon>
                    <ion-icon name="star"></ion-icon>
                    <ion-icon name="star"></ion-icon>
                    <ion-icon name="star"></ion-icon>
                    <p className={styles.recipeRatingText}>Promedio: 4.5</p>
                </div>
                <div className={styles.recipeHeaderCreator}>
                    <img src={tempUser}/>
                    <p className={styles.recipeHeaderCreatorName}>Brandon Yahir Castañeda Godinez</p>
                </div>
                <p className={styles.recipeHeaderQuote}>La supremacia de las pavlovas ha llegado a la pagina web, esta es una receta que talvez no conozcas, pero no te arrepentiras de cocinarla.</p>
                <div className={styles.recipeHeaderActions}>
                    <CircleButton iconName={"heart-outline"} iconSize="3.5rem"/>
                </div>
            </div>
            <img className={styles.recipeHeaderImage} src={tempImg}/>
        </div>
    )
}