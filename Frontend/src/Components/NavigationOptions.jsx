import { FadeLoader } from "react-spinners";
import { useState } from 'react';
import { useAuth } from "../context/AuthProvider";
import LinkSidebar from "./LinkSidebar";
import styles from './NavigationOptions.module.css';

export default function NavigationOptions(){

    const { isLoading, isAuthenticated, isStaff, isSuperUser } = useAuth();

    const [ extraMenu, setExtraMenu ] = useState(false);

    const toggleMenu = () => {
        setExtraMenu(!extraMenu);
    }

    if (isLoading) return <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>

    return(
        <>
            <LinkSidebar text={"Buscar Recetas"} iconWhenActive={"search"} icon={"search-outline"} linkActiveText={["/", '/receta']} redirectTo={"/"}/>
            { !isAuthenticated && <>
                <LinkSidebar text={"Iniciar Sesion"} iconWhenActive={"log-in"} icon={"log-in-outline"} linkActiveText={["/iniciar-sesion"]} redirectTo={"/auth/iniciar-sesion"} position={2}/>
                <LinkSidebar text={"Registrarse"} iconWhenActive={"person-add"} icon={"person-add-outline"} linkActiveText={["/registrarse"]} redirectTo={"/auth/registrarse"} position={2}/>
            </> }
            <LinkSidebar text={isSuperUser ? "Gestionar Usuarios" : "Buscar Usuarios"} iconWhenActive={"people"} icon={"people-outline"} linkActiveText={["/users", "/user"]} redirectTo={"/users"}/>
            { isAuthenticated && <>
                <LinkSidebar text={"Mis Recetas"} iconWhenActive={"restaurant"} icon={"restaurant-outline"} linkActiveText={["/mis_recetas", '/crear-receta']} redirectTo={"/mis_recetas"}/>
                <LinkSidebar text={"Mis Ingredientes"} iconWhenActive={"nutrition"} icon={"nutrition-outline"} linkActiveText={["/ingredientes"]} redirectTo={"/ingredientes"}/>
                <div className={styles.menuToggle}>
                    <LinkSidebar action={toggleMenu} text={"Mis Ingredientes"} iconWhenActive={"list"} icon={"list-outline"} linkActiveText={["/extraOptions"]} redirectTo={"/extraOptions"}/>
                </div>
                <div className={`${styles.moreOptions} ${extraMenu ? styles.moreOptionsActive : ""}`}>
                    <LinkSidebar extraMenuRight={true} text={"Plan Alimenticio"} iconWhenActive={"calendar"} icon={"calendar-outline"} linkActiveText={["/plan-alimenticio"]} redirectTo={"/plan-alimenticio"}/>
                    <LinkSidebar extraMenuRight={true} text={"Perfil"} iconWhenActive={"person"} icon={"person-outline"} linkActiveText={["/mi-perfil"]} redirectTo={"/mi-perfil"}/>
                    {(isSuperUser || isStaff) && <LinkSidebar extraMenuRight={true} text={isSuperUser ? "Categorias y Etiquetas" : "Gestionar Etiquetas"} iconWhenActive={"bookmarks"} icon={"bookmarks-outline"} linkActiveText={["/etiquetas"]} redirectTo={"/etiquetas"}/> }
                </div>
            </> }
        </>
    )
}