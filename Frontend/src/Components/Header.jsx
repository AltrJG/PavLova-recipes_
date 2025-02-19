import React from "react";
import { Link, useNavigate } from "react-router-dom";
import tempUserPic from "../assets/smile.png"
import SearchContent from "./SearchContent";
import styles from './Header.module.css';
import { authService } from "../api/auth_api";
import { userService } from "../api/user_api";
import { useState, useEffect } from "react";

export default function Header({toggleMenu, isMenuOpen}){
    const [username, setUsername] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userInfo = await userService.getUserInfo();
                setUsername(userInfo.username);
            } catch (error) {
                console.error("Error al recuperar la información del usuario:", error);
            }
        };

        fetchUserInfo();
    }, []);

    const handleLogout = async () => {
        await authService.logout();
        navigate("/auth/iniciar-sesion");
    };

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
                <button aria-label={`Cerrar sesion`} className={styles.cerrar_sesion} onClick={handleLogout}><ion-icon name="log-out-outline"></ion-icon></button>
                <Link to={"/mi-perfil"} className={styles.main_content_user} style={{textDecoration: "none"}}>
                    <h3 className={styles.username}>{username || 'Cargando...'}</h3>
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