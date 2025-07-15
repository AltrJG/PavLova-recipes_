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
import { FadeLoader } from "react-spinners";


export default function AIForm(){
    const [ activeOption, setActiveOption ] = useState("preconfiguracion");
    const [ loading, setLoading ] = useState(false);
    const [ errorsHandler, setErrorsHandler ] = useState({});
    const [ activeSetting, setActiveSetting ] = useState(-1);
    const [ presets, setPresets ] = useState([]);
    const [ loadingPresets, setLoadingPresets ] = useState(false);
    const { refreshAccessToken, isSuperUser, isStaff } = useAuth();

    const getPresets = async () => {
        setLoadingPresets(true);
        try{
            const response = await backendAPI.get(`objetivos_ai/`);
            setPresets(response.data.results);
        } catch(error){
            if(error.response?.status == 401){
                await refreshAccessToken(getPresets);
            }
        } finally{
            setLoadingPresets(false);
        }
    }

    const ManageIngredientsFormOptions = [
        { type: "slider", step: "1", name: "proteinas", label: "Proteinas (%)", defaultValue: 100, max: 200, min: 0, showInput: false, additionalText: '%'},
        { type: "slider", step: "1", name: "carbohidratos", label: "Carbohidratos (%)", defaultValue: 100, max: 200, min: 0, showInput: false, additionalText: '%'},
        { type: "slider", step: "1", name: "grasas_saturadas", label: "Grasas Saturadas (%)", defaultValue: 100, max: 200, min: 0, showInput: false, additionalText: '%'},
        { type: "slider", step: "1", name: "grasas_insaturadas", label: "Grasas Insaturadas (%)", defaultValue: 100, max: 200, min: 0, showInput: false, additionalText: '%'},
        { type: "slider", step: "1", name: "grasas_trans", label: "Grasas Trans (%)", defaultValue: 100, max: 200, min: 0, showInput: false, additionalText: '%'},
        { type: "slider", step: "1", name: "sodio", label: "Sodio (%)", defaultValue: 15, max: 100, min: 0, showInput: false, additionalText: '%'},
        { type: "slider", step: "1", name: "cantRecetas", label: "Cantidad de recetas por dia:", defaultValue: 1, max: 6, min: 1, showInput: false, additionalText: ''},
        { type: "select", name: "ajusteObjetivos", label: "Ajustar automaticamente a los objetivos nutricionales?:", defaultOption: "Si", options: ["Si", "No"]}
    ];

    const RecipesPerDayFormOptions = [
        { type: "slider", step: "1", name: "cantRecetas", label: "Cantidad de recetas por dia:", defaultValue: 1, max: 6, min: 1, showInput: false, additionalText: ''},
        { type: "select", name: "ajusteObjetivos", label: "Ajustar automaticamente a los objetivos nutricionales?:", defaultOption: "Si", options: ["Si", "No"]}
    ]

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
        sodio: 15,
        cantRecetas: 1,
        ajusteObjetivos: "Si"
    });
    const [ recipesPerDayData, setRecipesPerDayData ] = useState({
        cantRecetas: 1,
        ajusteObjetivos: "Si"
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
    };

    useEffect(() => {
        getPresets();
    }, [])

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
                    <MainButton disabled={loading} type="submit" icon="restaurant" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={"Seleccionar Recetas"}/>
                </RightSidebarForms> 
            )}

            {activeOption === "preconfiguracion" && (
                <div className={styles.preconfigContainer}><div className={styles.preconfiguracionesMainContainer}>
                    <div className={styles.preconfiguracionesContainer}>
                        {loadingPresets ? <FadeLoader color='rgba(252,115,2,1)'/> : (presets.length == 0 ? <p className={styles.noPresets}>No hay preconfiguraciones disponibles, usa la configuracion personalizada.</p> : presets.map(preconfiguracion => <PreconfiguracionIA key={preconfiguracion.id} activeSetting={activeSetting} handleSetting={handleSetting} data={preconfiguracion} isDataOnForm={true}/>))}
                    </div>
                </div>
                <RightSidebarForms twoOnOne={false} formOptions={RecipesPerDayFormOptions} setData={setRecipesPerDayData} data={recipesPerDayData}/>
                <MainButton disabled={loading} type="submit" icon="restaurant" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={"Seleccionar Recetas"}/>
            </div>)}
        </div>
    )
}