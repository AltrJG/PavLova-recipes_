import { Link } from 'react-router-dom';
import MainButton from './MainButton';
import styles from './UserAuthFormsSingle.module.css'
import { useState } from 'react';

export default function RecoverAccount(){

    const [ registerData, setRegisterData ] = useState({
        correo: ""
    })

    return(
        <>
            <form className={styles.form_user_information}>
                <div className={styles.form_input_group}>
                    <label className={styles.form_input_group_icon}><ion-icon name="mail"></ion-icon></label>
                    <input name='correo' id='correo' onChange={e => setRegisterData({...registerData, [e.target.name]: e.target.value})} type='email' required className={styles.form_input_group_input} placeholder='Correo Electronico' />
                </div>
                <div className={`align_center ${styles.formButton}`}>
                    <MainButton disabled={false} type={'submit'} icon={"key"} iconSize={"3"} fontSize={"2.5"} color={"primary"} borderRadius={'1'} text={"Registrarse"}/>
                </div>
            </form>
            <p className={styles.other_options}>Recuerdas tu contraseña? <Link className={styles.other_links} to={"/auth/iniciar-sesion"}>Iniciar Sesion</Link></p>
        </>
    )
}