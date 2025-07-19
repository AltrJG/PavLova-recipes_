import styles from "./Recipe.module.css";
import temporaryImage from "../assets/receta_test.jpg";
import { ReactSVG } from "react-svg";
import CardButton from "./CardButton";
import visibilityOnIcon from '../assets/Iconos/eye.svg';
import visibilityOffIcon from '../assets/Iconos/eye-off-outline.svg';
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Recipe({ removeFromPlan, proportion, handlePortionChange = null, portionPicker = false, activeRecipes, recipePickerAction = null, recipePickerActive = false, canUserViewVisibility = false, handleVisibility = null, isModificationAllowed = false, recipe, deleteAction, cristal = false, user, isSuperUser, isStaff }){

    const navigate = useNavigate();
    const [ editorView, setEditorView ] = useState(false);

    return(
        <div onClick={() => recipePickerActive && recipePickerAction(recipe)} className={`${styles.recipeContainer}  ${cristal ? styles.cristal : ""} ${recipePickerActive && (activeRecipes.findIndex(activeRecipe => activeRecipe.id == (recipe?.receta || recipe?.id)) != -1) && styles.selectedRecipe}`}>
            <Link to={`/receta/${recipe?.receta || recipe?.id}`} style={(isModificationAllowed || recipePickerActive || portionPicker) ? { pointerEvents: "none" } : {}} className={styles.recipeImageContent}>
                <img className={styles.recipeImage} src={recipe?.foto_receta || recipe?.receta_imagen_url}/>
                <div className={styles.recipeRating}><ReactSVG src={`/src/assets/Iconos/star.svg`}/>{(recipe?.rating_promedio != 0 && recipe?.receta_rating_promedio != 0) ? (recipe?.rating_promedio?.toFixed(2) || recipe?.receta_rating_promedio?.toFixed(2)) : "Sin Reseñas"}</div>
                { (isSuperUser || isStaff || canUserViewVisibility) && <div className={styles.visibilityIndicator}><ReactSVG src={recipe?.visibilidad_estado == 'Publica' ? visibilityOnIcon : visibilityOffIcon}/></div>}
            </Link>
            <Link to={`/receta/${recipe?.receta || recipe?.id}`} style={(recipePickerActive || portionPicker) ? { pointerEvents: "none" } : {}} className={`${styles.recipeData} ${portionPicker ? styles.separationPicker : ""}`}>
                <h4 className={styles.recipeName}>{recipe?.nombre || recipe?.receta_nombre}</h4>
                {(recipe?.categoria_info?.nombre != null || recipe?.receta_categoria != null) && <p className={styles.recipeCategoria}>{recipe?.categoria_info?.nombre || recipe?.receta_categoria}</p>}
                <p className={styles.recipeAuthor}>{recipe?.creador_info?.name || recipe?.creador_nombre}</p>
                <div className={styles.recipeTime}><ReactSVG src={`/src/assets/Iconos/timer.svg`}/> {` ${recipe?.tiempo_preparacion || recipe?.receta_tiempo_preparacion} Minutos`}</div>
                <div className={styles.recipeDifficulty}><ReactSVG src={`/src/assets/Iconos/flame.svg`}/> {` ${recipe?.tiempo_coccion || recipe?.receta_tiempo_coccion} Minutos`}</div>
                {(isSuperUser || isStaff) && <div className={`${styles.recipeHealthScore} ${recipe?.verificado ? styles.verified : styles.notVerified}`}><ReactSVG src={`/src/assets/Iconos/fitness.svg`}/> {` ${recipe?.puntuacion}`}</div>}
            </Link>
            {portionPicker 
            && <form className={styles.sliderProportionsForm}>
                    <button onClick={() => handlePortionChange(.5, recipe.id, true)} className={styles.sliderProportionsButton} type="button">+</button>
                    <input step={'0.5'} min={.5} max={20} value={proportion?.value} onChange={e => handlePortionChange(e.target.value, recipe.id)} orient="vertical" type="range" className={styles.sliderProportionsSlider}/>
                    <p className={styles.sliderProportionsRef}>{proportion?.value.toFixed(1)}</p>
                    <button onClick={() => handlePortionChange((-.5), recipe.id, true)} className={styles.sliderProportionsButton} type="button">-</button>
            </form>}
            { isModificationAllowed && <CardButton
                text={editorView ? "Cerrar Menu" : "Gestionar Receta"}
                hoverWidth="13rem"
                top={.5}
                left={2}
                icon="ellipsis-vertical-sharp"
                onClick={() => setEditorView(!editorView)}
            /> }
            <div className={`${styles.editorContainer} ${(editorView && isModificationAllowed) ? styles.editorOpen : styles.editorClosed}`}>
                <div className={styles.buttonOptions}>
                    <button className={styles.buttonAction} onClick={() => handleVisibility(recipe.id, recipe.nombre, recipe.visibilidad_estado)}><ReactSVG src={`/src/assets/Iconos/eye.svg`}/>Cambiar Visibilidad</button>
                    <button className={styles.buttonAction} onClick={() => navigate(`/crear-receta?recetaEditar=${recipe?.receta || recipe?.id}`)}><ReactSVG src={`/src/assets/Iconos/create.svg`}/>Editar Receta</button>
                    <button className={styles.buttonAction} onClick={() => deleteAction(recipe)}><ReactSVG src={`/src/assets/Iconos/trash.svg`}/>Eliminar Receta</button>
                </div>
            </div>
            { portionPicker && <CardButton
                text="Eliminar del dia"
                hoverWidth="13rem"
                top={.5}
                left={2}
                icon="trash"
                onClick={() => removeFromPlan(recipe.id)}
            /> }
        </div>
    )
}