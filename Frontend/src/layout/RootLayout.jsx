import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import LinkSidebar from "../Components/LinkSidebar";
import libreriaLogo from "../assets/logo.png"
import Header from "../Components/Header";
import styles from './RootLayout.module.css';
import RightSidebar from "../Components/RightSidebar";
import { useAuth } from "../context/AuthProvider";
import NavigationOptions from "../Components/NavigationOptions";
import FondoPavlova from "../Components/FondoPavlova";


export default function RootLayout(){

    const location = useLocation();
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
                        <Outlet/>
                    </div>
                </div>
                <RightSidebar/>
            </main>
        </>       
    )
}