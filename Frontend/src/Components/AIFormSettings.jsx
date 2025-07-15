import RightSidebarErrors from "./RightSidebarErrors";
import styles from "./AIFormSettings.module.css";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import OptionButton from "./OptionButton";
import RightSidebarForms from "./RightSidebarForms";
import MainButton from "./MainButton";
import { validateIngredientData, validateObjetivosData } from "./utils/validators";
import Swal from "sweetalert2";
import backendAPI from "../api/axiosConfig";
import { useRightSidebar } from "../context/RightSidebarProvider";
import { useUpdateData } from "../context/UpdateDataProvider";
import PreconfiguracionIA from "./PreconfiguracionIA";


export default function AIFormSettings(){
    const [ activeOption, setActiveOption ] = useState("avanzado");
    const [ loading, setLoading ] = useState(false);
    const [ errorsHandler, setErrorsHandler ] = useState({});
    const [ updateID, setUpdateID ] = useState(-1);
    const { refreshAccessToken, isSuperUser, isStaff } = useAuth();
    const { aiFormUpdatePreset } = useRightSidebar();
    const { setCreatedPreset, setUpdatedPreset } = useUpdateData();

    const ManageIngredientsFormOptions = [
        { type: "text", name: "nombre", label: "Nombre de la preconfiguracion:"},
        { type: "text", name: "descripcion", label: "Descripcion:"},
        { type: "slider", step: "5", name: "proteinas", label: "Proteinas (%)", defaultValue: 100, max: 200, min: 0, showInput: false, additionalText: '%'},
        { type: "slider", step: "5", name: "carbohidratos", label: "Carbohidratos (%)", defaultValue: 100, max: 200, min: 0, showInput: false, additionalText: '%'},
        { type: "slider", step: "5", name: "grasas_saturadas", label: "Grasas Saturadas (%)", defaultValue: 100, max: 200, min: 0, showInput: false, additionalText: '%'},
        { type: "slider", step: "5", name: "grasas_insaturadas", label: "Grasas Insaturadas (%)", defaultValue: 100, max: 200, min: 0, showInput: false, additionalText: '%'},
        { type: "slider", step: "5", name: "grasas_trans", label: "Grasas Trans (%)", defaultValue: 100, max: 200, min: 0, showInput: false, additionalText: '%'},
        { type: "slider", step: "5", name: "sodio", label: "Sodio (%)", defaultValue: 15, max: 100, min: 0, showInput: false, additionalText: '%'},
    ];

    const options = [
        { type: 'avanzado', icon: 'person', label: 'Preconfiguracion' },
        { type: 'entrenamiento', icon: 'hardware-chip', label: 'Entrenamiento' },
    ];

    const [ preconfiguracionData, setPreconfiguracionData ] = useState({
        nombre: "",
        descripcion: "",
        proteinas: 100,
        carbohidratos: 100,
        grasas_saturadas: 100,
        grasas_insaturadas: 100,
        grasas_trans: 100,
        sodio: 15
    });

    const handleChangeInformation = async e => {
        e.preventDefault();
        setLoading(true);
        let errors = validateObjetivosData(preconfiguracionData);
        setErrorsHandler(errors);
        if(Object.keys(errors).length === 0){
            try{
                if(updateID == -1){
                    const response = await backendAPI.post('objetivos_ai/', {
                        nombre: preconfiguracionData.nombre,
                        descripcion: preconfiguracionData.descripcion,
                        objetivo_carbohidrato: preconfiguracionData.carbohidratos,
                        objetivo_proteina: preconfiguracionData.proteinas,
                        objetivo_grasa_saturada: preconfiguracionData.grasas_saturadas,
                        objetivo_grasa_insaturada: preconfiguracionData.grasas_insaturadas,
                        objetivo_grasa_trans: preconfiguracionData.grasas_trans,
                        objetivo_sodio: preconfiguracionData.sodio 
                    });
                    setPreconfiguracionData({
                        nombre: "",
                        descripcion: "",
                        proteinas: 100,
                        carbohidratos: 100,
                        grasas_saturadas: 100,
                        grasas_insaturadas: 100,
                        grasas_trans: 100,
                        sodio: 15
                    });
                    setCreatedPreset(response.data);
                    Swal.fire({
                        icon: "success",
                        title: "Preconfiguracion creada",
                        text: 'Ahora estara disponibles en el plan alimenticio!',
                        showConfirmButton: true,
                        customClass: {
                            title: "swal_title",
                            icon: "swal_icon",
                            htmlContainer: "swal_text",
                            confirmButton: "swal_confirm"
                        }
                    });
                } else{
                    const response = await backendAPI.put(`objetivos_ai/${updateID}/`, {
                        nombre: preconfiguracionData.nombre,
                        descripcion: preconfiguracionData.descripcion,
                        objetivo_carbohidrato: preconfiguracionData.carbohidratos,
                        objetivo_proteina: preconfiguracionData.proteinas,
                        objetivo_grasa_saturada: preconfiguracionData.grasas_saturadas,
                        objetivo_grasa_insaturada: preconfiguracionData.grasas_insaturadas,
                        objetivo_grasa_trans: preconfiguracionData.grasas_trans,
                        objetivo_sodio: preconfiguracionData.sodio 
                    });
                    setUpdatedPreset(response.data);
                    Swal.fire({
                        icon: "success",
                        title: "Preconfiguracion modificada",
                        text: 'Se actualizaron los datos del preajuste!',
                        showConfirmButton: true,
                        customClass: {
                            title: "swal_title",
                            icon: "swal_icon",
                            htmlContainer: "swal_text",
                            confirmButton: "swal_confirm"
                        }
                    });
                }
            } catch(error){
                console.log(error);
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

    const changeActiveOption = type => {
        setActiveOption(type);
        setErrorsHandler({});
    }

    useEffect(() => {
        if(Object.keys(aiFormUpdatePreset).length >= 1){
                        console.log(aiFormUpdatePreset);

            setUpdateID(aiFormUpdatePreset.id);
            setPreconfiguracionData({
                nombre: aiFormUpdatePreset.nombre,
                descripcion: aiFormUpdatePreset.descripcion,
                proteinas: aiFormUpdatePreset.objetivo_proteina,
                carbohidratos: aiFormUpdatePreset.objetivo_carbohidrato,
                grasas_saturadas: aiFormUpdatePreset.objetivo_grasa_saturada,
                grasas_insaturadas: aiFormUpdatePreset.objetivo_grasa_insaturada,
                grasas_trans: aiFormUpdatePreset.objetivo_grasa_trans,
                sodio: aiFormUpdatePreset.objetivo_sodio
            });
        } else{
            setUpdateID(-1);
            setPreconfiguracionData({
                nombre: "",
                descripcion: "",
                proteinas: 100,
                carbohidratos: 100,
                grasas_saturadas: 100,
                grasas_insaturadas: 100,
                grasas_trans: 100,
                sodio: 15
            })
        }
    }, [aiFormUpdatePreset]);

    return(
        <div className={styles.changeProfileForm}>

            {isSuperUser && <div className={styles.formOptions}>
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
            </div>}

            <h3 className={styles.formDescription}>
                {activeOption === "avanzado" && "Configura la preconfiguracion"}
                {activeOption === "entrenamiento" && "Reentrena el modelo"}
            </h3>

            <RightSidebarErrors errors={errorsHandler} />

            {activeOption === "avanzado" && (
                <RightSidebarForms twoOnOne={false} formOptions={ManageIngredientsFormOptions} setData={setPreconfiguracionData} data={preconfiguracionData}>
                    <MainButton action={handleChangeInformation} disabled={loading} type="submit" icon="hardware-chip" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={loading ? (updateID != -1 ? "Editando..." : "Creando...")  : (updateID != -1 ? "Editar Preajuste" : "Crear Preajuste")}/>
                </RightSidebarForms> 
            )}

            {activeOption === "entrenamiento" && isSuperUser && (
                <div className={styles.retrainModelContainer}>
                    <p className={styles.retrainWarning}>ATENCION: Esta accion reentrenara el modelo con la informacion de recetas que tengan calificacion actual, ademas, esta accion tomara tiempo!</p>
                    <MainButton disabled={loading} type="submit" icon="hardware-chip" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={"Reentrenar"}/>
                </div>
            )}
        </div>
    )
}