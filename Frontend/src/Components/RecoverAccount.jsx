import { Link } from 'react-router-dom';
import MainButton from './MainButton';
import styles from './UserAuthFormsSingle.module.css'
import { useState } from 'react';
import Swal from 'sweetalert2';
import { validateAccountRecover } from './utils/validators';
import RightSidebarErrors from './RightSidebarErrors';
import backendAPI from '../api/axiosConfig';
import { ReactSVG } from 'react-svg';

export default function RecoverAccount(){

    const [ registerData, setRegisterData ] = useState({
        correo: ""
    })

    const [ loading, setLoading ] = useState(false);
    const [ errorsHandler, setErrorsHandler ] = useState(false);


    const handleSumbit = async (e) => {
        e.preventDefault();

        setLoading(true);
        const errors = validateAccountRecover(registerData);
        setErrorsHandler(errors);
        if(Object.keys(errors).length === 0){
            try {
                await backendAPI.post('password_reset/request/', { email: registerData.correo });
                Swal.fire({
                    icon: "success",
                    title: "Solicitud Aceptada",
                    text: 'Se envio un correo electronico con instrucciones para la recuperacion de tu cuenta',
                    showConfirmButton: true,
                    customClass: {
                        title: "swal_title",
                        icon: "swal_icon",
                        htmlContainer: "swal_text",
                        confirmButton: "swal_confirm"
                    }
                });
            } catch (error) {
                setErrorsHandler(error.response.data);
            } finally{
                setLoading(false);
            }
        }
        setLoading(false);
    }

    return(
        <>
            <form onSubmit={handleSumbit} className={styles.form_user_information}>
                <RightSidebarErrors errors={errorsHandler}/>
                <div className={styles.form_input_group}>
                    <label className={styles.form_input_group_icon}><ReactSVG src={`/assets/Iconos/mail.svg`}/></label>
                    <input name='correo' id='correo' onChange={e => setRegisterData({...registerData, [e.target.name]: e.target.value})} type='email' required className={styles.form_input_group_input} placeholder='Correo Electronico' />
                </div>
                <div className={`align_center ${styles.formButton}`}>
                    <MainButton disabled={loading} type={'submit'} icon={"key"} iconSize={"3"} fontSize={"2.5"} color={"primary"} borderRadius={'1'} text={loading ? "Recuperando..." : "Recuperar Cuenta"}/>
                </div>
            </form>
            <p className={styles.other_options}>Recuerdas tu contraseña? <Link className={styles.other_links} to={"/auth/iniciar-sesion"}>Iniciar Sesion</Link></p>
        </>
    )
}