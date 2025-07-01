import { useEffect, useState } from "react";
import styles from "./ObjectivesForm.module.css";
import RightSidebarForms from "./RightSidebarForms";
import MainButton from "./MainButton";
import OptionButton from "./OptionButton";
import SubidaImagenes from "./SubidaImagenes";
import { useAuth } from "../context/AuthProvider";
import { checkNutritionalObjectives } from "./utils/validators";
import backendAPI from "../api/axiosConfig";
import RightSidebarErrors from "./RightSidebarErrors";
import Swal from "sweetalert2";
import { useUpdateData } from "../context/UpdateDataProvider";
import { useRightSidebar } from "../context/RightSidebarProvider";

export default function ObjectivesForm(){

    const [ loading, setLoading ] = useState(false);
    const [ errorsHandler, setErrorsHandler ] = useState({});
    const [ personas, setPersonas ] = useState(1);
    const { user, changeUserData, refreshAccessToken, getUserData } = useAuth();
    const { setNewObjectives } = useUpdateData();
    const { nutritionalObjectives: nutritionalObjectivesData } = useRightSidebar();

    const mainFormOptions = [
        { type: "number", name: "calorias", label: "Calorias (kcal):"},
        { type: "number", name: "proteina", label: "Proteinas (g):"},
        { type: "number", name: "carbohidratos", label: "Carbohidratos (g):"},
        { type: "number", name: "grasas_saturadas", label: "Grasas Saturadas (g):"},
        { type: "number", name: "grasas_insaturadas", label: "Grasas Insaturadas (g):"},
        { type: "number", name: "grasas_trans", label: "Grasas Trans (g):"},
        { type: "number", name: "sodio", label: "Sodio (mg):"}
    ];

    const [ nutritionalObjectives, setNutritionalObjectives ] = useState({
        calorias: 2000,               // kcal
        proteina: 50,                 // g
        carbohidratos: 275,          // g
        grasas_saturadas: 20,        // g
        grasas_insaturadas: 44,      // g
        grasas_trans: 2,             // g
        sodio: 2300                  // mg
    });

    useEffect(() => {
        setNutritionalObjectives(nutritionalObjectivesData.objectives);
    }, [nutritionalObjectivesData]);

    const handleChangeInformation = async e => {
        e.preventDefault();
        setLoading(true);
        let newObjectives = nutritionalObjectives;
        newObjectives.personas = personas;
        let errors = checkNutritionalObjectives(newObjectives);
        setErrorsHandler(errors);
        if(Object.keys(errors).length == 0){
            try{
                setNewObjectives(nutritionalObjectives);
                const response = await backendAPI.patch(`/plan_alimenticio/${nutritionalObjectivesData.plan_id}/actualizar-objetivos/`, {
                    objetivo_calorias: nutritionalObjectives.calorias,
                    objetivo_proteinas: nutritionalObjectives.proteina,
                    objetivo_carbohidratos: nutritionalObjectives.carbohidratos,
                    objetivo_grasas_saturadas: nutritionalObjectives.grasas_saturadas,
                    objetivo_grasas_insaturadas: nutritionalObjectives.grasas_insaturadas,
                    objetivo_grasas_trans: nutritionalObjectives.grasas_trans,
                    objetivo_sodio: nutritionalObjectives.sodio,
                    personas
                })
                console.log(response);
                Swal.fire({
                    icon: "success",
                    title: "Objetivos actualizados",
                    text: 'Se han actualizado los objetivos con exito',
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
    };

    return(
        <div className={styles.changeProfileForm}>
            <h3 className={styles.formDescription}>Cambiar Objetivos Nutricionales</h3>
            <RightSidebarErrors errors={errorsHandler} />

            <RightSidebarForms twoOnOne={true} action={handleChangeInformation} formOptions={mainFormOptions} setData={setNutritionalObjectives} data={nutritionalObjectives}>
                <div className={styles.portionSliderContainer}>
                    <p className={styles.portionSliderText}>Personas: <span className={styles.portionSliderValue}>{personas}</span></p>
                    <input
                    type="range"
                    min="1"
                    max="20"
                    value={personas}
                    onChange={(e) => setPersonas(Number(e.target.value))}
                    className={styles.portionSlider}
                    />
                </div>
                <MainButton disabled={loading} type="submit" icon="flame" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={loading ? "Cambiando..." : "Cambiar Objetivos"} />
            </RightSidebarForms> 
        </div>
    )
}