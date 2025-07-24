import { useEffect, useState } from "react";
import MainButton from "./MainButton";
import styles from './RecipeRating.module.css';
import { ReactSVG } from "react-svg";
import backendAPI from "../api/axiosConfig";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthProvider";
import { validateCommentData } from "./utils/validators";
import RightSidebarErrors from "./RightSidebarErrors";
import { Link } from "react-router-dom";
import UserComment from "./UserComment";

export default function RecipeRating({recipe_id, setUpdateRecipe, userComentario}){

    const [creating, setCreating] = useState(false);
    const [hovered, setHovered] = useState(0);
    const [selected, setSelected] = useState(0);
    const [isHalf, setIsHalf] = useState(false); // Track if it's a half-star
    const [contenido, setContenido] = useState('');
    const [ isUserEditing, setIsUserEditing ] = useState(false);
    const [ errorsHandler, setErrorsHandler ] = useState({});
    const { refreshAccessToken, isAuthenticated } = useAuth();

    const uploadComment = async e => {
      e.preventDefault();
      let editing = false;
      setErrorsHandler(validateCommentData({contenido, puntuacion: selected}));
      if(Object.keys(errorsHandler).length == 0){
        setCreating(true);
        try{
          if(isUserEditing){
            await backendAPI.patch(`/comentarios/${userComentario.id}/`, {
              puntuacion: selected,
              contenido,
              receta: recipe_id
            });
            editing = true;
            setIsUserEditing(false);
          } else{
            await backendAPI.post(`/comentarios/`, {
              puntuacion: selected,
              contenido,
              receta: recipe_id
            });
          }
          setUpdateRecipe(true);
          Swal.fire({
              icon: "success",
              title: `Comentario ${editing ? "Actualizado" : "Publicado"}`,
              text: `Se ha ${editing ? "actualizado": 'publicado'} tu comentario con exito`,
              showConfirmButton: true,
              customClass: {
                  title: "swal_title",
                  icon: "swal_icon",
                  htmlContainer: "swal_text",
                  confirmButton: "swal_confirm"
              }
          });
        } catch(error){
          if(error.response?.status == 401){
            await refreshAccessToken(uploadComment);
          }
        } finally{
          setCreating(false);
        }
      }
    }

    const deleteComment = async () => {
      try{
          await backendAPI.delete(`/comentarios/${userComentario.id}/`);
          Swal.fire({
              icon: "success",
              title: "Comentario eliminado",
              text: `Se elimino tu comentario de esta receta con exito!`,
              showConfirmButton: true,
              customClass: {
                  title: "swal_title",
                  icon: "swal_icon",
                  htmlContainer: "swal_text",
                  confirmButton: "swal_confirm"
              }
          });
          setUpdateRecipe(true);
      } catch(error){
        if(error.response?.status == 401){
          await refreshAccessToken(deleteComment);
        }
      }
    }

    const askDeleteComment = () => {
      Swal.fire({
          title: `Eliminar comentario?`,
          icon: "question",
          text: `Estas seguro de eliminar tu comentario?`,
          customClass: {
              title: "swal_title",
              icon: "swal_icon",
              htmlContainer: "swal_text",
              confirmButton: "swal_confirm"
          },
          showCancelButton: true,
          cancelButtonText: "Cancelar",
          confirmButtonText: "Eliminar",
          allowOutsideClick: () => !Swal.isLoading()
          }).then((result) => {
          if (result.isConfirmed) {
              deleteComment();
          }
      });
    }
  
    // Handle hover effect to change stars dynamically
    const handleHover = (index, event) => {
      const rect = event.target.getBoundingClientRect(); // Get position of the star
      const mouseX = event.clientX - rect.left; // Get mouse position inside the star
      const isLeftSide = mouseX < rect.width / 2; // Check if mouse is on left side
  
      if (isLeftSide) {
        setHovered(index + 0.5);
        setIsHalf(true);
      } else {
        setHovered(index + 1);
        setIsHalf(false);
      }
    };
  
    // Handle leaving the stars area to reset the hovered state
    const handleLeave = () => {
      setHovered(0);
      setIsHalf(false);
    };
  
    // Handle click to set the selected rating
    const handleClick = () => {
      setSelected(hovered);
    };
  
    // Get the star name based on hover or selected state
    const getStarIcon = (index) => {
      const value = hovered || selected;
  
      if (value >= index + 1) {
        return "star"; // Full star
      } else if (value >= index + 0.5) {
        return "star-half"; // Half star
      }
      return "star-outline"; // Empty star
    };

    const modifyCommentForm = async () => {
      setIsUserEditing(true);
      setSelected(userComentario.puntuacion);
      setContenido(userComentario.contenido);
    };

    return(
        <div className={styles.recipeHeaderRatingFormContainer}>
            <h4 className={styles.recipeHeaderRatingText}>{!isAuthenticated 
              ? <p className={styles.recipeHeaderRatingText}>Para calificar esta receta, debes de <Link to={'/auth/iniciar-sesion'} className={styles.logInButton}><button>Iniciar sesion</button></Link></p> 
              : (Object.keys(userComentario).length != 0 && !isUserEditing) 
              ? "Tu comentario:"
              : (isUserEditing)
              ? "Editando tu comentario:"
              : "Califica esta receta:"}
            </h4>
            { isAuthenticated ?
              (Object.keys(userComentario).length == 0 || isUserEditing)
              ? <><div
                className={styles.recipeHeaderRatingOption}
                onMouseLeave={handleLeave}
            >
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    onMouseMove={(event) => handleHover(index, event)}
                    onClick={handleClick}
                    style={{
                      width: "3.5rem",
                      height: "3.5rem",
                      marginRight: ".5rem",
                      cursor: "pointer",
                      color:
                        hovered > index || selected > index ? "#f7b731" : "#23130d",
                    }}
                  >
                    <ReactSVG
                      src={`/src/assets/Iconos/${getStarIcon(index)}.svg`}
                      className="star-icon"
                    />
                  </div>
               ))}
            </div>
            <form onSubmit={e => uploadComment(e)} className={styles.recipeHeaderRatingForm}>
                <textarea value={contenido} onChange={e => setContenido(e.target.value)} placeholder="Agrega un comentario para esta receta" className={styles.recipeHeaderComment}></textarea>
                <RightSidebarErrors errors={errorsHandler} centered={true}/>
                <MainButton disabled={creating} type="submit" icon="stats-chart" iconSize="2.5" fontSize="2" color="primary" borderRadius="1.5" text={creating ? "Calificando" : "Calificar"}/>
            </form></>
            :<>
              <UserComment key={userComentario.id} comentario={userComentario} showDelete={false}/>
              <div className={styles.commentOptions}>
                <MainButton action={modifyCommentForm} disabled={false} type="button" icon="create" iconSize="2" fontSize="1.5" color="primary" borderRadius="1.5" text={"Editar"}/>
                <MainButton action={askDeleteComment} disabled={false} type="button" icon="close" iconSize="2" fontSize="1.5" color="primary" borderRadius="1.5" text={"Eliminar"}/>
              </div>
            </>
            : null}
        </div>
    )
}