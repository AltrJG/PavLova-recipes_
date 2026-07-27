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
    const { user, changeUserData, refreshAccessToken, getUserData, getUserPermissions, permissions } = useAuth();

    const mainFormOptions = [
        { type: "text", name: "username", label: "Nombre:"},
        { type: "text", name: "country", label: "Pais:"},
        { type: "text", name: "facebook_link", label: "Enlace a Facebook:"},
        { type: "text", name: "twitter_link", label: "Enlace a Twitter/X:"},
        { type: "text", name: "youtube_link", label: "Enlace a Youtube:"},
        { type: "textarea", name: "about", label: "Sobre Mi:"}
    ];

    const passwordFormOptions = [
        { type: "password", name: "current_password", label: "Contraseña Actual:"},
        { type: "password", name: "new_password", label: "Nueva Contraseña:"},
        { type: "password", name: "new_password_confirm", label: "Repite la Nueva Contraseña:"},
    ];

    const emailDataOptions = [
        { type: "email", name: "new_email", label: "Nuevo Correo: "},
        { type: "password", name: "password", label: "Contraseña: " }
    ];

    const options = [
        { type: 'Informacion', icon: 'information-circle', label: 'Informacion', can: true},
        { type: 'Contrasena', icon: 'lock-open', label: 'Contraseña', can: true },
        { type: 'Correo', icon: 'mail', label: 'Correo', can: permissions['users.delete_emailchangerequest'] || permissions['users.change_emailchangerequest'] || permissions['users.add_emailchangerequest'] },
        { type: 'ImagenPerfil', icon: 'aperture', label: 'Avatar', can: permissions['users.delete_profilepicturejob'] || permissions['users.change_profilepicture'] || permissions['users.add_profilepicture'] }
    ];

    const [ userData, setUserData ] = useState({
        username: user?.nombre,
        country: user?.pais,
        facebook_link: user?.redFacebook,
        twitter_link: user?.redTwitter,
        youtube_link: user?.redYoutube,
        about: user?.sobreMi
    });

    const [ passwordData, setPasswordData ] = useState({
        current_password: "",
        new_password: "",
        new_password_confirm: ""
    })

    const [ mailData, setMailData ] = useState({
        new_email: user?.email,
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
                const response = await backendAPI.patch('users/me/', userData);
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
                const response = await backendAPI.post('users/me/password/', passwordData);
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
                    current_password: "",
                    new_password: "",
                    new_password_confirm: ""
                });
            } catch(error){
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
                const response = await backendAPI.post('users/me/email/', mailData);
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
                await getUserPermissions();
            } catch(error){
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
        formData.append("original", imagen[0]);
        try{
            const response = await backendAPI.post('users/me/picture/', formData);
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
            await getUserPermissions();
            setImagen([]);
            setErrorsHandler({});
        } catch(error){
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
                    option.can
                    && <OptionButton 
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