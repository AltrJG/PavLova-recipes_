import styles from "./RecipeHeader.module.css";
import tempImg from '../assets/receta_test.jpg';
import tempUser from '../assets/smile.png';
import CircleButton from "./CircleButton";
import RecipeRating from "./RecipeRating";
import RecipeContents from "./RecipeContents";
import RecipeNutritionalFacts from "./RecipeNutritionalFacts";
import RecipePreparation from "./RecipePreparation";
import { ReactSVG } from "react-svg";
import RecipeComments from "./RecipeComments";

export default function RecipeHeader(){

    return(
        <div className={styles.recipeHeaderContainer}>
            <div className={styles.recipeHeaderDataContainer}>
                <div className={styles.recipeHeaderData}>
                    <h3 className={styles.recipeHeaderName}>Pavlova suprema mexicana global mundial</h3>
                    <p className={styles.recipeHeaderType}>Postre</p>
                    <div className={styles.recipeHeaderRating}>
                        <div className={styles.recipeHeaderStars}>
                            <ReactSVG src={`/src/assets/Iconos/star.svg`}/>
                            <ReactSVG src={`/src/assets/Iconos/star.svg`}/>
                            <ReactSVG src={`/src/assets/Iconos/star.svg`}/>
                            <ReactSVG src={`/src/assets/Iconos/star.svg`}/>
                            <ReactSVG src={`/src/assets/Iconos/star.svg`}/>
                        </div>
                        <p className={styles.recipeRatingText}>Promedio: 4.5 (10)</p>
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
                <RecipeContents/>
                <RecipeNutritionalFacts/>
                <div className={styles.recipeHeaderShowTwo}>
                    <RecipeRating/>
                    <RecipeComments/>
                </div>
            </div>
            <div className={styles.recipeImageTagsContainer}>
                <img className={styles.recipeHeaderImage} src={tempImg}/>
                <div className={styles.recipeTags}>
                    <p className={styles.recipeTag}>Economico</p>
                    <p className={styles.recipeTag}>Economico</p>
                    <p className={styles.recipeTag}>Economico</p>
                    <p className={styles.recipeTag}>Economico</p>
                    <p className={styles.recipeTag}>Economico</p>
                    <p className={styles.recipeTag}>Economico</p>
                    <p className={styles.recipeTag}>Economico</p>
                </div>
                <RecipePreparation/>
            </div>
        </div>
    )
}