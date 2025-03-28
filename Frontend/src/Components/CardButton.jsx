import { ReactSVG } from "react-svg";
import styled from "styled-components";

const ToggleButton = styled.button`
  position: absolute;
  top: ${(props) => props.$top}rem;
  left: ${(props) => props.$left}rem;
  background: #23130d;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 1rem;
  cursor: pointer;
  width: 3.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  transition: width 0.3s ease-in-out;
  
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
  }

  &:hover span {
    opacity: 1;
  }
`;

export default function CardButton({ text, hoverWidth, top, left, icon, onClick }) {
  return (
    <ToggleButton onClick={onClick} $hoverWidth={hoverWidth} $top={top} $left={left}>
      <ReactSVG src={`/src/assets/Iconos/${icon}.svg`}/>
      <span>{text}</span>
    </ToggleButton>
  );
}