import RightSidebarErrors from "./RightSidebarErrors";
import styles from "./AIForm.module.css";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import OptionButton from "./OptionButton";
import RightSidebarForms from "./RightSidebarForms";
import MainButton from "./MainButton";
import { validateIngredientData } from "./utils/validators";
import Swal from "sweetalert2";
import backendAPI from "../api/axiosConfig";
import { useRightSidebar } from "../context/RightSidebarProvider";
import { useUpdateData } from "../context/UpdateDataProvider";
import PreconfiguracionIA from "./PreconfiguracionIA";


export default function AIForm(){
    const [ activeOption, setActiveOption ] = useState("preconfiguracion");
    const [ loading, setLoading ] = useState(false);
    const [ errorsHandler, setErrorsHandler ] = useState({});
    const [ activeSetting, setActiveSetting ] = useState(-1);
    const { refreshAccessToken, isSuperUser, isStaff } = useAuth();

    const dummySettings = [
        {
            id: 1,
            title: "Saludable",
            description: "Si quieres elegir una configuracion saludable",
            sodio: 0,
            proteinas: 100,
            carbohidratos: 100,
            grasas_saturadas: 100,
            grasas_insaturadas: 100,
            grasas_trans: 100
        },
        {
            id: 2,
            title: "Alta en proteínas",
            description: "Ideal para quienes buscan aumentar masa muscular",
            sodio: 0,
            proteinas: 150,
            carbohidratos: 80,
            grasas_saturadas: 90,
            grasas_insaturadas: 110,
            grasas_trans: 50
        },
        {
            id: 3,
            title: "Baja en carbohidratos",
            description: "Para dietas bajas en azúcares y almidones",
            sodio: 0,
            proteinas: 110,
            carbohidratos: 40,
            grasas_saturadas: 70,
            grasas_insaturadas: 100,
            grasas_trans: 30
        },
        {
            id: 4,
            title: "Vegana",
            description: "Sin productos de origen animal",
            sodio: 0,
            proteinas: 90,
            carbohidratos: 100,
            grasas_saturadas: 60,
            grasas_insaturadas: 120,
            grasas_trans: 0
        },
        {
            id: 5,
            title: "Alta energía",
            description: "Para quienes necesitan muchas calorías diarias",
            sodio: 0,
            proteinas: 130,
            carbohidratos: 160,
            grasas_saturadas: 130,
            grasas_insaturadas: 110,
            grasas_trans: 70
        },
        {
            id: 6,
            title: "Keto",
            description: "Para dietas cetogénicas con muy bajo consumo de carbohidratos",
            sodio: 0,
            proteinas: 100,
            carbohidratos: 20,
            grasas_saturadas: 110,
            grasas_insaturadas: 140,
            grasas_trans: 10
        }    
    ]

    const ManageIngredientsFormOptions = [
        { type: "slider", step: "1", name: "proteinas", label: "Proteinas (%)", defaultValue: 100, max: 200, min: 0, showInput: false},
        { type: "slider", step: "1", name: "carbohidratos", label: "Carbohidratos (%)", defaultValue: 100, max: 200, min: 0, showInput: false},
        { type: "slider", step: "1", name: "grasas_saturadas", label: "Grasas Saturadas (%)", defaultValue: 100, max: 200, min: 0, showInput: false},
        { type: "slider", step: "1", name: "grasas_insaturadas", label: "Grasas Insaturadas (%)", defaultValue: 100, max: 200, min: 0, showInput: false},
        { type: "slider", step: "1", name: "grasas_trans", label: "Grasas Trans (%)", defaultValue: 100, max: 200, min: 0, showInput: false},
        { type: "slider", step: "1", name: "sodio", label: "Sodio (%)", defaultValue: 15, max: 100, min: 0, showInput: false},
    ];

    const options = [
        { type: 'preconfiguracion', icon: 'hardware-chip', label: 'Preconfigurado' },
        { type: 'avanzado', icon: 'person', label: 'Personalizado' },
    ];

    const [ ingredientData, setIngredientData ] = useState({
        proteinas: 100,
        carbohidratos: 100,
        grasas_saturadas: 100,
        grasas_insaturadas: 100,
        grasas_trans: 100,
        sodio: 15
    });
    const [ visibilityData, setVisibilityData ] = useState({
        visibilidad: "Personal",
    });

    /*const handleChangeInformation = async e => {
        e.preventDefault();
        setLoading(true);
        let errors = validateIngredientData(ingredientData);
        setErrorsHandler(errors);
        if(Object.keys(errors).length === 0){
            const formData = new FormData();
            try{
                // Preparado de la informacion
                formData.append('nombre', ingredientData.nombre);
                formData.append('consistencia', ingredientData.consistencia.toLowerCase());
                formData.append('calorias', parseFloat(ingredientData.calorias)/100);
                formData.append('carbohidratos', parseFloat(ingredientData.carbohidratos)/100);
                formData.append('proteinas', parseFloat(ingredientData.proteinas)/100);
                formData.append('grasas_saturadas', parseFloat(ingredientData.grasasSaturadas)/100);
                formData.append('grasas_insaturadas', parseFloat(ingredientData.grasasInsaturadas)/100);
                formData.append('grasas_trans', parseFloat(ingredientData.grasasTrans)/100);
                formData.append('sodio', parseFloat(ingredientData.sodio)/100);
                formData.append('tipo', visibilityData.visibilidad.toLowerCase());
                if(imagen.length == 1){
                    formData.append('foto_ingrediente', imagen[0]);
                }
                if(willUserModifyIngredient){
                    const response = await backendAPI.put(`ingredientes/${ingredientModify.id}/`, formData);
                    Swal.fire({
                        icon: "success",
                        title: "Ingrediente Modificado",
                        text: response.data.message,
                        showConfirmButton: true,
                        customClass: {
                            title: "swal_title",
                            icon: "swal_icon",
                            htmlContainer: "swal_text",
                            confirmButton: "swal_confirm"
                        }
                    });
                    setUpdatedIngredient(response.data);
                } else{
                    const response = await backendAPI.post('ingredientes/', formData);
                    setIngredientData({
                        nombre: "",
                        consistencia: "Liquido",
                        calorias: '0',
                        carbohidratos: '0',
                        proteinas: '0',
                        grasasSaturadas: '0',
                        grasasInsaturadas: '0',
                        grasasTrans: '0',
                        sodio: '0'
                    });
                    setImagen([]);
                    setVisibilityData({visibilidad: 'Personal'});
                    Swal.fire({
                        icon: "success",
                        title: "Ingrediente Creado",
                        text: response.data.message,
                        showConfirmButton: true,
                        customClass: {
                            title: "swal_title",
                            icon: "swal_icon",
                            htmlContainer: "swal_text",
                            confirmButton: "swal_confirm"
                        }
                    });
                    setCreatedIngredient(response.data);
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
    }*/

    const handleChangeVisibility = async e => {
        e.preventDefault();
    }

    const changeActiveOption = type => {
        setActiveOption(type);
        setErrorsHandler({});
    }

    const handleSetting = id => {
        if(id == activeSetting){
            setActiveSetting(-1);
        } else{
            setActiveSetting(id);
        }
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
                {activeOption === "avanzado" && "Prioriza tus nutrientes"}
                {activeOption === "preconfiguracion" && "Elige una configuracion"}
            </h3>

            <RightSidebarErrors errors={errorsHandler} />

            {activeOption === "avanzado" && (
                <RightSidebarForms twoOnOne={false} formOptions={ManageIngredientsFormOptions} setData={setIngredientData} data={ingredientData}>
                    <MainButton disabled={loading} type="submit" icon="nutrition" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={"Seleccionar Ingredientes"}/>
                </RightSidebarForms> 
            )}

            {activeOption === "preconfiguracion" && (
                <div className={styles.preconfiguracionesMainContainer}>
                    <div className={styles.preconfiguracionesContainer}>
                        {dummySettings.map(preconfiguracion => <PreconfiguracionIA key={preconfiguracion.id} activeSetting={activeSetting} handleSetting={handleSetting} data={preconfiguracion} isDataOnForm={true}/>)}
                    </div>
                    <MainButton disabled={loading} type="submit" icon="nutrition" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={"Seleccionar Ingredientes"}/>
                </div>
            )}
        </div>
    )
}