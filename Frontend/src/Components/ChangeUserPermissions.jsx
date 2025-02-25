import { useEffect, useState } from "react";
import styles from "./ChangeUserPermissions.module.css";
import RightSidebarForms from "./RightSidebarForms";
import { validateUserForm } from "./utils/validators";
import MainButton from "./MainButton";
import Swal from "sweetalert2";
import backendAPI from "../api/axiosConfig";
import { useRightSidebar } from "../context/RightSidebarProvider";
import { useAuth } from "../context/AuthProvider";
import RightSidebarErrors from "./RightSidebarErrors";
import { useUpdateData } from "../context/UpdateDataProvider";

export default function ChangeUserPermissions(){

    const { userModify } = useRightSidebar();
    const { refreshAccessToken } = useAuth();
    const { setUpdatedUser, setDisabledUser, } = useUpdateData();

    const mainFormOptions = [
        { type: "select", name: "rol", label: "Rol de usuario", defaultOption: "Usuario", options: ["Usuario", "Moderador", "Administrador"]},
        { type: "select", name: "activo", label: "Estado de la cuenta:", defaultOption: "Activado", options: ["Desactivado", "Activado"]}
    ];

    const [ permissionData, setPermissionData ] = useState({
        rol: userModify.role,
        activo: userModify.status
    });

    useEffect(() => {
        if(userModify != {}){
            setPermissionData({
                rol: userModify.role,
                activo: userModify.status  
            })
        }
    }, [userModify]);

    const [ loading, setLoading ] = useState(false);
    const [ errorsHandler, setErrorsHandler ] = useState([]);

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        let errors = validateUserForm(permissionData);
        setErrorsHandler(errors);
        if(Object.keys(errors).length === 0){
            try{
                await backendAPI.put(`/users/update/${userModify.id}/`, {
                    role: permissionData.rol,
                    status: permissionData.activo
                });
                Swal.fire({
                    icon: "success",
                    title: "Permisos modificados",
                    text: 'Los permisos del usuario han sido modificados con exito',
                    showConfirmButton: true,
                    customClass: {
                        title: "swal_title",
                        icon: "swal_icon",
                        htmlContainer: "swal_text",
                        confirmButton: "swal_confirm"
                    }
                });
                if(permissionData.activo == 'Desactivado'){
                    console.log(userModify.id);
                    setDisabledUser(userModify.id);
                } else{
                    setUpdatedUser({ ...userModify, role: permissionData.rol });
                }
            } catch(error){
                console.log(error);
                if(error.response?.status == 401){
                    await refreshAccessToken(handleSubmit, e);
                } else{
                    setErrorsHandler(error.response.data);
                }
            } finally{
                setLoading(false);
            }
        }
        setLoading(false);
    }

    return(
        <div className={styles.changeProfileForm}>
            <h3 className={styles.formDescription}>Cambiar Permisos de {userModify.name}</h3>
            <RightSidebarErrors errors={errorsHandler}/>
            <RightSidebarForms action={handleSubmit} formOptions={mainFormOptions} setData={setPermissionData} data={permissionData}>
                <MainButton disabled={loading} type={'submit'} icon={"settings"} iconSize={"3"} fontSize={"2.5"} color={"secondary"} borderRadius={'1.5'} text={loading ? "Cambiando..." : "Cambiar Permisos"}/>
            </RightSidebarForms>
        </div>
    )
}