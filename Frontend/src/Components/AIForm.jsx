import RightSidebarErrors from "./RightSidebarErrors";
import styles from "./AIForm.module.css";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import OptionButton from "./OptionButton";
import RightSidebarForms from "./RightSidebarForms";
import MainButton from "./MainButton";
import Swal from "sweetalert2";
import backendAPI from "../api/axiosConfig";
import { useRightSidebar } from "../context/RightSidebarProvider";
import { useUpdateData } from "../context/UpdateDataProvider";
import PreconfiguracionIA from "./PreconfiguracionIA";
import { FadeLoader } from "react-spinners";
import { formatDate } from "./utils/helpers";
import DateRangeSlider from "./DateRangeSlider";


export default function AIForm(){
    const [ activeOption, setActiveOption ] = useState("preconfiguracion");
    const [ loading, setLoading ] = useState(false);
    const [ errorsHandler, setErrorsHandler ] = useState({});
    const [ activeSetting, setActiveSetting ] = useState(-1);
    const [ presets, setPresets ] = useState([]);
    const [ loadingPresets, setLoadingPresets ] = useState(false);
    const [ selectedDates, setSelectedDates ] = useState('');
    const { refreshAccessToken, isSuperUser, isStaff } = useAuth();
    const { aiFormDates, closeRightSidebar } = useRightSidebar();
    const { setAiDataPlan } = useUpdateData();

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
        { type: "slider", step: "1", name: "cantRecetas", label: "Cantidad de recetas por dia:", defaultValue: 2, max: 8, min: 2, showInput: false, additionalText: ''},
        { type: "slider", step: ".5", name: "porcionesRecetas", label: "Porciones por receta:", defaultValue: 1, max: 20, min: .5, showInput: false, additionalText: ''},
        { type: "select", name: "ajusteObjetivos", label: "Ajustar automaticamente a los objetivos nutricionales?:", defaultOption: "Si", options: ["Si", "No"]},
        { type: "select", name: "modoRepeticion", label: "¿Qué tanta variedad deseas en las recetas?", defaultOption: "Flexible",options: ["Repetidas", "Flexible", "Rotar", "Variado", "Diverso"]}
    ];

    const RecipesPerDayFormOptions = [
        { type: "slider", step: "1", name: "cantRecetas", label: "Cantidad de recetas por dia:", defaultValue: 2, max: 8, min: 2, showInput: false, additionalText: ''},
        { type: "slider", step: ".5", name: "porcionesRecetas", label: "Porciones por receta:", defaultValue: 1, max: 20, min: .5, showInput: false, additionalText: ''},
        { type: "select", name: "ajusteObjetivos", label: "Ajustar automaticamente a los objetivos nutricionales?:", defaultOption: "Si", options: ["Si", "No"]},
        { type: "select", name: "modoRepeticion", label: "¿Qué tanta variedad deseas en las recetas?", defaultOption: "Flexible",options: ["Repetidas", "Flexible", "Rotar", "Variado", "Diverso"]}
    ]

    const options = [
        { type: 'preconfiguracion', icon: 'hardware-chip', label: 'Preconfigurado' },
        { type: 'avanzado', icon: 'person', label: 'Personalizado' },
    ];

    const [ manualData, setManualData ] = useState({
        proteinas: 100,
        carbohidratos: 100,
        grasas_saturadas: 100,
        grasas_insaturadas: 100,
        grasas_trans: 100,
        sodio: 15,
        cantRecetas: 2,
        porcionesRecetas: 1,
        ajusteObjetivos: "Si",
        modoRepeticion: 'Repetidas'
    });
    const [ recipesPerDayData, setRecipesPerDayData ] = useState({
        cantRecetas: 2,
        porcionesRecetas: 1,
        ajusteObjetivos: "Si",
        modoRepeticion: 'Repetidas'
    });

    const handleChangeInformation = () => {
        let preferenciasUsuarios = {
            proteinas: -1,
            carbohidratos: -1,
            grasas_saturadas: -1,
            grasas_insaturadas: -1,
            grasas_trans: -1,
            sodio: -1,
            cantRecetas: -1,
            porcionesRecetas: -1,
            ajusteObjetivos: "Si",
            fechasSeleccionadas: [],
            modoRepeticion: "Repetidas"
        };
        if(activeOption == 'preconfiguracion'){
            preferenciasUsuarios.cantRecetas = recipesPerDayData.cantRecetas;
            preferenciasUsuarios.porcionesRecetas = recipesPerDayData.porcionesRecetas;
            preferenciasUsuarios.ajusteObjetivos = recipesPerDayData.ajusteObjetivos;
            preferenciasUsuarios.fechasSeleccionadas = selectedDates;
            preferenciasUsuarios.modoRepeticion = recipesPerDayData.modoRepeticion;
            let presetEscogido = presets.find(preset => preset.id == activeSetting);
            preferenciasUsuarios.proteinas = presetEscogido.objetivo_proteina;
            preferenciasUsuarios.carbohidratos = presetEscogido.objetivo_carbohidrato;
            preferenciasUsuarios.sodio = presetEscogido.objetivo_sodio;
            preferenciasUsuarios.grasas_trans = presetEscogido.objetivo_grasa_trans;
            preferenciasUsuarios.grasas_saturadas = presetEscogido.objetivo_grasa_saturada;
            preferenciasUsuarios.grasas_insaturadas = presetEscogido.objetivo_grasa_insaturada;
        } else{
            preferenciasUsuarios.cantRecetas = manualData.cantRecetas;
            preferenciasUsuarios.porcionesRecetas = manualData.porcionesRecetas;
            preferenciasUsuarios.ajusteObjetivos = manualData.ajusteObjetivos;
            preferenciasUsuarios.modoRepeticion = manualData.modoRepeticion;
            preferenciasUsuarios.fechasSeleccionadas = selectedDates;
            preferenciasUsuarios.proteinas = manualData.proteinas;
            preferenciasUsuarios.carbohidratos = manualData.carbohidratos;
            preferenciasUsuarios.sodio = manualData.sodio;
            preferenciasUsuarios.grasas_trans = manualData.grasas_trans;
            preferenciasUsuarios.grasas_saturadas = manualData.grasas_saturadas;
            preferenciasUsuarios.grasas_insaturadas = manualData.grasas_insaturadas;
        }
        setAiDataPlan(preferenciasUsuarios);
        closeRightSidebar();
    }

    const handleDates = ([start, end]) => {
        setSelectedDates([formatDate(start), formatDate(end)]);
    };

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

    const explicacionPorModo = {
        Repetidas: "No me molesta comer las mismas recetas seguido.",
        Flexible: "Prefiero algo de variedad, pero no me importa repetir ocasionalmente.",
        Rotar: "Prefiero cambiar de recetas cada día si es posible.",
        Variado: "Quiero la mayor variedad posible en mis comidas.",
        Diverso: "Busco comer recetas preferentemente distintos por cada dia."
    };

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
                <>
                <p className={styles.pickerExplanation}>Selecciona las fechas en donde crear un plan</p>
                <div className={styles.datePickerSlider}>
                    <DateRangeSlider
                        startDate={aiFormDates.start}
                        endDate={aiFormDates.end}
                        onChange={handleDates}
                        margin={0}
                    />
                </div>
                <RightSidebarForms twoOnOne={false} formOptions={ManageIngredientsFormOptions} setData={setManualData} data={manualData}>
                    <p className={`${styles.pickerManual} ${styles.pickerExplanation}`}>{explicacionPorModo[manualData.modoRepeticion]}</p>
                    <MainButton action={handleChangeInformation} disabled={loading} type="button" icon="restaurant" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={"Seleccionar Recetas"}/>
                </RightSidebarForms> 
                </>
            )}

            {activeOption === "preconfiguracion" && (
                <div className={styles.preconfigContainer}>
                    <div className={styles.preconfiguracionesMainContainer}>
                        <div className={styles.preconfiguracionesContainer}>
                            {loadingPresets ? <FadeLoader color='rgba(252,115,2,1)'/> : (presets.length == 0 ? <p className={styles.noPresets}>No hay preconfiguraciones disponibles, usa la configuracion personalizada.</p> : presets.map(preconfiguracion => <PreconfiguracionIA key={preconfiguracion.id} activeSetting={activeSetting} handleSetting={handleSetting} data={preconfiguracion} isDataOnForm={true}/>))}
                        </div>
                    </div>
                    <p className={styles.pickerExplanation}>Selecciona las fechas en donde crear un plan</p>
                    <div className={styles.datePickerSlider}>
                        <DateRangeSlider
                            startDate={aiFormDates.start}
                            endDate={aiFormDates.end}
                            onChange={handleDates}
                            margin={0}
                        />
                    </div>
                    <RightSidebarForms twoOnOne={false} formOptions={RecipesPerDayFormOptions} setData={setRecipesPerDayData} data={recipesPerDayData}/>
                    <p className={`${styles.pickerExplanation}`}>{explicacionPorModo[recipesPerDayData.modoRepeticion]}</p>
                    <MainButton action={handleChangeInformation} disabled={activeSetting == -1} type="submit" icon="restaurant" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={"Seleccionar Recetas"}/>
            </div>)}
        </div>
    )
}