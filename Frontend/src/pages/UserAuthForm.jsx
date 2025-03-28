import styles from './UserAuthForm.module.css';
import { Navigate, Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { FadeLoader } from 'react-spinners';

const useAuthTexts = () => {
    const location = useLocation();
    const { pathname } = location;

    let title, paragraph;

    switch (true) {
        case pathname === "/auth/registrarse":
            title = "Regístrate";
            paragraph = "Para comenzar a utilizar recetas increíbles";
            break;
        case pathname === "/auth/iniciar-sesion":
            title = "Iniciar Sesión";
            paragraph = "Para continuar utilizando la aplicación";
            break;
        case pathname.includes("password_reset"):
            title = "Cambia tu contraseña";
            paragraph = "Para recuperar tu cuenta";
            break;
        default:
            title = "Recuperar Cuenta";
            paragraph = "Para seguir utilizando la aplicación";
    }

    return { title, paragraph };
};

export default function UserAuthForms(){

    const { isAuthenticated, isLoading } = useAuth();

    const { title, paragraph } = useAuthTexts();

    if(isLoading) return <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>;
    return (!isAuthenticated && !isLoading) ?         
    <div className={styles.form_container}>
        <div className={styles.form_user}>
            <h1>{title}</h1>
            <p className={styles.texto_extra}>{paragraph}</p>
            <Outlet/>
        </div>
    </div> 
    : <Navigate to="/users" replace />;
}