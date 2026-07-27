import { useEffect, useState } from "react";
import styles from "./ObjectivesForm.module.css";
import RightSidebarForms from "./RightSidebarForms";
import MainButton from "./MainButton";
import OptionButton from "./OptionButton";
import SubidaImagenes from "./SubidaImagenes";
import { useAuth } from "../context/AuthProvider";
import { checkNutritionalObjectives, validateAutomaticData } from "./utils/validators";
import backendAPI from "../api/axiosConfig";
import RightSidebarErrors from "./RightSidebarErrors";
import Swal from "sweetalert2";
import { useUpdateData } from "../context/UpdateDataProvider";
import { useRightSidebar } from "../context/RightSidebarProvider";

export default function ObjectivesForm(){

    const [ loading, setLoading ] = useState(false);
    const [ activeOption, setActiveOption ] = useState("automatico");
    const [ errorsHandler, setErrorsHandler ] = useState({});
    const [ personas, setPersonas ] = useState(1);
    const { refreshAccessToken } = useAuth();
    const { setNewObjectives } = useUpdateData();
    const { nutritionalObjectives: nutritionalObjectivesData } = useRightSidebar();
    const [automaticData, setAutomaticData] = useState({
        peso: 0,
        altura: 0,
        edad: 0,
        genero: "Masculino",
        frecuencia_ejercicio: "1 dia"
    });

    const mainFormOptions = [
        { type: "number", name: "calorias", label: "Calorias (kcal):"},
        { type: "number", name: "proteina", label: "Proteinas (g):"},
        { type: "number", name: "carbohidratos", label: "Carbohidratos (g):"},
        { type: "number", name: "grasas_saturadas", label: "Grasas Saturadas (g):"},
        { type: "number", name: "grasas_insaturadas", label: "Grasas Insaturadas (g):"},
        { type: "number", name: "grasas_trans", label: "Grasas Trans (g):"},
        { type: "number", name: "sodio", label: "Sodio (mg):"}
    ];

    const automaticFormOptions = [
        { type: "number", name: "peso", label: "Peso (kg):", placeholder: "Ej. 70" },
        { type: "number", name: "altura", label: "Altura (cm):", placeholder: "Ej. 175" },
        { type: "number", name: "edad", label: "Edad (años):", placeholder: "Ej. 25" },
        { 
            type: "select", 
            name: "genero", 
            label: "Selecciona género:", 
            options: ["Masculino", "Femenino"] 
        },
        { 
            type: "select", 
            name: "frecuencia_ejercicio", 
            label: "Cuantos dias haces ejercicio por semana?", 
            options: ['Nada', "1 dia", "2 dias", "3 dias", "4 dias", "5 dias", "6 dias", "7 dias", "Intensivo, todos los dias"]
        }
    ];

    const options = [
        { type: 'manual', icon: 'hardware-chip', label: 'Manual' },
        { type: 'automatico', icon: 'person', label: 'Automatico' },
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
                await backendAPI.patch(`/plan_alimenticio/${nutritionalObjectivesData.plan_id}/actualizar-objetivos/`, {
                    objetivo_calorias: nutritionalObjectives.calorias,
                    objetivo_proteinas: nutritionalObjectives.proteina,
                    objetivo_carbohidratos: nutritionalObjectives.carbohidratos,
                    objetivo_grasas_saturadas: nutritionalObjectives.grasas_saturadas,
                    objetivo_grasas_insaturadas: nutritionalObjectives.grasas_insaturadas,
                    objetivo_grasas_trans: nutritionalObjectives.grasas_trans,
                    objetivo_sodio: nutritionalObjectives.sodio,
                    personas
                })
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

    const handleAutomaticNutritionalValues = async e => {
        e.preventDefault();
        setLoading(true);
        let errors = validateAutomaticData(automaticData);
        setErrorsHandler(errors);
        if(Object.keys(errors).length == 0){
            // Calculate the nutritional needs of the user
            let dias = automaticData.frecuencia_ejercicio.split(' ')[0];
            let intensidadEjercicio = (dias == 'Nada' ? 1.2 : ((dias == '1' || dias == '2' || dias == '3') ? 1.3 : ((dias == '5' || dias == '4') ? 1.55 : ((dias == '6' || dias == '7') ? 1.7 : 1.9)) ))
            let targetCalories = ((Number(automaticData.peso)*10)+(Number(automaticData.altura)*6.25)-(Number(automaticData.edad)*5)+(automaticData.genero == 'Masculino' ? 5 : -161)) * intensidadEjercicio;
            const objetivos = {
                calorias: Math.round(targetCalories),
                proteina: Math.round(((targetCalories) * 0.2) / 4),
                carbohidratos: Math.round(((targetCalories) * 0.5) / 4),
                grasas_saturadas: Math.round(((targetCalories) * 0.1) / 9),
                grasas_insaturadas: Math.round(((targetCalories) * 0.2) / 9),
                grasas_trans: nutritionalObjectives.grasas_trans,
                sodio: nutritionalObjectives.sodio,
                personas: 1
            };
            try{
                setNewObjectives(objetivos);
                await backendAPI.patch(`/plan_alimenticio/${nutritionalObjectivesData.plan_id}/actualizar-objetivos/`, {
                    objetivo_calorias: objetivos.calorias,
                    objetivo_proteinas: objetivos.proteina,
                    objetivo_carbohidratos: objetivos.carbohidratos,
                    objetivo_grasas_saturadas: objetivos.grasas_saturadas,
                    objetivo_grasas_insaturadas: objetivos.grasas_insaturadas,
                    objetivo_grasas_trans: nutritionalObjectives.grasas_trans,
                    objetivo_sodio: nutritionalObjectives.sodio,
                    personas: 1
                });
                Swal.fire({
                    icon: "success",
                    title: "Objetivos actualizados",
                    text: 'Se han actualizado los objetivos basados en los valores proporcionados!',
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
                    await refreshAccessToken(handleAutomaticNutritionalValues, e);
                }
            } finally{
                setLoading(false);
            }
        }
        setLoading(false);
    };

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
            <h3 className={styles.formDescription}>Cambiar Objetivos Nutricionales</h3>
            <RightSidebarErrors errors={errorsHandler} />
            { activeOption == 'manual' && <p className={styles.nutritionWarning}>ATENCION: Solo modifica los valores nutricionales si sabes lo que haces. En caso contrario, pide ayuda a un nutriologo.</p>}
            { activeOption == 'manual' && <RightSidebarForms twoOnOne={true} action={handleChangeInformation} formOptions={mainFormOptions} setData={setNutritionalObjectives} data={nutritionalObjectives}>
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
            </RightSidebarForms>} 
            { activeOption == 'automatico' &&  <RightSidebarForms twoOnOne={false} action={handleAutomaticNutritionalValues} formOptions={automaticFormOptions} setData={setAutomaticData} data={automaticData}>
                <MainButton disabled={loading} type="submit" icon="flame" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={loading ? "Cambiando..." : "Calcular Objetivos"} />
            </RightSidebarForms>}
        </div>
    )
}