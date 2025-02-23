import styles from './UserAuthForm.module.css';
import { Navigate, Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export default function UserAuthForms(){

    const location = useLocation();
    const { isAuthenticated, isLoading } = useAuth();

    const texts = {
        title: location.pathname == "/auth/registrarse" ? "Registrate" : (location.pathname == "/auth/iniciar-sesion" ? "Iniciar Sesion" : "Recuperar Cuenta"),
        paragraph: location.pathname == "/auth/registrarse" ? "Para comenzar a utilizar recetas increibles" : (location.pathname == "/auth/iniciar-sesion" ? "Para continuar utilizando la aplicacion" : "Para seguir utilizando la aplicacion")
    }

    if(isLoading) return "cargando...";
    return (!isAuthenticated && !isLoading) ?         
    <div className={styles.form_container}>
        <div className={styles.form_user}>
            <h1>{texts.title}</h1>
            <p className={styles.texto_extra}>{texts.paragraph}</p>
            <Outlet/>
        </div>
    </div> 
    : <Navigate to="/users" replace />;
}