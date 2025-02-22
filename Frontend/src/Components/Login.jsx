import { Link, useNavigate } from 'react-router-dom';
import MainButton from '../Components/MainButton';
import styles from './UserAuthFormsSingle.module.css'
import { useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import Swal from 'sweetalert2';
import RightSidebarErrors from './RightSidebarErrors';
import { validateLoginForm } from './utils/validators';

export default function Login(){

    const navigate = useNavigate();
    const { login, getUserData } = useAuth();

    const [ loading, setLoading ] = useState(false);
    const [ loginData, setLoginData ] = useState({
        correo: "",
        password: ""
    })
    const [ errorsHandler, setErrorsHandler ] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const errors = validateLoginForm(loginData);
        setErrorsHandler(errors);
        if(Object.keys(errors).length === 0){
            try{
                await login(loginData.correo, loginData.password);
                setTimeout(() => getUserData(), 0);
                Swal.fire({
                    icon: "success",
                    title: "Sesion Abierta",
                    text: 'El inicio de sesion ha sido existoso',
                    showConfirmButton: true,
                    customClass: {
                        title: "swal_title",
                        icon: "swal_icon",
                        htmlContainer: "swal_text",
                        confirmButton: "swal_confirm"
                    }
                });
                navigate('/users');
            } catch(error){
                console.log(error);
                setErrorsHandler({error: error.message});
            } finally{
                setLoading(false);
            }
        }
        setLoading(false);
      };

    return(
        <>
            <form className={styles.form_user_information} onSubmit={handleSubmit}>
                <RightSidebarErrors centered={true} errors={errorsHandler}/>
                <div className={styles.form_input_group}>
                    <label className={styles.form_input_group_icon}><ion-icon name="mail"></ion-icon></label>
                    <input name='correo' id='correo' onChange={e => setLoginData({...loginData, [e.target.name]: e.target.value})} type='email' required className={styles.form_input_group_input} placeholder='Correo Electronico' />
                </div>
                <div className={styles.form_input_group}>
                    <label className={styles.form_input_group_icon}><ion-icon name="lock-closed"></ion-icon></label>
                    <input name='password' id='password' onChange={e => setLoginData({...loginData, [e.target.name]: e.target.value})} type='password' required className={styles.form_input_group_input} placeholder='Contraseña' />
                </div>
                <div className={`align_center ${styles.formButton}`}>
                    <MainButton disabled={false} type={'submit'} icon={"log-in"} iconSize={"3"} fontSize={"2.5"} color={"primary"} borderRadius={'1'} text={"Iniciar sesion"}/>
                </div>
            </form>
            <p className={styles.other_options}>No tienes cuenta? <Link className={styles.other_links} to={"/auth/registrarse"}>Registrate</Link></p>
            <p className={styles.other_options}>No recuerdas tu contraseña? <Link className={styles.other_links} to={"/auth/recuperar-cuenta"}>Recuperar Cuenta</Link></p>
        </>
    )
}