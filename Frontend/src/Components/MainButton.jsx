import { ReactSVG } from "react-svg";
import styled from "styled-components"

const colors = {
    primary: "#23130d",
    secondary: "#fc9003"
};

const Button = styled.button`
    font-size: ${({ $fontSize }) => $fontSize}rem;
    background-color: ${({ disabled, $color }) => (disabled ? "gray" : colors[$color] + "a1")};
    border: ${({ disabled, $color }) => (disabled ? "gray" : colors[$color])} .2rem solid;
    border-radius: ${({ $borderRadius }) => $borderRadius}rem;
    color: white;
    padding: 0.5rem 2rem 0.5rem 1rem;
    font-family: "Oswald", sans-serif;
    transition: 0.3s;
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
    display: flex;
    align-items: center;
    justify-content: center;

    & svg {
        width: ${({ $iconSize }) => $iconSize}rem;
        height: ${({ $iconSize }) => $iconSize}rem;
        margin-right: 1rem;
    }

    &:hover {
        color: white;
        background-color: ${({ disabled, $color }) => (disabled ? "gray" : colors[$color])};
        ${({ disabled }) => !disabled && "transform: scale(1.07); box-shadow: 0px 7px 13px -7px rgba(0,0,0,0.75);"}
    }

    &:active {
        ${({ disabled }) => !disabled && "transform: scale(1.03);"}
    }
`;

export default function MainButton({ action, disabled, fontSize, color, icon, iconSize, borderRadius, text, type }) {
    return (
        <Button
            onClick={action}
            type={type}
            disabled={disabled}
            $fontSize={fontSize}
            $color={color}
            $iconSize={iconSize}
            $borderRadius={borderRadius}
        >
            <ReactSVG src={`/src/assets/Iconos/${icon}.svg`}/>{text}
        </Button>
    );
}