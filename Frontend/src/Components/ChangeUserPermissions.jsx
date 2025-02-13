import { useState } from "react";
import styles from "./ChangeUserPermissions.module.css";
import RightSidebarForms from "./RightSidebarForms";
import MainButton from "./MainButton";

export default function ChangeUserPermissions(){

    const mainFormOptions = [
        { type: "select", name: "rol", label: "Rol de usuario", defaultOption: "Usuario", options: ["Usuario", "Moderador", "Administrador"]},
        { type: "select", name: "activo", label: "Estado de la cuenta:", defaultOption: "Activado", options: ["Desactivado", "Activado"]}
    ];

    const [ permissionData, setPermissionData ] = useState({
        rol: "",
        activo: ""
    });

    return(
        <div className={styles.changeProfileForm}>
            <h3 className={styles.formDescription}>Cambiar Permisos</h3>
            <RightSidebarForms formOptions={mainFormOptions} setData={setPermissionData} data={permissionData}>
                <MainButton disabled={false} type={'submit'} icon={"settings"} iconSize={"3"} fontSize={"2.5"} color={"secondary"} borderRadius={'1.5'} text={"Cambiar Informacion"}/>
            </RightSidebarForms>
        </div>
    )
}