import { useState } from "react";
import styles from "./ChangeProfileForm.module.css";
import RightSidebarForms from "./RightSidebarForms";
import MainButton from "./MainButton";
import OptionButton from "./OptionButton";
import SubidaImagenes from "./SubidaImagenes";
import { useAuth } from "../context/AuthProvider";
import { validateMailData, validateUserData, validatePasswordData } from "./utils/validators";
import backendAPI from "../api/axiosConfig";
import RightSidebarErrors from "./RightSidebarErrors";
import Swal from "sweetalert2";

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
    const [ loading, setLoading ] = useState(false);
    const [ errorsHandler, setErrorsHandler ] = useState({});
    const { user, changeUserData, refreshAccessToken, getUserData } = useAuth();

    const mainFormOptions = [
        { type: "text", name: "nombre", label: "Nombre:"},
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
        { type: "password", name: "password", label: "Contraseña: " }
    ];

    const options = [
        { type: 'Informacion', icon: 'information-circle', label: 'Informacion' },
        { type: 'Contrasena', icon: 'lock-open', label: 'Contraseña' },
        { type: 'Correo', icon: 'mail', label: 'Correo' },
        { type: 'ImagenPerfil', icon: 'aperture', label: 'Avatar' }
    ];

    const [ userData, setUserData ] = useState({
        nombre: user?.nombre,
        pais: user?.pais,
        facebook_link: user?.redFacebook,
        twitter_link: user?.redTwitter,
        youtube_link: user?.redYoutube,
        about_me: user?.sobreMi
    });

    const [ passwordData, setPasswordData ] = useState({
        oldPassword: "",
        newPassword: "",
        newPasswordConfirm: ""
    })

    const [ mailData, setMailData ] = useState({
        correo: user?.email,
        password: ""
    });

    const [imagen, setImagen] = useState([]);

    const handleChangeInformation = async e => {
        e.preventDefault();
        setLoading(true);
        let errors = validateUserData(userData);
        setErrorsHandler(errors);
        if(Object.keys(errors).length === 0){
            try{
                const response = await backendAPI.post('user/update_profile/', userData);
                changeUserData(userData);
                Swal.fire({
                    icon: "success",
                    title: "Informacion Modificada",
                    text: response.data.message,
                    showConfirmButton: true,
                    customClass: {
                        title: "swal_title",
                        icon: "swal_icon",
                        htmlContainer: "swal_text",
                        confirmButton: "swal_confirm"
                    }
                });
            } catch(error){
                console.log(error);
                if(error.response?.status == 401){
                    await refreshAccessToken(handleChangeInformation, e);
                }
            } finally{
                setLoading(false);
            }
        }
        setLoading(false);
    }

    const handleChangePassword = async e => {
        e.preventDefault();
        setLoading(true);
        let errors = validatePasswordData(passwordData);
        setErrorsHandler(errors);
        if(Object.keys(errors).length === 0){
            try{
                const response = await backendAPI.post('user/update_password/', passwordData);
                Swal.fire({
                    icon: "success",
                    title: "Informacion Modificada",
                    text: response.data.message,
                    showConfirmButton: true,
                    customClass: {
                        title: "swal_title",
                        icon: "swal_icon",
                        htmlContainer: "swal_text",
                        confirmButton: "swal_confirm"
                    }
                });
                setPasswordData({
                    oldPassword: "",
                    newPassword: "",
                    newPasswordConfirm: ""
                });
            } catch(error){
                console.log(error);
                if(error.response?.status == 401){
                    await refreshAccessToken(handleChangePassword, e);
                } else{
                    setErrorsHandler(error.response.data);
                }
            } finally{
                setLoading(false);
            }
        }
        setLoading(false);
    }

    const handleChangeEmail = async e => {
        e.preventDefault();
        setLoading(true);
        let errors = validateMailData(mailData);
        setErrorsHandler(errors);
        if(Object.keys(errors).length === 0){
            try{
                const response = await backendAPI.post('user/update_email/', mailData);
                Swal.fire({
                    icon: "success",
                    title: "Informacion Modificada",
                    text: response.data.message,
                    showConfirmButton: true,
                    customClass: {
                        title: "swal_title",
                        icon: "swal_icon",
                        htmlContainer: "swal_text",
                        confirmButton: "swal_confirm"
                    }
                });
                setMailData({...mailData, password: ""});
                await getUserData();
            } catch(error){
                console.log(error);
                if(error.response?.status == 401){
                    await refreshAccessToken(handleChangeEmail, e);
                } else{
                    setErrorsHandler(error.response.data);
                }
            } finally{
                setLoading(false);
            }
        }
        setLoading(false);
    }

    const handleImageSubmit = async () => {
        setLoading(true);
        let formData = new FormData();
        formData.append("profile_picture", imagen[0]);
        try{
            const response = await backendAPI.put('profile/picture/', formData);
            Swal.fire({
                icon: "success",
                title: "Foto de perfil Actualizada",
                text: response.data.message,
                showConfirmButton: true,
                customClass: {
                    title: "swal_title",
                    icon: "swal_icon",
                    htmlContainer: "swal_text",
                    confirmButton: "swal_confirm"
                }
            });
            await getUserData();
            setImagen([]);
            setErrorsHandler({});
        } catch(error){
            console.log(error);
            if(error.response?.status == 401){
                await refreshAccessToken(handleImageSubmit);
            } else{
                setErrorsHandler(error.response.data);
            }
        } finally{
            setLoading(false);
        }
    }

    const changeActiveOption = type => {
        setActiveOption(type);
        setErrorsHandler({});
    }

    return(
        <div className={styles.changeProfileForm}>

            <div className={styles.formOptions}>
                {options.map(option => (
                    <OptionButton 
                        isBackgroundBlack={true} 
                        key={option.label} 
                        option={option} 
                        active={activeOption} 
                        setData={changeActiveOption} 
                        icon={option.icon} 
                        makeRowOnMobile={false} 
                    />
                ))}  
            </div>

            <h3 className={styles.formDescription}>
                {activeOption === "Informacion" && "Cambiar Información Personal"}
                {activeOption === "Contrasena" && "Cambiar Contraseña"}
                {activeOption === "Correo" && "Cambiar Correo"}
                {activeOption === "ImagenPerfil" && "Cambiar Foto de Perfil"}
            </h3>

            <RightSidebarErrors errors={errorsHandler} />

            {activeOption === "Informacion" && (
                <RightSidebarForms action={handleChangeInformation} formOptions={mainFormOptions} setData={setUserData} data={userData}>
                    <MainButton disabled={loading} type="submit" icon="settings" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={loading ? "Cambiando..." : "Cambiar Información"} />
                </RightSidebarForms> 
            )}

            {activeOption === "Contrasena" && (
                <RightSidebarForms action={handleChangePassword} formOptions={passwordFormOptions} setData={setPasswordData} data={passwordData}>
                    <MainButton disabled={loading} type="submit" icon="lock-open" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={loading ? "Cambiando..." : "Cambiar Contraseña"} />
                </RightSidebarForms>
            )}

            {activeOption === "Correo" && (
                <RightSidebarForms action={handleChangeEmail} formOptions={emailDataOptions} setData={setMailData} data={mailData}>
                    <MainButton disabled={loading} type="submit" icon="mail" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={loading ? "Cambiando..." : "Cambiar Correo"} />
                </RightSidebarForms>
            )}

            {activeOption === "ImagenPerfil" && (
                <div className={styles.imageUploadContainer}>
                    <SubidaImagenes thumb={thumb} thumbInner={thumbInner} files={imagen} setFiles={setImagen} />
                    <MainButton action={handleImageSubmit} disabled={imagen.length === 0 || loading} type="submit" icon="aperture" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={loading ? "Cambiando..." : "Cambiar Avatar"} />
                </div>
            )}
        </div>
    )
}