import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import libreriaLogo from "../assets/logo.png"
import Header from "../Components/Header";
import styles from './RootLayout.module.css';
import RightSidebar from "../Components/RightSidebar";
import NavigationOptions from "../Components/NavigationOptions";
import FondoPavlova from "../Components/FondoPavlova";
import { useBackground } from "../context/BackgroundProvider";
import RotatingBall from "../Components/RotatingBall";
import BurbujaCanvas from "../Components/BurbujaCanvas";
import fondo_estatico from '../assets/fondo_utensilios_op.png'

export default function RootLayout(){

    const location = useLocation();
    const { pavlorficAero, ollaHirviendo } = useBackground();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const sidebarRef = useRef(null);

    useLayoutEffect(() => {
        const updateMask = () => {
            if (sidebarRef.current) {
                const activeItem = sidebarRef.current.parentElement.querySelector('[data-active="true"], .active');

                if (activeItem) {
                    const top = activeItem.offsetTop;
                    const height = activeItem.offsetHeight;

                    sidebarRef.current.style.setProperty('--mask-top', `${top}px`);
                    sidebarRef.current.style.setProperty('--mask-bottom', `${top + height}px`);
                } else{
                    setTimeout(updateMask, 500);
                }
            }
        };

        updateMask();
    }, [location.pathname]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return(
        <>
            <main className={styles.main_content}>
                <div onClick={() => setIsMenuOpen(false)} className={`${styles.sidebarFilter} ${isMenuOpen ? styles.sidebarFilterOpen : ""}`}></div>
                <div className={`${styles.sidebarClose} ${isMenuOpen ? styles.sidebarCloseActive : ""}`} onClick={() => setIsMenuOpen(false)}>X</div>
                <div className={`${styles.sidebar} ${isMenuOpen ? styles.sidebarOpen : ""}`}>
                    <div ref={sidebarRef} className={styles.sidebar_background}></div>
                    <ul>
                        <li className={styles.logo}>
                            <Link to="/" className={`${styles.logo_link} ${!isMenuOpen ? styles.sidebarLogoActive : ""}`} style={{textDecoration: "none"}}>
                                <img src={libreriaLogo}></img>
                                <h1 className={styles.logo_text}>PavLova Recipes</h1>
                            </Link>
                        </li>
                        <NavigationOptions/>
                    </ul>
                </div>
                <div className={styles.content_container}>
                    <Header toggleMenu={toggleMenu} isMenuOpen={isMenuOpen}/>
                    <div className={styles.dynamic_content}>
                        { !ollaHirviendo && <img className={styles.fondo_estatico} src={fondo_estatico}/>}
                        { pavlorficAero && <FondoPavlova/> }
                        { ollaHirviendo && <><BurbujaCanvas/><RotatingBall/></> }
                        <Outlet/>
                    </div>
                </div>
                <RightSidebar/>
            </main>
        </>       
    )
}