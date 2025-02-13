import { useState } from "react";
import styles from "./ChangeProfileForm.module.css";
import RightSidebarForms from "./RightSidebarForms";
import MainButton from "./MainButton";

export default function ChangeProfileForm(){

    const mainFormOptions = [
        { type: "text", name: "nombre", label: "Nombre:"},
        { type: "text", name: "correo", label: "Correo:"},
        { type: "text", name: "pais", label: "Pais:"},
        { type: "text", name: "facebook_link", label: "Enlace a Facebook:"},
        { type: "text", name: "twitter_link", label: "Enlace a Twitter/X:"},
        { type: "text", name: "youtube_link", label: "Enlace a Youtube:"},
        { type: "textarea", name: "about_me", label: "Sobre Mi:"}
    ];

    const passwordFormOptions = [
        { type: "password", name: "oldPassword", label: "Contraseña Actual:"},
        { type: "password", name: "newPassword", label: "Nueva Contraseña:"},
        { type: "password", name: "newPasswordConfirm", label: "Repite la Nueva Contraseña:"},
    ]

    const emailDataOptions = [
        { type: "email", name: "correo", label: "Nuevo Correo: "},
    ]

    const [ userData, setUserData ] = useState({
        nombre: "",
        pais: "",
        facebook_link: "",
        twitter_link: "",
        youtube_link: "",
        about_me: ""
    });

    const [ passwordData, setPasswordData ] = useState({
        oldPassword: "",
        newPassword: "",
        newPasswordConfirm: ""
    })

    const [ mailData, setMailData ] = useState({
        correo: ""
    })


    return(
        <div className={styles.changeProfileForm}>
            <h3 className={styles.formDescription}>Cambiar Informacion Personal</h3>
            <RightSidebarForms formOptions={mainFormOptions} setData={setUserData} data={userData}>
                <MainButton disabled={false} type={'submit'} icon={"settings"} iconSize={"3"} fontSize={"2.5"} color={"secondary"} borderRadius={'1.5'} text={"Cambiar Informacion"}/>
            </RightSidebarForms>
            <h3 className={styles.formDescription}>Cambiar Contraseña</h3>
            <RightSidebarForms formOptions={passwordFormOptions} setData={setPasswordData} data={passwordData}>
                <MainButton disabled={false} type={'submit'} icon={"lock-open"} iconSize={"3"} fontSize={"2.5"} color={"secondary"} borderRadius={'1.5'} text={"Cambiar Informacion"}/>
            </RightSidebarForms>
            <h3 className={styles.formDescription}>Cambiar Correo</h3>
            <RightSidebarForms formOptions={emailDataOptions} setData={setMailData} data={mailData}>
                <MainButton disabled={false} type={'submit'} icon={"mail"} iconSize={"3"} fontSize={"2.5"} color={"secondary"} borderRadius={'1.5'} text={"Cambiar Correo"}/>
            </RightSidebarForms>
        </div>
    )
}