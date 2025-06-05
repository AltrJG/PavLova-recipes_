import styles from "./Recipe.module.css";
import temporaryImage from "../assets/receta_test.jpg";
import { ReactSVG } from "react-svg";
import CardButton from "./CardButton";
import { Link, useNavigate } from "react-router-dom";

export default function Recipe({ isModificationAllowed = false, recipe, deleteAction, cristal = false, user, isSuperUser, isStaff }){

    const navigate = useNavigate();

    return(
        <div className={`${styles.recipeContainer}  ${cristal ? styles.cristal : ""}`}>
            <Link to={`/receta/${recipe?.id}`} style={isModificationAllowed ? { pointerEvents: "none" } : {}} className={styles.recipeImageContent}>
                <img className={styles.recipeImage} src={recipe?.foto_receta}/>
                <div className={styles.recipeRating}><ReactSVG src={`/src/assets/Iconos/star.svg`}/>{recipe?.rating_promedio != 0 ? recipe?.rating_promedio : "Sin Reseñas"}</div>
            </Link>
            <Link to={`/receta/${recipe?.id}`} className={`${styles.recipeData}`}>
                <h4 className={styles.recipeName}>{recipe?.nombre}</h4>
                {recipe?.categoria_info?.nombre != null && <p className={styles.recipeCategoria}>{recipe?.categoria_info?.nombre}</p>}
                <p className={styles.recipeAuthor}>{recipe?.creador_info?.name}</p>
                <div className={styles.recipeTime}><ReactSVG src={`/src/assets/Iconos/timer.svg`}/> {` ${recipe?.tiempo_preparacion} Minutos`}</div>
                <div className={styles.recipeDifficulty}><ReactSVG src={`/src/assets/Iconos/flame.svg`}/> {` ${recipe?.tiempo_coccion} Minutos`}</div>
            </Link>
            { isModificationAllowed && <CardButton
                text="Cambiar Visibilidad"
                hoverWidth="16rem"
                top={.5}
                left={2}
                icon="eye"
                onClick={() => console.log("Me clickearon")}
            /> }
            { isModificationAllowed && (isSuperUser || isStaff || recipe?.creador_info?.id === user?.id) && <CardButton
                text="Editar"
                hoverWidth="8rem"
                top={4.5}
                left={2}
                icon="create"
                onClick={() => navigate(`/crear-receta?recetaEditar=${recipe.id}`)}
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