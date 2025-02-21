import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import LinkSidebar from "../Components/LinkSidebar";
import libreriaLogo from "../assets/logo.png"
import Header from "../Components/Header";
import styles from './RootLayout.module.css';
import RightSidebar from "../Components/RightSidebar";
import { useAuth } from "../context/AuthProvider";


export default function RootLayout(){

    const location = useLocation();
    const { isLoading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    if (isLoading) return <h1>Cargando...</h1>

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
                        {/*cargando ? <Spinner/> : <ul><div className="Menulist">*/}
                        <LinkSidebar text={"Buscar Recetas"} iconWhenActive={"search"} icon={"search-outline"} linkActiveText={"/"} redirectTo={"/"}/>
                        <LinkSidebar text={"Mis Recetas"} iconWhenActive={"restaurant"} icon={"restaurant-outline"} linkActiveText={"/ey"} redirectTo={"/ey"}/>
                        <LinkSidebar text={"Mis Ingredientes"} iconWhenActive={"nutrition"} icon={"nutrition-outline"} linkActiveText={"/no"} redirectTo={"/no"}/>
                        <LinkSidebar text={"Plan Alimenticio"} iconWhenActive={"calendar"} icon={"calendar-outline"} linkActiveText={"/yes"} redirectTo={"/yes"}/>
                        <LinkSidebar text={"Perfil"} iconWhenActive={"person"} icon={"person-outline"} linkActiveText={"/mi-perfil"} redirectTo={"/mi-perfil"}/>
                        <LinkSidebar text={"Iniciar Sesion"} iconWhenActive={"log-in"} icon={"log-in-outline"} linkActiveText={"/auth/iniciar-sesion"} redirectTo={"/auth/iniciar-sesion"}/>
                        <LinkSidebar text={"Registrarse"} iconWhenActive={"person-add"} icon={"person-add-outline"} linkActiveText={"/auth/registrarse"} redirectTo={"/auth/registrarse"}/>
                        <LinkSidebar text={"Gestionar Usuarios"} iconWhenActive={"people"} icon={"people-outline"} linkActiveText={"/users"} redirectTo={"/users"}/>
                        {/*<div className="bottom">
                            <li className="bottom_container">
                                <div className="icon"><ion-icon name="log-out-outline"></ion-icon></div>
                                <div className="text">Cerrar Sesion</div>
                            </li>
                        </div>*/}
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