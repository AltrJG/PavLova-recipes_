import styles from "./Recipe.module.css";
import temporaryImage from "../assets/receta_test.jpg";
import { ReactSVG } from "react-svg";
import CardButton from "./CardButton";
import visibilityOnIcon from '../assets/Iconos/eye.svg';
import visibilityOffIcon from '../assets/Iconos/eye-off-outline.svg';
import { Link, useNavigate } from "react-router-dom";

export default function Recipe({ handleVisibility = null, isModificationAllowed = false, recipe, deleteAction, cristal = false, user, isSuperUser, isStaff }){

    const navigate = useNavigate();

    return(
        <div className={`${styles.recipeContainer}  ${cristal ? styles.cristal : ""}`}>
            <Link to={`/receta/${recipe?.receta || recipe?.id}`} style={isModificationAllowed ? { pointerEvents: "none" } : {}} className={styles.recipeImageContent}>
                <img className={styles.recipeImage} src={recipe?.foto_receta || recipe?.receta_imagen_url}/>
                <div className={styles.recipeRating}><ReactSVG src={`/src/assets/Iconos/star.svg`}/>{(recipe?.rating_promedio != 0 && recipe?.receta_rating_promedio != 0) ? (recipe?.rating_promedio?.toFixed(2) || recipe?.receta_rating_promedio?.toFixed(2)) : "Sin Reseñas"}</div>
                { (isSuperUser || isStaff) && <div className={styles.visibilityIndicator}><ReactSVG src={recipe?.visibilidad_estado == 'Publica' ? visibilityOnIcon : visibilityOffIcon}/></div>}
            </Link>
            <Link to={`/receta/${recipe?.receta || recipe?.id}`} className={`${styles.recipeData}`}>
                <h4 className={styles.recipeName}>{recipe?.nombre || recipe?.receta_nombre}</h4>
                {(recipe?.categoria_info?.nombre != null || recipe?.receta_categoria != null) && <p className={styles.recipeCategoria}>{recipe?.categoria_info?.nombre || recipe?.receta_categoria}</p>}
                <p className={styles.recipeAuthor}>{recipe?.creador_info?.name || recipe?.creador_nombre}</p>
                <div className={styles.recipeTime}><ReactSVG src={`/src/assets/Iconos/timer.svg`}/> {` ${recipe?.tiempo_preparacion || recipe?.receta_tiempo_preparacion} Minutos`}</div>
                <div className={styles.recipeDifficulty}><ReactSVG src={`/src/assets/Iconos/flame.svg`}/> {` ${recipe?.tiempo_coccion || recipe?.receta_tiempo_coccion} Minutos`}</div>
            </Link>
            { isModificationAllowed && <CardButton
                text="Cambiar Visibilidad"
                hoverWidth="16rem"
                top={.5}
                left={2}
                icon="eye"
                onClick={() => handleVisibility(recipe.id, recipe.nombre, recipe.visibilidad_estado)}
            /> }
            { isModificationAllowed && (isSuperUser || isStaff || recipe?.creador_info?.id === user?.id) && <CardButton
                text="Editar"
                hoverWidth="8rem"
                top={4.5}
                left={2}
                icon="create"
                onClick={() => navigate(`/crear-receta?recetaEditar=${recipe?.receta || recipe?.id}`)}
            /> }
            { isModificationAllowed && (isSuperUser || isStaff || recipe?.creador_info?.id === user?.id) && <CardButton
                text="Eliminar"
                hoverWidth="10rem"
                top={.5}
                left={80}
                showRight={true}
                icon="trash"
                onClick={() => deleteAction(recipe)}
            /> }
        </div>
    )
}