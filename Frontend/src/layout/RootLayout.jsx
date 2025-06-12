import React, { useState } from "react";
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

export default function RootLayout(){

    const location = useLocation();
    const { pavlorficAero, ollaHirviendo } = useBackground();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return(
        <>
            <main className={styles.main_content}>
                <div onClick={() => setIsMenuOpen(false)} className={`${styles.sidebarFilter} ${isMenuOpen ? styles.sidebarFilterOpen : ""}`}></div>
                <div className={`${styles.sidebarClose} ${isMenuOpen ? styles.sidebarCloseActive : ""}`} onClick={() => setIsMenuOpen(false)}>X</div>
                <div className={`${styles.sidebar} ${isMenuOpen ? styles.sidebarOpen : ""}`}>
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