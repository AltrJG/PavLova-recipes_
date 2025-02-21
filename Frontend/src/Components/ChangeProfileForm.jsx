import { useState } from "react";
import styles from "./ChangeProfileForm.module.css";
import RightSidebarForms from "./RightSidebarForms";
import MainButton from "./MainButton";
import OptionButton from "./OptionButton";
import SubidaImagenes from "./SubidaImagenes";

const thumb = {
    display: 'inline-flex',
    borderRadius: 2,
    marginBottom: 8,
    marginRight: 8,
    marginLeft: 20,
    width: "25rem",
    height: "25rem",
    padding: 4,
    boxSizing: 'border-box',
};

const thumbInner = {
    display: 'flex',
    minWidth: 0,
    borderRadius: '50%',
    border: '.4rem solid orange',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
};

export default function ChangeProfileForm(){

    const [ activeOption, setActiveOption ] = useState("Informacion");

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
    ];

    const emailDataOptions = [
        { type: "email", name: "correo", label: "Nuevo Correo: "},
    ];

    const options = [
        { type: 'Informacion', icon: 'information-circle', label: 'Informacion' },
        { type: 'Contrasena', icon: 'lock-open', label: 'Contraseña' },
        { type: 'Correo', icon: 'mail', label: 'Correo' },
        { type: 'ImagenPerfil', icon: 'aperture', label: 'Avatar' }
    ];

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
    });

    const [imagen, setImagen] = useState([]);

    return(
        <div className={styles.changeProfileForm}>
            <div className={styles.formOptions}>
                {options.map(option => (
                    <OptionButton isBackgroundBlack={true} key={option.label} option={option} active={activeOption} setData={setActiveOption} icon={option.icon} makeRowOnMobile={false}/>
                ))}  
            </div>
            { activeOption == "Informacion" && <> 
                <h3 className={styles.formDescription}>Cambiar Informacion Personal</h3>
                <RightSidebarForms formOptions={mainFormOptions} setData={setUserData} data={userData}>
                    <MainButton disabled={false} type={'submit'} icon={"settings"} iconSize={"3"} fontSize={"2.5"} color={"secondary"} borderRadius={'1.5'} text={"Cambiar Informacion"}/>
                </RightSidebarForms> 
            </>
            }
            { activeOption == "Contrasena" && <>
                <h3 className={styles.formDescription}>Cambiar Contraseña</h3>
                <RightSidebarForms formOptions={passwordFormOptions} setData={setPasswordData} data={passwordData}>
                    <MainButton disabled={false} type={'submit'} icon={"lock-open"} iconSize={"3"} fontSize={"2.5"} color={"secondary"} borderRadius={'1.5'} text={"Cambiar Informacion"}/>
                </RightSidebarForms>
            </>
            }
            { activeOption == "Correo" && <>
                <h3 className={styles.formDescription}>Cambiar Correo</h3>
                <RightSidebarForms formOptions={emailDataOptions} setData={setMailData} data={mailData}>
                    <MainButton disabled={false} type={'submit'} icon={"mail"} iconSize={"3"} fontSize={"2.5"} color={"secondary"} borderRadius={'1.5'} text={"Cambiar Correo"}/>
                </RightSidebarForms>
            </>
            }
            { activeOption == "ImagenPerfil" && <>
                <h3 className={styles.formDescription}>Cambiar Foto de Perfil</h3>
                <div className={styles.imageUploadContainer}>
                    <SubidaImagenes thumb={thumb} thumbInner={thumbInner} files={imagen} setFiles={setImagen}/>
                    <MainButton disabled={imagen.length == 0} type={'submit'} icon={"mail"} iconSize={"3"} fontSize={"2.5"} color={"secondary"} borderRadius={'1.5'} text={"Cambiar Avatar"}/>
                </div>
            </>}
        </div>
    )
}