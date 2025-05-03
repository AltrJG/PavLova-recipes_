import React from "react";
import { ReactSVG } from "react-svg";
import styled from "styled-components";

const ActionButton = styled.button`
  border-radius: 50%;
  padding: 1.2rem;
  background: linear-gradient(315deg, rgba(241,180,52,1) 27%, rgba(252,115,2,1) 100%);
  position: relative;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;

  & svg{
    transition: .3s;
    z-index: 2;
    width: ${(props) => props.$iconSize} !important;
    height: ${(props) => props.$iconSize} !important;
  }

  & div{
    z-index: 1;
  }
  
  &::before {
    content: "";
    top: 50%;
    border-radius: 50%;
    left: 50%;
    transition: .3s;
    width: 85%;
    position: absolute;
    height: 85%;
    transform: translate(-50%, -50%);
    background-color: transparent;
    z-index: 1;
  }

  &:hover::before {
    background-color: #23130d;
  }

  &:hover svg {
    color: orange !important;
  }

  &:hover span {
    opacity: 1;
    top: ${(props) => !props.$top ? "120%" : "-80%"};
    transform: translateX(-50%) scale(1);
  }
`;

const Tooltip = styled.span`
  transition: .5s;
  display: block;
  opacity: 0;
  position: absolute;
  top: 50%; 
  left: 50%;
  transform: translateX(-50%) scale(0.1);
  background-color: #23130d;
  font-size: 1.4rem;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-family: 'Oswald', sans-serif;
  font-weight: 500;
  white-space: nowrap;

  &::before {
    content: "";
    background-color: #23130d;
    width: 3rem;
    height: 1rem;
    position: absolute;
    top: ${(props) => !props.$top ? "-25" : "100"}%;
    left: 50%;
    transform: translateX(-50%);
    clip-path: polygon(50% ${(props) => !props.$top ? "0%" : "100%"}, 0% ${(props) => !props.$top ? "100%" : "0%"}, 100% ${(props) => !props.$top ? "100%" : "0%"});
  }
`;

const CircleButton = ({ iconName = "heart-outline", iconSize = "3rem", text = "Agregar a favoritos", top = false, action = null, args = null }) => {
  return (
    <ActionButton onClick={() => action != null && action(...args)} $iconSize={iconSize} $top={top}>
      <ReactSVG src={`/src/assets/Iconos/${iconName}.svg`}/>
      <Tooltip $top={top}>{text}</Tooltip>
    </ActionButton>
  );
};

export default CircleButton;