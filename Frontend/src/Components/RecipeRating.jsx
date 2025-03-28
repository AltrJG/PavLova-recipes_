import { useState } from "react";
import MainButton from "./MainButton";
import styles from './RecipeRating.module.css';
import { ReactSVG } from "react-svg";

export default function RecipeRating(){

    const [hovered, setHovered] = useState(0);
    const [selected, setSelected] = useState(0);
    const [isHalf, setIsHalf] = useState(false); // Track if it's a half-star
  
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
            <h4 className={styles.recipeHeaderRatingText}>Califica esta receta:</h4>
            <div
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
            <form className={styles.recipeHeaderRatingForm}>
                <textarea placeholder="Agrega un comentario para esta receta" className={styles.recipeHeaderComment}></textarea>
                <MainButton disabled={false} type="submit" icon="stats-chart" iconSize="2.5" fontSize="2" color="primary" borderRadius="1.5" text={"Calificar"}/>
            </form>
        </div>
    )
}