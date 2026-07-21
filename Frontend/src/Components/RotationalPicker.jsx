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
import login from '../assets/login_imagen.jpg';
import logo from '../assets/logo.png';
import manzana from '../assets/manzana_test.png';
import utensilios from '../assets/fondo_utensilios_op.png';
import styled from 'styled-components';


    const Slideshow = styled.div`
        height: 100vh;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
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
    `;

    const SlideImage = styled.img`
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
        transition: transform 0.5s 0.5s;
    `;

    const Slide = styled.div`
        width: 20rem;
        height: 20rem;
        position: absolute;
        transform: translate(
            calc(${({ $horizontal, $isActive }) => $isActive ? '0' : $horizontal}rem),
            calc(${({ $vertical, $isActive }) => $isActive ? '0' : $vertical}rem)
        ) scale(.7);
        ${SlideImage} {
            transform: ${({ $isActive }) => ($isActive ? 'scale(2)' : 'scale(1)')};
        }
    `;

    const Controls = styled.div`
        display: flex;
    `;

    const ControlThumb = styled.div`
        img {
            width: 10rem;
            height: 10rem;
            border-radius: 50%;
            object-fit: cover;
        }
    `;

export default function RotationalPicker(){

    const items = [
        { key: '1', codename: 'login', image: login },
        { key: '2', codename: 'manzana', image: manzana },
        { key: '3', codename: 'logo', image: logo },
        { key: '4', codename: 'utensilios', image: utensilios },
        { key: '5', codename: 'logo', image: logo },
        { key: '6', codename: 'logo', image: logo },
        { key: '7', codename: 'logo', image: logo },
    ];

    const cantidad = useMemo(() => Object.keys(items).length);
    console.log(cantidad);
    
    return (
        <Slideshow>
        <Carousel>
            {items.map(({ key, codename, image }) => (
<Slide 
  key={key} 
  $horizontal={(() => {
    const cos = Math.cos(((360 / cantidad) * Number(key)) * (Math.PI / 180));
    return (Math.abs(cos) < 1e-10 ? 0 : cos) * 22;
  })()} 
  $vertical={(() => {
    const sin = Math.sin(((360 / cantidad) * Number(key)) * (Math.PI / 180));
    return (Math.abs(sin) < 1e-10 ? 0 : sin) * 22;
  })()} 
  $isActive={codename === 'logo2'}
>                <SlideImage src={image} alt={codename} />
            </Slide>
            ))}
        </Carousel>

        <Controls>
            {items.map(({ key, codename, image }) => (
            <ControlThumb key={key} data-index={key}>
                <img src={image} alt={codename} />
            </ControlThumb>
            ))}
        </Controls>
        </Slideshow>
    );
}