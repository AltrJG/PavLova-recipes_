import { FadeLoader } from "react-spinners";
import { useAuth } from "../context/AuthProvider"
import LinkSidebar from "./LinkSidebar"

export default function NavigationOptions(){

    const { isLoading, isAuthenticated, isStaff, isSuperUser } = useAuth();

    if (isLoading) return <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>

    return(
        <>
            <LinkSidebar text={"Buscar Recetas"} iconWhenActive={"search"} icon={"search-outline"} linkActiveText={"/"} redirectTo={"/"}/>
            { !isAuthenticated && <>
                <LinkSidebar text={"Iniciar Sesion"} iconWhenActive={"log-in"} icon={"log-in-outline"} linkActiveText={"/auth/iniciar-sesion"} redirectTo={"/auth/iniciar-sesion"}/>
                <LinkSidebar text={"Registrarse"} iconWhenActive={"person-add"} icon={"person-add-outline"} linkActiveText={"/auth/registrarse"} redirectTo={"/auth/registrarse"}/>
            </> }
            { isAuthenticated && <>
                <LinkSidebar text={"Mis Recetas"} iconWhenActive={"restaurant"} icon={"restaurant-outline"} linkActiveText={"/ey"} redirectTo={"/ey"}/>
                <LinkSidebar text={"Mis Ingredientes"} iconWhenActive={"nutrition"} icon={"nutrition-outline"} linkActiveText={"/no"} redirectTo={"/no"}/>
                <LinkSidebar text={"Plan Alimenticio"} iconWhenActive={"calendar"} icon={"calendar-outline"} linkActiveText={"/yes"} redirectTo={"/yes"}/>
                <LinkSidebar text={"Perfil"} iconWhenActive={"person"} icon={"person-outline"} linkActiveText={"/mi-perfil"} redirectTo={"/mi-perfil"}/>
            </> }
            <LinkSidebar text={isSuperUser ? "Gestionar Usuarios" : "Buscar Usuarios"} iconWhenActive={"people"} icon={"people-outline"} linkActiveText={"/users"} redirectTo={"/users"}/>
        </>
    )
}