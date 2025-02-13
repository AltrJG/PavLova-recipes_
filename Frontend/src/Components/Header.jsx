import React from "react";
import { Link } from "react-router-dom";
import tempUserPic from "../assets/smile.png"
import SearchContent from "./SearchContent";
import styles from './Header.module.css';

export default function Header({toggleMenu, isMenuOpen}){
    return(
        <header className={styles.main_content_header}>
            <div className={styles.burger_search}>
                <div className={styles.hamburgerMenu} onClick={() => toggleMenu()}>
                    <div className={`${styles.bar} ${isMenuOpen ? styles.barActive : ''}`}></div>
                    <div className={`${styles.bar} ${isMenuOpen ? styles.barActive : ''}`}></div>
                    <div className={`${styles.bar} ${isMenuOpen ? styles.barActive : ''}`}></div>
                </div>
                <SearchContent/>
            </div>
            <div className={styles.opciones_usuario}>
                <button aria-label={`Cerrar sesion`} className={styles.cerrar_sesion}><ion-icon name="log-out-outline"></ion-icon></button>
                <Link to={"/mi-perfil"} className={styles.main_content_user} style={{textDecoration: "none"}}>
                    <h3 className={styles.username}>Brandon</h3>
                    <div className={styles.user_img}>
                        <img src={tempUserPic}/>
                    </div>
                </Link>
            </div>
            {/*<Link to={"/iniciar-sesion"} className="main_content_user" style={{textDecoration: "none"}}>
            //    <h3 className="username">Iniciar Sesion</h3>
            </Link>*/}
        </header>
    )
}