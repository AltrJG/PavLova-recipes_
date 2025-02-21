import { Link, useNavigate } from 'react-router-dom';
import MainButton from '../Components/MainButton';
import styles from './UserAuthFormsSingle.module.css'
import { useState } from 'react';
import { useAuth } from '../context/AuthProvider';

export default function Register(){

    const {register} = useAuth();

    const navigate = useNavigate();
    const [ registerData, setRegisterData ] = useState({
        nombre: "",
        correo: "",
        password: "",
        confirmPassword: ""
    })

    const [ error, setError ] = useState("");

    const handleSumbit = async (e) => {
        e.preventDefault();

        if(registerData.password !== registerData.confirmPassword){
            setError("Las contraseñas no coinciden");
            return;
        }

        try {
            await register(registerData.nombre, registerData.correo, registerData.password);
        } catch (error) {
            setError("Error de conexion");
        }
    }

    return(
        <>
            <form className={styles.form_user_information} onSubmit={handleSumbit}>
                <div className={styles.form_input_group}>
                    <label className={styles.form_input_group_icon}><ion-icon name="id-card"></ion-icon></label>
                    <input name='nombre' id='nombre' onChange={e => setRegisterData({...registerData, [e.target.name]: e.target.value})}  type='text' required className={styles.form_input_group_input} placeholder='Nombre Completo' />
                </div>
                <div className={styles.form_input_group}>
                    <label className={styles.form_input_group_icon}><ion-icon name="mail"></ion-icon></label>
                    <input name='correo' id='correo' onChange={e => setRegisterData({...registerData, [e.target.name]: e.target.value})} type='email' required className={styles.form_input_group_input} placeholder='Correo Electronico' />
                </div>
                <div className={styles.form_input_group}>
                    <label className={styles.form_input_group_icon}><ion-icon name="lock-closed"></ion-icon></label>
                    <input name='password' id='password' onChange={e => setRegisterData({...registerData, [e.target.name]: e.target.value})}  type='password' required className={styles.form_input_group_input} placeholder='Contraseña' />
                </div>
                <div className={styles.form_input_group}>
                    <label className={styles.form_input_group_icon}><ion-icon name="lock-closed"></ion-icon></label>
                    <input name='confirmPassword' id='confirmPassword' onChange={e => setRegisterData({...registerData, [e.target.name]: e.target.value})}  type='password' required className={styles.form_input_group_input} placeholder='Repite la contraseña' />
                </div>
                <div className={`align_center ${styles.formButton}`}>
                    <MainButton disabled={false} type={'submit'} icon={"person-add"} iconSize={"3"} fontSize={"2.5"} color={"primary"} borderRadius={'1'} text={"Registrarse"}/>
                </div>
            </form>
            <p className={styles.other_options}>Ya tienes cuenta? <Link className={styles.other_links} to={"/auth/iniciar-sesion"}>Iniciar Sesion</Link></p>
        </>
    )
}