import { ReactSVG } from "react-svg";
import styled from "styled-components"

const colors = {
    primary: "#23130d",
    secondary: "#fc9003"
};

const Button = styled.button`
    background-color: ${({ disabled, $color }) => (disabled ? "gray" : colors[$color] + "a1")};
    border: ${({ disabled, $color }) => (disabled ? "gray" : colors[$color])} .2rem solid;
    border-radius: ${({ $borderRadius }) => $borderRadius}rem;
    color: white;
    position: relative;
    padding: 0.5rem 2rem 0.5rem 1rem;
    transition: 0.4s;
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    & svg {
        width: ${({ $iconSize }) => $iconSize}rem;
        height: ${({ $iconSize }) => $iconSize}rem;
        margin-right: 1rem;
    }

    & p{
        font-family: "Oswald", sans-serif;
        font-size: ${({ $fontSize }) => $fontSize}rem;
        z-index: 2;
    }

    & div{
        z-index: 2;
    }

    &:hover {
        color: white;
        ${({ disabled, $color }) => !disabled && (`transform: scale(1.07); box-shadow: 0px 7px 13px 0px ` + colors[$color] + 'a1;')}
    }

    & span{
        transition: transform 0.25s ease-in-out;

    }

    &:hover span{
        transform: scaleX(1);
        transform-origin: left;
    }

    &:active {
        ${({ disabled }) => !disabled && "transform: scale(0.95);"}
    }

    &:before{
        content: "";
        position: absolute;
        top: var(--y);
        left: var(--x);
        transform: translate(-50%, -50%);
        width: 0px;
        height: 0px;
        border-radius: 50%;
        background: ${({ disabled, $color }) => (disabled ? "gray" : colors[$color] + "a1")};
        transition: width 0.7s, height 0.7s;
    }

    &:hover::before{
        width: ${({ $animationDefault }) => $animationDefault == 'ripple' ? '800px' : '0px'};
        height: ${({ $animationDefault }) => $animationDefault == 'ripple' ? '500px' : '0px'};;
    }
`;

const SpanAnimation = styled.span`
    position: absolute;
    left: 0;
    width: 100%;
    height: 5px;
    background: ${({ $color }) => colors[$color]};
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.25 ease-in-out;
    transition-delay: ${({ $delay }) => $delay}s !important;
    top: ${({$arrayKey}) => $arrayKey * 4}px;
`

const ripple = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.pageX - rect.left;
    const y = e.pageY - rect.top;
    e.target.style.setProperty('--x', x + 'px');
    e.target.style.setProperty('--y', y + 'px');
}

export default function MainButton({ action, disabled, fontSize, color, icon, iconSize, borderRadius, text, type, animationDefault = 'ripple' }) {
    return (
        <Button
            onMouseEnter={e => ripple(e)}
            onMouseLeave={e => ripple(e)}
            id="primary-buttons"
            onClick={action}
            type={type}
            disabled={disabled}
            $animationDefault={animationDefault}
            $fontSize={fontSize}
            $color={color}
            $iconSize={iconSize}
            $borderRadius={borderRadius}
        >
            <ReactSVG src={`/assets/Iconos/${icon}.svg`}/><p>{text}</p>
            { animationDefault == 'dash' && Array.from({ length: 15 }, (_, i) => (
                <SpanAnimation $arrayKey={i} $delay={Math.random() * 0.5} $color={color}></SpanAnimation>
            )) }
        </Button>
    );
}