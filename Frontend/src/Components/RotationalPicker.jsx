import { useState, useEffect, useMemo } from 'react';
import Help from './Help';
import styles from './RotationalPicker.module.css';
import FilterForm from './FilterForm';
import Recipe from './Recipe';
import MainButton from './MainButton';
import OptionButton from './OptionButton';
import Pagination from './Pagination';
import { useAuth } from '../context/AuthProvider';
import { FadeLoader } from 'react-spinners';
import backendAPI from '../api/axiosConfig';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';


const Slideshow = styled.div`
    height: 100%;
    width: 100%;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 6rem;

    @media (max-width: 1224px) {
        gap: 4rem;
    }

    @media (max-width: 768px) {
        gap: 3rem;
    }

    @media (max-width: 480px) {
        gap: 2rem;
    }
`;

const Carousel = styled.div`
    position: relative;
    width: 50rem;
    height: 50rem;
    border: 7rem solid #eebe97;
    border-radius: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    transform: rotate(${({ $rotation }) => $rotation}deg);
    --orbit-radius: 22rem;
    
    /* Delay rotation by 0.4s so the active item can reset back to the ring first */
    transition: transform 0.7s 0.4s cubic-bezier(0.4, 0, 0.2, 1);

    @media (max-width: 1224px) {
        width: 38rem;
        height: 38rem;
        border-width: 5rem;
        --orbit-radius: 16.5rem;
    }

    /* Tablet */
    @media (max-width: 768px) {
        width: 28rem;
        height: 28rem;
        border-width: 3.5rem;
        --orbit-radius: 12rem;
    }

    /* Mobile */
    @media (max-width: 480px) {
        width: 20rem;
        height: 20rem;
        border-width: 2.5rem;
        --orbit-radius: 8.5rem;
    }
`;

const SlideImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    
    /* Scale image smoothly */
    transition: transform 0.5s ${({ $isActive }) => ($isActive ? '1.1s' : '0s')} ease;
`;

const Slide = styled.div`
    width: 20rem;
    height: 20rem;
    position: absolute;
    translate: calc(${({ $vertical, $isActive }) => ($isActive ? '0' : $vertical)} * var(--orbit-radius)) calc(${({ $horizontal, $isActive }) => ($isActive ? '0' : $horizontal)} * var(--orbit-radius));
    scale: ${({ $isActive }) => ($isActive ? '1' : '0.6')};
    rotate: -${({ $rotation }) => $rotation}deg;
    z-index: ${({ $isActive }) => ($isActive ? '10' : '1')};

    transition: 
        rotate 0.7s 0.4s cubic-bezier(0.46, -0.22, 0.22, 1.34),
        translate ${({ $isActive }) => ($isActive ? '0.5s 1.1s' : '0.4s 0s')} ease,
        scale ${({ $isActive }) => ($isActive ? '0.5s 1.1s' : '0.4s 0s')} ease;

    ${SlideImage} {
        transform: ${({ $isActive }) => ($isActive ? 'scale(1.3)' : 'scale(1)')};
        border: ${({ $isActive }) => ($isActive ? '.5rem solid #23130d' : '0')};
    }

/* Laptop */
    @media (max-width: 1224px) {
        width: 15rem;
        height: 15rem;
    }

    /* Tablet */
    @media (max-width: 768px) {
        width: 11rem;
        height: 11rem;
    }

    /* Mobile */
    @media (max-width: 480px) {
        width: 8rem;
        height: 8rem;
    }
`;

    const Controls = styled.div`
        display: flex;
        width: 50rem;
        gap: 1rem;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;

        @media (max-width: 1224px) {
            width: 38rem;
        }

        @media (max-width: 768px) {
            width: 28rem;
            gap: 0.75rem;
        }

        @media (max-width: 480px) {
            width: 100%;
            gap: 0.5rem;
        }
    `;

    const ControlThumb = styled.div`
        img {
            width: 9rem;
            height: 9rem;
            border-radius: 50%;
            object-fit: cover;
            transition: .3s;
            transform: ${({ $isActive }) => ($isActive ? 'scale(1.1)' : 'scale(1)')};
            border: ${({ $isActive }) => ($isActive ? '.5rem solid #23130d' : '0')};


            &:hover{
                transform: scale(1.1);
            }

@media (max-width: 1224px) {
            width: 7rem;
            height: 7rem;
        }

        @media (max-width: 768px) {
            width: 5rem;
            height: 5rem;
        }

        @media (max-width: 480px) {
            width: 3.5rem;
            height: 3.5rem;
        }
        }
    `;

export default function RotationalPicker({items, activeKey, setActiveKey}){

    const cantidad = useMemo(() => Object.keys(items).length);
    
    return (
        <Slideshow>
        <Carousel $rotation={((360 / cantidad) * activeKey)}>
            {items.map(({ key, codename, image }) => (
        <Slide 
            key={key} 
            onClick={() => setActiveKey(Number(key))}
            $rotation={((360 / cantidad) * activeKey)}
            $horizontal={(() => {
                const cos = Math.cos(((360 / cantidad) * Number(key)) * (Math.PI / 180));
                return (Math.abs(cos) < 1e-10 ? 0 : cos);
            })()} 
            $vertical={(() => {
                const sin = Math.sin(((360 / cantidad) * Number(key)) * (Math.PI / 180));
                return (Math.abs(sin) < 1e-10 ? 0 : sin);
            })()} 
            $isActive={key == activeKey}
        >
            <SlideImage src={image} alt={codename} />
        </Slide>
            ))}
        </Carousel>

        <Controls>
            {items.map(({ key, codename, image }) => (
            <ControlThumb $isActive={key == activeKey} onClick={() => setActiveKey(Number(key))} key={key} data-index={key}>
                <img src={image} alt={codename} />
            </ControlThumb>
            ))}
        </Controls>
        </Slideshow>
    );
}