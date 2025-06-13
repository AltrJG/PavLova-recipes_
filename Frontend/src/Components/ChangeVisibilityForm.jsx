import RightSidebarErrors from "./RightSidebarErrors";
import styles from "./IngredientsForm.module.css";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import RightSidebarForms from "./RightSidebarForms";
import MainButton from "./MainButton";
import { validateChangeVisibility } from "./utils/validators";
import Swal from "sweetalert2";
import backendAPI from "../api/axiosConfig";
import { useRightSidebar } from "../context/RightSidebarProvider";


export default function ChangeVisibilityForm(){
    const [ loading, setLoading ] = useState(false);
    const [ errorsHandler, setErrorsHandler ] = useState({});
    const { refreshAccessToken } = useAuth();
    const { changeVisibilityData } = useRightSidebar();

    const VisibilityOptions = [
        { type: "select", name: "visibilidad", defaultOption: "Publica", label: "Visibilidad:", options: ["Publica", "Privada"]},
    ];

    const [ visibilityData, setVisibilityData ] = useState({
        visibilidad: 'Publica',
    });

    const handleChangeInformation = async e => {
        e.preventDefault();
        setLoading(true);
        let errors = validateChangeVisibility(visibilityData);
        setErrorsHandler(errors);
        if(Object.keys(errors).length === 0){
            try{
                const response = await backendAPI.patch(`recetas/${changeVisibilityData.id}/cambiar-visibilidad/`, {visibilidad: visibilityData.visibilidad == 'Publica' ? true : false});
                console.log(response.data);
                Swal.fire({
                    icon: "success",
                    title: "Visibilidad modificada",
                    text: response.data.mensaje,
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
                } else{
                    console.log(error);
                    setErrorsHandler(error.response.data);
                }
            } finally{
                setLoading(false);
            }
        }
        setLoading(false);
    }

    useEffect(() => {
        setVisibilityData({visibilidad: changeVisibilityData.visibilidad});
    }, [changeVisibilityData]);

    return(
        <div className={styles.changeProfileForm}>
            <h3 className={styles.formDescription}>
                Cambiar la visibilidad
            </h3>

            <RightSidebarErrors errors={errorsHandler} />
            <RightSidebarForms action={handleChangeInformation} formOptions={VisibilityOptions} setData={setVisibilityData} data={visibilityData}>
                <MainButton disabled={loading} type="submit" icon="eye" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={"Cambiar visibilidad"} />
            </RightSidebarForms>
        </div>
    )
}