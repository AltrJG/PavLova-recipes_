import styled from "styled-components"
import styles from './ShowImage.module.css'

const DisplayedImage = styled.img`
    
    background-color: #23130d;
    padding: 1rem;
    border-radius: 1rem;
    width: ${(props) => props.$width}rem;
    height: ${(props) => props.$height}rem;
`;

const ImageContainer = styled.section`
  position: absolute;
  z-index: 2;
  left: ${(props) =>
    props.$position === "Right"
      ? `calc(100% + 1.5rem)` // Posiciona a la derecha con margen
      : props.$position === "Top"
      ? "0%"
      : `calc(100% + 1rem)`};
  top: ${(props) =>
    props.$position === "Right"
      ? `calc(50% - ${props.$height / 2}rem)` // Centra verticalmente
      : props.$position === "Top"
      ? `calc(-${props.$height}rem - 1.5rem)` // Ajusta dinámicamente hacia arriba
      : "100%"};
  transform: ${(props) =>
    props.$position === "Top" ? "translateX(-50%)" : "none"};
  transition: 0.3s;

  &::after {
    content: "";
    position: absolute;
    top: ${(props) =>
      props.$position === "Top"
        ? "98%"
        : props.$position === "Right"
        ? "50%"
        : "0%"};
    left: ${(props) =>
      props.$position === "Top"
        ? "20%"
        : props.$position === "Right"
        ? "-5%"
        : "50%"};
    background-color: #23130d;
    width: 1.5rem;
    height: 1.5rem;
    transform: ${(props) =>
      props.$position === "Top"
        ? "translateX(-50%) rotate(180deg)"
        : "translateY(-50%)"};
    clip-path: ${(props) =>
      props.$position === "Right"
        ? "polygon(0 50%, 100% 100%, 100% 0)"
        : props.$position === "Top"
        ? "polygon(50% 0%, 0% 100%, 100% 100%)"
        : "polygon(0 50%, 100% 100%, 100% 0)"};
  }
`;

export default function ShowImage({text, image, width, height, hasImage, position}){
    return(
        <div className={styles.showImageContainer}>
            <p className={`${styles.showImageText} ${position == "Top" ? styles.textTop : styles.textRight} ${hasImage ? styles.textHighlight : ""}`}>{text}</p>
            {hasImage && <ImageContainer $width={width} $height={height} $position={position}><DisplayedImage $width={width} $height={height} src={image}/></ImageContainer> }
        </div>
    )
}