import { Link, useNavigate } from 'react-router-dom';
import MainButton from '../Components/MainButton';
import styles from './UserAuthFormsSingle.module.css'
import { useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { validateRegister } from './utils/validators';
import Swal from 'sweetalert2';
import RightSidebarErrors from './RightSidebarErrors';
import { ReactSVG } from 'react-svg';

export default function Register(){

    const {register} = useAuth();

    const navigate = useNavigate();
    const [ registerData, setRegisterData ] = useState({
        nombre: "",
        correo: "",
        password: "",
        confirmPassword: ""
    });
    const [ loading, setLoading ] = useState(false);
    const [ errorsHandler, setErrorsHandler ] = useState(false);


    const handleSumbit = async (e) => {
        e.preventDefault();

        setLoading(true);
        const errors = validateRegister(registerData);
        setErrorsHandler(errors);
        if(Object.keys(errors).length === 0){
            try {
                await register(registerData.nombre, registerData.correo, registerData.password);
                Swal.fire({
                    icon: "success",
                    title: "Cuenta Creada",
                    text: 'Registro exitoso, confirma tu cuenta para iniciar sesion',
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
                setErrorsHandler({error: error.message});
            } finally{
                setLoading(false);
            }
        }
        setLoading(false);
    }

    return(
        <>
            <form className={styles.form_user_information} onSubmit={handleSumbit}>
                <RightSidebarErrors errors={errorsHandler}/>
                <div className={styles.form_input_group}>
                    <label className={styles.form_input_group_icon}><ReactSVG src={`/src/assets/Iconos/id-card.svg`}/></label>
                    <input name='nombre' id='nombre' onChange={e => setRegisterData({...registerData, [e.target.name]: e.target.value})}  type='text' required className={styles.form_input_group_input} placeholder='Nombre Completo' />
                </div>
                <div className={styles.form_input_group}>
                    <label className={styles.form_input_group_icon}><ReactSVG src={`/src/assets/Iconos/mail.svg`}/></label>
                    <input name='correo' id='correo' onChange={e => setRegisterData({...registerData, [e.target.name]: e.target.value})} type='email' required className={styles.form_input_group_input} placeholder='Correo Electronico' />
                </div>
                <div className={styles.form_input_group}>
                    <label className={styles.form_input_group_icon}><ReactSVG src={`/src/assets/Iconos/lock-closed.svg`}/></label>
                    <input name='password' id='password' onChange={e => setRegisterData({...registerData, [e.target.name]: e.target.value})}  type='password' required className={styles.form_input_group_input} placeholder='Contraseña' />
                </div>
                <div className={styles.form_input_group}>
                    <label className={styles.form_input_group_icon}><ReactSVG src={`/src/assets/Iconos/lock-closed.svg`}/></label>
                    <input name='confirmPassword' id='confirmPassword' onChange={e => setRegisterData({...registerData, [e.target.name]: e.target.value})}  type='password' required className={styles.form_input_group_input} placeholder='Repite la contraseña' />
                </div>
                <div className={`align_center ${styles.formButton}`}>
                    <MainButton disabled={loading} type={'submit'} icon={"person-add"} iconSize={"3"} fontSize={"2.5"} color={"primary"} borderRadius={'1'} text={loading ? "Registrando..." : "Registrarse"}/>
                </div>
            </form>
            <p className={styles.other_options}>Ya tienes cuenta? <Link className={styles.other_links} to={"/auth/iniciar-sesion"}>Iniciar Sesion</Link></p>
        </>
    )
}