import { useState } from "react";
import MainButton from "./MainButton";
import styles from './RecipeRating.module.css';
import { ReactSVG } from "react-svg";
import backendAPI from "../api/axiosConfig";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthProvider";
import { validateCommentData } from "./utils/validators";
import RightSidebarErrors from "./RightSidebarErrors";
import { Link } from "react-router-dom";

export default function RecipeRating({recipe_id, setUpdateRecipe}){

    const [creating, setCreating] = useState(false);
    const [hovered, setHovered] = useState(0);
    const [selected, setSelected] = useState(0);
    const [isHalf, setIsHalf] = useState(false); // Track if it's a half-star
    const [contenido, setContenido] = useState('');
    const [ errorsHandler, setErrorsHandler ] = useState({});
    const { refreshAccessToken, isAuthenticated } = useAuth();

    const uploadComment = async e => {
      e.preventDefault();
      setErrorsHandler(validateCommentData({contenido, puntuacion: selected}));
      if(Object.keys(errorsHandler).length == 0){
        setCreating(true);
        try{
          await backendAPI.post(`/comentarios/`, {
            puntuacion: selected,
            contenido,
            receta: recipe_id
          });
          setUpdateRecipe(true);
          Swal.fire({
              icon: "success",
              title: "Comentario Publicado",
              text: "Se ha publicado tu comentario con exito",
              showConfirmButton: true,
              customClass: {
                  title: "swal_title",
                  icon: "swal_icon",
                  htmlContainer: "swal_text",
                  confirmButton: "swal_confirm"
              }
          });
        } catch(error){
          console.log(error);
          if(error.response?.status == 401){
            await refreshAccessToken(uploadComment);
          }
        } finally{
          setCreating(false);
        }
      }
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

    return(
        <div className={styles.recipeHeaderRatingFormContainer}>
            <h4 className={styles.recipeHeaderRatingText}>{isAuthenticated ? "Califica esta receta:" : <p className={styles.recipeHeaderRatingText}>Para calificar esta receta, debes de <Link to={'/auth/iniciar-sesion'} className={styles.logInButton}><button>Iniciar sesion</button></Link></p>}</h4>
            { isAuthenticated && 
            <><div
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
                <textarea onChange={e => setContenido(e.target.value)} placeholder="Agrega un comentario para esta receta" className={styles.recipeHeaderComment}></textarea>
                <RightSidebarErrors errors={errorsHandler} centered={true}/>
                <MainButton disabled={creating} type="submit" icon="stats-chart" iconSize="2.5" fontSize="2" color="primary" borderRadius="1.5" text={creating ? "Calificando" : "Calificar"}/>
            </form></>}
        </div>
    )
}