import { useNavigate, useParams } from 'react-router-dom';
import MainButton from './MainButton';
import styles from './UserAuthFormsSingle.module.css'
import { useState } from 'react';
import Swal from 'sweetalert2';
import { validatePasswordData } from './utils/validators';
import RightSidebarErrors from './RightSidebarErrors';
import backendAPI from '../api/axiosConfig';
import { ReactSVG } from 'react-svg';

export default function PasswordReset(){

    const { token } = useParams();
    const navigate = useNavigate();
    const [ registerData, setRegisterData ] = useState({
        newPassword: "",
        newPasswordConfirm: ""
    })

    const [ loading, setLoading ] = useState(false);
    const [ errorsHandler, setErrorsHandler ] = useState(false);


    const handleSumbit = async (e) => {
        e.preventDefault();

        setLoading(true);
        const errors = validatePasswordData(registerData);
        setErrorsHandler(errors);
        if(Object.keys(errors).length === 0){
            try {
                await backendAPI.post('password_reset/', {
                    token,
                    new_password: registerData.newPassword,
                    confirm_password: registerData.newPasswordConfirm,
                });
                Swal.fire({
                    icon: "success",
                    title: "Contraseña Modificada",
                    text: 'Se modifico la contraseña de tu cuenta con exito',
                    showConfirmButton: true,
                    customClass: {
                        title: "swal_title",
                        icon: "swal_icon",
                        htmlContainer: "swal_text",
                        confirmButton: "swal_confirm"
                    }
                });
                navigate('/auth/iniciar-sesion');
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
                    <label className={styles.form_input_group_icon}><ReactSVG src={`/assets/Iconos/lock-closed.svg`}/></label>
                    <input name='newPassword' id='newPassword' onChange={e => setRegisterData({...registerData, [e.target.name]: e.target.value})}  type='password' required className={styles.form_input_group_input} placeholder='Contraseña' />
                </div>
                <div className={styles.form_input_group}>
                    <label className={styles.form_input_group_icon}><ReactSVG src={`/assets/Iconos/lock-closed.svg`}/></label>
                    <input name='newPasswordConfirm' id='newPasswordConfirm' onChange={e => setRegisterData({...registerData, [e.target.name]: e.target.value})}  type='password' required className={styles.form_input_group_input} placeholder='Repite la contraseña' />
                </div>
                <div className={`align_center ${styles.formButton}`}>
                    <MainButton disabled={loading} type={'submit'} icon={"key"} iconSize={"3"} fontSize={"2.5"} color={"primary"} borderRadius={'1'} text={loading ? "Modificando..." : "Modificar Contraseña"}/>
                </div>
            </form>
        </>
    )
}