import RightSidebarErrors from "./RightSidebarErrors";
import styles from "./HealthScoreForm.module.css";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import RightSidebarForms from "./RightSidebarForms";
import MainButton from "./MainButton";
import { validateChangeVisibility, validateHealthData } from "./utils/validators";
import Swal from "sweetalert2";
import backendAPI from "../api/axiosConfig";
import { useRightSidebar } from "../context/RightSidebarProvider";
import { useUpdateData } from "../context/UpdateDataProvider";


export default function HealthScoreForm(){
    const [ loading, setLoading ] = useState(false);
    const [ errorsHandler, setErrorsHandler ] = useState({});
    const { refreshAccessToken } = useAuth();
    const { healthScoreData } = useRightSidebar();
    const { setNewRecipeScoreData } = useUpdateData();

    const HealthOptions = [
        { type: 'slider', name: "puntuacion", min: 0, max: 500, step: '10', defaultValue: 0, label: "Puntuacion (0-500)", additionalText: '' },
        { type: "select", name: "verificado", defaultOption: "Verdadero", label: "Permitir su uso para el entrenamiento?:", options: ["Utilizar", "No Utilizar"]},
    ];

    const [ healthData, setHealthData ] = useState({
        puntuacion: healthScoreData.scores.puntuacion,
        verificado: healthScoreData.scores.verificado ? 'Utilizar' : 'No Utilizar',
    });

    const handleChangeInformation = async e => {
        e.preventDefault();
        setLoading(true);
        let errors = validateHealthData(healthData);
        setErrorsHandler(errors);
        if(Object.keys(errors).length === 0){
            try{
                const response = await backendAPI.patch(`recetas/${healthScoreData.id}/actualizar-puntuacion/`, {
                    puntuacion: healthData.puntuacion,
                    verificado: healthData.verificado == "Utilizar" ? true : false
                });
                Swal.fire({
                    icon: "success",
                    title: "Puntuacion actualizada",
                    text: 'La puntuacion y uso en el modelo se actualizo con exito',
                    showConfirmButton: true,
                    customClass: {
                        title: "swal_title",
                        icon: "swal_icon",
                        htmlContainer: "swal_text",
                        confirmButton: "swal_confirm"
                    }
                });
                setNewRecipeScoreData({puntuacion: healthData.puntuacion, verificado: healthData.verificado == "Utilizar" ? true : false});
            } catch(error){
                if(error.response?.status == 401){
                    await refreshAccessToken(handleChangeInformation, e);
                } else{
                    setErrorsHandler(error.response.data);
                }
            } finally{
                setLoading(false);
            }
        }
        setLoading(false);
    }

    useEffect(() => {
        setHealthData({
            puntuacion: healthScoreData.scores.puntuacion,
            verificado: healthScoreData.scores.verificado ? 'Utilizar' : 'No Utilizar',
        })
    }, [healthScoreData]);

    return(
        <div className={styles.changeProfileForm}>
            <h3 className={styles.formDescription}>
                {`Puntuacion de salud de la receta '${healthScoreData.nombre}'`}
            </h3>
            <p className={styles.nutritionWarning}>ATENCION: Califica la receta conforme a sus valores nutricionales en la tabla, una puntuacion incorrecta puede deteriorar el modelo.</p>
            <RightSidebarErrors errors={errorsHandler} />
            <RightSidebarForms action={handleChangeInformation} formOptions={HealthOptions} setData={setHealthData} data={healthData}>
                <MainButton disabled={loading} type="submit" icon="fitness" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={loading ? "Puntuando..." : "Puntuar receta"} />
            </RightSidebarForms>
        </div>
    )
}