import styles from "./RecipeHeader.module.css";
import tempImg from '../assets/receta_test.jpg';
import CircleButton from "./CircleButton";
import RecipeRating from "./RecipeRating";
import RecipeContents from "./RecipeContents";
import RecipeNutritionalFacts from "./RecipeNutritionalFacts";
import RecipePreparation from "./RecipePreparation";
import { ReactSVG } from "react-svg";
import RecipeComments from "./RecipeComments";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import backendAPI from "../api/axiosConfig";
import { FadeLoader } from "react-spinners";

export default function RecipeHeader(){

    let { recipe_id } = useParams();
    const [ receta, setReceta ] = useState({});
    const [ loading, setLoading ] = useState(true);
    console.log("we're going to croak it");

    useEffect(() => {
        const getReceta = async () => {
            const receta = await backendAPI(`recetas/${recipe_id}/`);
            setReceta(receta.data);
            setLoading(false);
        };
        setLoading(true);
        getReceta();
    }, []);

    if (loading) return <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>

    return(
        <div className={styles.recipeHeaderContainer}>
            <div className={styles.recipeHeaderDataContainer}>
                <div className={styles.recipeHeaderData}>
                    <h3 className={styles.recipeHeaderName}>{receta.nombre}</h3>
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
                    <Link to={`/user/${receta.creador_info.id}`} className={styles.recipeHeaderCreator}>
                        <img src={receta.creador_info.profile_picture}/>
                        <p className={styles.recipeHeaderCreatorName}>{receta.creador_info.name}</p>
                    </Link>
                    <p className={styles.recipeHeaderQuote}>{receta.frase}</p>
                    <div className={styles.recipeHeaderActions}>
                        <CircleButton iconName={"heart-outline"} iconSize="3.5rem"/>
                    </div>
                </div>
                <RecipeContents recipe={receta}/>
                <RecipeNutritionalFacts/>
                <div className={styles.recipeHeaderShowTwo}>
                    <RecipeRating/>
                    <RecipeComments/>
                </div>
            </div>
            <div className={styles.recipeImageTagsContainer}>
                <img className={styles.recipeHeaderImage} src={tempImg}/>
                <div className={styles.recipeTags}>
                    {receta.etiquetas_info.map(etiqueta => <p key={etiqueta.id} className={styles.recipeTag}>{etiqueta.nombre}</p>)}
                </div>
                <div className='mobileSpaceProcess'>
                <RecipePreparation procedimiento={JSON.parse(receta.procedimiento)}/>
                </div>
            </div>
        </div>
    )
}