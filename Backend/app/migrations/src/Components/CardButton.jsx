import { ReactSVG } from "react-svg";
import styled from "styled-components";

const ToggleButton = styled.button`
  position: absolute;
  display: block;
  top: ${(props) => props.$top}rem;
  left: ${(props) => props.$left}%;
  background: ${(props) => props.$backgroundColor};
  color: white;
  flex-direction: ${(props) => props.$showRight ? 'row-reverse' : 'row'};
  border: none;
  padding: 0.5rem;
  border-radius: 1rem;
  cursor: pointer;
  width: 3.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  transition: 0.3s ease-in-out;
  z-index: 2;
  
  svg {
    width: 2.5rem;
    height: 2.5rem;
    flex-shrink: 0;
  }

  span {
    flex-shrink: 0;
    font-size: 1.4rem;
    font-family: 'Oswald', sans-serif;
    font-weight: 600;
    margin: 0 0.5rem;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }

  &:hover {
    width: ${(props) => props.$hoverWidth || "7rem"};
    transform: ${(props) =>
      props.$showRight
        ? `translateX(-${parseFloat(props.$hoverWidth) / 1.5}rem)`
        : "translateX(0)"};
  }

  &:hover span {
    opacity: 1;
  }

  @media(max-width: 37.5em){
      svg {
      width: 2rem;
      height: 2rem;
    }
  }
`;

export default function CardButton({ text, hoverWidth, top, left, icon, showRight = false, onClick, backgroundColor = '#23130d' }) {
  return (
    <ToggleButton onClick={onClick} $showRight={showRight} $hoverWidth={hoverWidth} $top={top} $left={left} $backgroundColor={backgroundColor}>
      <ReactSVG src={`/assets/Iconos/${icon}.svg`}/>
      <span>{text}</span>
    </ToggleButton>
  );
}