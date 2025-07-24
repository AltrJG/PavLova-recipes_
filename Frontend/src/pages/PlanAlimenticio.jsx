import { useEffect, useMemo, useRef, useState } from 'react';
import BurbujaCanvas from '../Components/BurbujaCanvas';
import Help from '../Components/Help';
import ShowImage from '../components/ShowImage';
import styles from './PlanAlimenticio.module.css';
import Recipe from '../Components/Recipe';
import PlusIcon from '../assets/Iconos/add-circle-outline.svg';
import CalendarIcon from '../assets/Iconos/calendar-outline.svg';
import { ReactSVG } from 'react-svg';
import NutritionalTable from '../Components/NutritionalTable';
import PieChartComponent from '../Components/PieChart';
import RadialChartComponent from '../Components/RadialChart';
import MainButton from "../Components/MainButton";
import { useRightSidebar } from '../context/RightSidebarProvider';
import { useUpdateData } from '../context/UpdateDataProvider';
import RecipePlanPicker from '../Components/RecipePlanPicker';
import CircleButton from '../Components/CircleButton';
import flameIcon from '../assets/Iconos/flame.svg';
import timeIcon from '../assets/Iconos/timer.svg';
import { useBackground } from '../context/BackgroundProvider';
import { generarPlanDiaPDF, generarPlanResumenPDF } from '../Components/utils/PDFDataGenerator';
import { calcularNutrienteAporteCalorias, calcularNutrientes, calculateNutritionalValuesObjectives, combineIngredients } from '../Components/utils/calculadorNutrientes';
import DateRangeSlider from '../Components/DateRangeSlider';
import backendAPI from '../api/axiosConfig';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthProvider';
import { FadeLoader } from 'react-spinners';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import FileGenerating from '../Components/FileGenerating';
import { formatDate } from '../Components/utils/helpers';
import generarPlanAlimenticio from '../Components/utils/generarPlan';

export default function PlanAlimenticio(){

    const timerRef = useRef(null);

    const start = useMemo(() => new Date(), []);
    const end = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 6);
        return d;
    }, []);

    const { openNutritionalObjectivesForm, openAiForm } = useRightSidebar();
    const { addOllaHirviendo } = useBackground();
    const { updatedObjectives, resetNewObjectives, aiDataPlan, resetAiDataPlan } = useUpdateData();
    const { refreshAccessToken } = useAuth();
    const [ loadingPlan, setLoadingPlan ] = useState(true);
    const [ updateRecipesData, setUpdateRecipesData ] = useState(false);
    const [ loadingDay, setLoadingDay ] = useState(false);
    const [ updateProportionsData, setUpdateProportionsData ] = useState(false);
    const [ planID, setPlanID ] = useState(-1); 
    const [ creacionLoading, setCreacionLoading ] = useState(false);
    const [ datePickerForm, setDatePickerForm ] = useState(true);
    const [ selectedDates, setSelectedDates ] = useState([]);
    const [ activePicker, setActivePicker ] = useState(false);
    const [ personas, setPersonas ] = useState(1);
    const [ days, setDays ] = useState([]);
    const [ activeDay, setActiveDay ] = useState(1);
    const [ ingredientesView, setIngredientesView ] = useState([]);
    const [ activeRecipes, setActiveRecipes ] = useState([]);
    const [ planGenerando, setPlanGenerando ] = useState(false);
    const [ recipeProportions, setRecipeProportions ] = useState({});
    const [ nutritionalAlerts, setNutritionalAlerts ] = useState([]);
    const [ aiPicker, setAiPicker ] = useState(false);
    const [ datesForm, setDatesForm ] = useState({});
    const [ aiPlanLoading, setAiPlanLoading ] = useState(false);
    const [ nutritionalObjectives, setNutritionalObjectives ] = useState({
        calorias: 2000,               // kcal
        proteina: 50,                 // g
        carbohidratos: 275,          // g
        grasas_saturadas: 20,        // g
        grasas_insaturadas: 44,      // g
        grasas_trans: 2,             // g
        sodio: 2300,                 // mg
    });
    const [ currentNutritionalValues, setCurrentNutritionalValues ] = useState({
        calorias: 800,               // kcal
        proteina: 35,                 // g
        carbohidratos: 100,          // g
        grasas_saturadas: 5,        // g
        grasas_insaturadas: 12,      // g
        grasas_trans: 1,             // g
        sodio: 1000,                  // mg
        tiempo_coccion: 0,
        tiempo_preparacion: 0
    });

    const aportePorcentajes = calcularNutrienteAporteCalorias(currentNutritionalValues);

    const nutrientesPorCalorias = [
        { name: 'Grasas Saturadas', value: ((!isNaN(aportePorcentajes.grasas_saturadas)) ? Number(aportePorcentajes.grasas_saturadas) : 0) },
        { name: 'Grasas Insaturadas', value: ((!isNaN(aportePorcentajes.grasas_insaturadas)) ? Number(aportePorcentajes.grasas_insaturadas) : 0) },
        { name: 'Grasas Trans', value: ((!isNaN(aportePorcentajes.grasas_trans)) ? Number(aportePorcentajes.grasas_trans) : 0) },
        { name: 'Proteina', value: ((!isNaN(aportePorcentajes.proteina)) ? Number(aportePorcentajes.proteina) : 0) },
        { name: 'Carbohidratos', value: ((!isNaN(aportePorcentajes.carbohidratos)) ? Number(aportePorcentajes.carbohidratos) : 0) },
    ];

    const nutritionalData = {
        Calorias: `${currentNutritionalValues.calorias.toFixed(2)} Kcal`,
        Carbohidratos: `${currentNutritionalValues.carbohidratos.toFixed(2)}g`,
        Proteinas: `${currentNutritionalValues.proteina.toFixed(2)}g`,
        'Grasas Saturadas': `${currentNutritionalValues.grasas_saturadas.toFixed(2)}g`,
        'Grasas Insaturadas': `${currentNutritionalValues.grasas_insaturadas.toFixed(2)}g`,
        'Grasas Trans': `${currentNutritionalValues.grasas_trans.toFixed(2)}g`,
        Sodio: `${currentNutritionalValues.sodio.toFixed(2)}mg`
    };

    const fixRecipesBackendFormat = recipes => {
        let proportions = recipes.reduce((acc, selectedRecipe) => {
            if (selectedRecipe.receta['id'] !== undefined && selectedRecipe.receta['porciones'] !== undefined) {
                acc[selectedRecipe.receta['id']] = { value: selectedRecipe.porcion ?? 1, wasUpdated: false };
            }
            return acc;
        }, {});
        let recipesFixed = recipes.map(recipe => {
            return {
                id: recipe.receta.id,
                nombre: recipe.receta.nombre,
                frase: recipe.receta.frase,
                procedimiento: recipe.receta.procedimiento,
                porciones: recipe.receta.porciones,
                foto_receta: recipe.receta.foto_receta,
                tiempo_preparacion: recipe.receta.tiempo_preparacion,
                tiempo_coccion: recipe.receta.tiempo_coccion,
                visibilidad: recipe.receta.visibilidad,
                categoria_info: {
                    nombre: recipe.receta.categoria
                },
                ingredientes: recipe.receta.ingredientes,
                creador_info: {
                    name: recipe.receta.creador_nombre
                },
                rating_promedio: recipe.receta.rating_promedio
            }
        });
        return {proportions, recipesFixed};
    }

    const handleOpenAiForm = () => {
        openAiForm(new Date(datesForm.startDate + 'T00:00:00'), new Date(datesForm.endDate + 'T00:00:00'));
    };

    const saveProportionChange = async () => {
        try {
            for (const key of Object.keys(recipeProportions)) {
                if (recipeProportions[key].wasUpdated) {
                    await backendAPI.patch(`/plan_alimenticio_dia_receta/${planID}/actualizar-porcion/`, {
                        dia_id: activeDay,
                        receta_id: key,
                        nueva_porcion: recipeProportions[key].value
                    });
                }
            }
            let falseProportions = Object.fromEntries(
            Object.entries(recipeProportions).map(([key, value]) => [
                key,
                { ...value, wasUpdated: false }
            ]));
            setRecipeProportions(falseProportions);
        } catch (error) {
            if(error.response?.status == 401){
                await refreshAccessToken(saveProportionChange);
            }
            console.error("Failed to update proportions:", error);
            // Optional: show an error message to the user
        }
    }

    const handlePortionChange = (value, id, calculate = false) => {
        // Clear any existing timer
        clearTimeout(timerRef.current);
        // Almacenar la nueva informacion
        !calculate && setRecipeProportions({...recipeProportions, [id]: {value: Number(value), wasUpdated: true}});
        calculate && value > 0 && recipeProportions[id].value < 20 && setRecipeProportions({...recipeProportions, [id]: ( {value: recipeProportions[id].value += value, wasUpdated: true})});
        calculate && value < 0 && recipeProportions[id].value > .5 && setRecipeProportions({...recipeProportions, [id]: ( {value: recipeProportions[id].value += value, wasUpdated: true})});
        // Set a new timer
        timerRef.current = setTimeout(() => {
            setUpdateProportionsData(true);
        }, 1500);
    };

    const removeFromPlan = async (recipe_id) => {
        let currentRecipes = activeRecipes.filter(item => item.id !== recipe_id);
        setActiveRecipes(currentRecipes);
        let proportions = currentRecipes.reduce((acc, selectedRecipe) => {
            if (selectedRecipe['id'] !== undefined && selectedRecipe['porciones'] !== undefined) {
                acc[selectedRecipe['id']] = recipeProportions[selectedRecipe['id']] ?? 1;
            }
            return acc;
        }, {});
        setRecipeProportions(proportions);
        setUpdateRecipesData(true);
    }

    const verifyPlan = async () => {
        setLoadingPlan(true);
        try{
            const response = await backendAPI.get('/plan_alimenticio/plan-actual/');
            setDatesForm({ startDate: response.data.plan.fecha_inicio, endDate: response.data.plan.fecha_finalizacion });
            setDatePickerForm(false);
            setDays(response.data.plan.ids_fechas.map(dia => { return {value: dia.id, dia: dia.fecha}}));
            setActiveDay(response.data.primer_dia.id);
            setPlanID(response.data.plan.id);
            let datosNuevos = fixRecipesBackendFormat(response.data.primer_dia.recetas);
            setActiveRecipes(datosNuevos.recipesFixed);
            setRecipeProportions(datosNuevos.proportions);
            setNutritionalObjectives(response.data.plan.objetivos_nutricionales);
        } catch(error){
            if(error.response?.status == 401){
                await refreshAccessToken(verifyPlan);
            }
            if(error.response?.status == 410){
                Swal.fire({
                    icon: "info",
                    title: "Plan Eliminado",
                    text: 'Tu Plan alimenticio fue eliminado, ya que este estaba caducado',
                    showConfirmButton: true,
                    customClass: {
                        title: "swal_title",
                        icon: "swal_icon",
                        htmlContainer: "swal_text",
                        confirmButton: "swal_confirm"
                    }
                });
            }
        } finally{
            setLoadingPlan(false);
        }
    }

    const checkDay = async (day_id) => {
        clearTimeout(timerRef.current);
        setUpdateProportionsData(true);
        setLoadingDay(true);
        try{
            const response = await backendAPI.get(`/plan_alimenticio_dia/${day_id}/`);
            setActiveDay(day_id);
            setDatePickerForm(false);
            setActiveDay(response.data.id);
            let datosNuevos = fixRecipesBackendFormat(response.data.recetas);
            setActiveRecipes(datosNuevos.recipesFixed);
            setRecipeProportions(datosNuevos.proportions);
        } catch(error){
            if(error.response?.status == 401){
                await refreshAccessToken(checkDay);
            }
        } finally{
            setLoadingDay(false);
        }
    }

    const generatePlanZIP = async () => {
        setPlanGenerando(true);
        let PDFs = [], pdfIndividual, datosNuevos, nutrientesPorCaloriasPDF, aportePorcentajesPDF, alerts, ingredientesViewPDF, dias = 0, alertasTotal;
        let resultadoTotal = {
            calorias: 0,
            proteina: 0,
            carbohidratos: 0,
            grasas_saturadas: 0,
            grasas_insaturadas: 0,
            grasas_trans: 0,
            sodio: 0,
            tiempo_coccion: 0,
            tiempo_preparacion: 0
        };
        for(const day of days){
            try{
                const response = await backendAPI.get(`/plan_alimenticio_dia/${day.value}/`);
                datosNuevos = fixRecipesBackendFormat(response.data.recetas);
                // Si no hay recetas, pasar al siguiente dia del plan
                if(datosNuevos.recipesFixed.length == 0) continue;
                let nutrientesReceta;
                let nutrientesResultadosSeparados = [];
                let resultado = {
                    calorias: 0,
                    proteina: 0,
                    carbohidratos: 0,
                    grasas_saturadas: 0,
                    grasas_insaturadas: 0,
                    grasas_trans: 0,
                    sodio: 0,
                    tiempo_coccion: 0,
                    tiempo_preparacion: 0
                };
                datosNuevos.recipesFixed.forEach(activeRecipe => {
                    nutrientesReceta = calcularNutrientes(activeRecipe.ingredientes, activeRecipe.porciones, datosNuevos.proportions[activeRecipe['id']]?.value);
                    nutrientesReceta.tiempo_coccion = activeRecipe.tiempo_coccion;
                    nutrientesReceta.tiempo_preparacion = activeRecipe.tiempo_preparacion;
                    nutrientesResultadosSeparados.push(nutrientesReceta);
                });
                resultado = Object.keys(resultado).reduce((acc, key) => {
                    acc[key] = nutrientesResultadosSeparados.reduce((sum, resultadoIndv) => {
                        resultadoTotal[key] += resultadoIndv[key];
                        return sum + (resultadoIndv[key] ?? 0);
                    }, resultado[key] ?? 0);
                    return acc;
                }, {});
                aportePorcentajesPDF = calcularNutrienteAporteCalorias(resultado);
                nutrientesPorCaloriasPDF = [
                    { name: 'Grasas Saturadas', value: Number(aportePorcentajesPDF.grasas_saturadas)},
                    { name: 'Grasas Insaturadas', value: Number(aportePorcentajesPDF.grasas_insaturadas)},
                    { name: 'Grasas Trans', value: Number(aportePorcentajesPDF.grasas_trans)},
                    { name: 'Proteina', value: Number(aportePorcentajesPDF.proteina)},
                    { name: 'Carbohidratos', value: Number(aportePorcentajesPDF.carbohidratos)},
                ];
                dias++;
                alerts = calculateNutritionalValuesObjectives(resultado, nutritionalObjectives, personas);
                ingredientesViewPDF = combineIngredients(datosNuevos.recipesFixed, datosNuevos.proportions);
                pdfIndividual = await generarPlanDiaPDF(datosNuevos.recipesFixed, datosNuevos.proportions, nutritionalObjectives, nutrientesPorCaloriasPDF, resultado, day, ingredientesViewPDF, personas, alerts, true);
                PDFs.push({pdfFile: pdfIndividual, dia: day.dia});
            } catch(error){
                if(error.response?.status == 401){
                    await refreshAccessToken(generatePlanZIP);
                }
            }
        }
        alertasTotal = calculateNutritionalValuesObjectives(resultadoTotal, nutritionalObjectives, personas*dias);
        let resumenPDF = await generarPlanResumenPDF(nutritionalObjectives, resultadoTotal, personas*dias, alertasTotal, days[0].dia, days[days.length-1].dia, true);
        const zip = new JSZip();
        zip.file('resumen_plan-alimenticio.pdf', resumenPDF);
        for(let i = 0; i < PDFs.length; i++){
            zip.file(`plan-alimenticio_${PDFs[i].dia}.pdf`, PDFs[i].pdfFile);
        }
        const zipBlob = await zip.generateAsync({type: "blob"});
        saveAs(zipBlob, `plan_alimenticio_${days[0].dia}_a_${days[days.length-1].dia}.zip`);
        setPlanGenerando(false);
    }

    const updateRecipes = async  () => {
        try{
            await backendAPI.put(`/plan_alimenticio_dia_receta/${planID}/actualizar-recetas/`, {
                dia_id: activeDay,
                recetas: activeRecipes.map(receta => receta.id)
            });
        } catch(error){
            if(error.response?.status == 401){
                await refreshAccessToken(updateRecipes);
            }
        }
    }

    useEffect(() => {
        let nutrientesReceta;
        let nutrientesResultadosSeparados = [];
        let resultado = {
            calorias: 0,
            proteina: 0,
            carbohidratos: 0,
            grasas_saturadas: 0,
            grasas_insaturadas: 0,
            grasas_trans: 0,
            sodio: 0,
            tiempo_coccion: 0,
            tiempo_preparacion: 0
        };
        activeRecipes.forEach(activeRecipe => {
            nutrientesReceta = calcularNutrientes(activeRecipe.ingredientes, activeRecipe.porciones, recipeProportions[activeRecipe['id']]?.value);
            nutrientesReceta.tiempo_coccion = activeRecipe.tiempo_coccion;
            nutrientesReceta.tiempo_preparacion = activeRecipe.tiempo_preparacion;
            nutrientesResultadosSeparados.push(nutrientesReceta);
        });
        resultado = Object.keys(resultado).reduce((acc, key) => {
            acc[key] = nutrientesResultadosSeparados.reduce((sum, resultadoIndv) => {
                return sum + (resultadoIndv[key] ?? 0);
            }, resultado[key] ?? 0);
            return acc;
        }, {});
        setCurrentNutritionalValues(resultado);
        setNutritionalAlerts(calculateNutritionalValuesObjectives(resultado, nutritionalObjectives, personas));
        setIngredientesView(combineIngredients(activeRecipes, recipeProportions));
    }, [activeRecipes, recipeProportions]);

    const generarPlanDia = async () =>{
        setPlanGenerando(true);
        const match = days.find(dia => dia.value === activeDay);
        await generarPlanDiaPDF(activeRecipes, recipeProportions, nutritionalObjectives, nutrientesPorCalorias, currentNutritionalValues, match, ingredientesView, personas, nutritionalAlerts);
        setPlanGenerando(false);
    }

    const handleDates = ([start, end]) => {
        setSelectedDates([formatDate(start), formatDate(end)]);
    };

    const handleCreatePlan = async () => {
        setCreacionLoading(true);
        try{
            await backendAPI.post('/plan_alimenticio/', {
                fecha_inicio: selectedDates[0],
                fecha_finalizacion: selectedDates[1]
            });
            Swal.fire({
                icon: "success",
                title: "Plan Alimenticio creado",
                text: 'Se ha creado el plan alimenticio con exito',
                showConfirmButton: true,
                customClass: {
                    title: "swal_title",
                    icon: "swal_icon",
                    htmlContainer: "swal_text",
                    confirmButton: "swal_confirm"
                }
            });
            await verifyPlan();
        } catch(error){
            if(error.response?.status == 401){
                await refreshAccessToken(handleCreatePlan);
            }
        } finally{
            setCreacionLoading(false);
        }
    }

    const crearPlanAutomatico = async recetas => {
        setAiPlanLoading(true);
        setAiPicker(false);
        setActivePicker(false);
        try{
            await generarPlanAlimenticio(recetas, aiDataPlan, nutritionalObjectives, personas, days, planID);
            await checkDay(activeDay);
            Swal.fire({
                icon: "success",
                title: "Plan alimenticio creado!",
                text: 'Se ha creado el plan alimenticio de los dias seleccionados!',
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
                await refreshAccessToken(crearPlanAutomatico, recetas);
            } 
        } finally{
            setAiPlanLoading(false);
        }
    }

    const deletePlanAsk = () => {
        Swal.fire({
            title: `Borrar plan alimenticio?`,
            icon: "question",
            text: `Estas a punto de eliminar tu plan alimenticio, estas seguro de continuar?`,
            customClass: {
                title: "swal_title",
                icon: "swal_icon",
                htmlContainer: "swal_text",
                confirmButton: "swal_confirm"
            },
            showCancelButton: true,
            cancelButtonText: "Cancelar",
            confirmButtonText: "Eliminar",
            allowOutsideClick: () => !Swal.isLoading()
            }).then((result) => {
            if (result.isConfirmed) {
                deletePlan();
            }
        });
    }

    const deletePlan = async () => {
        try{
            await backendAPI.delete(`/plan_alimenticio/${planID}/`);
            setDatePickerForm(true);
            Swal.fire({
                icon: "success",
                title: "Plan eliminado!",
                text: 'Se elimino tu plan alimenticio.',
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
                await refreshAccessToken(deletePlan);
            }
        }
    }

    useEffect(() => {
        if(updateRecipesData){
            updateRecipes(activeRecipes);
            setUpdateRecipesData(false);
        }
    }, [updateRecipesData]);

    useEffect(() => {
        if(updateProportionsData){
            saveProportionChange();
            setUpdateProportionsData(false);
        }
    }, [updateProportionsData]);

    useEffect(() => {
        addOllaHirviendo();
        verifyPlan();
    }, []);

    useEffect(() => {
        if(Object.keys(updatedObjectives).length != 0){
            setNutritionalObjectives({
                calorias: updatedObjectives.calorias,               
                proteina: updatedObjectives.proteina,                 
                carbohidratos: updatedObjectives.carbohidratos,          
                grasas_saturadas: updatedObjectives.grasas_saturadas,        
                grasas_insaturadas: updatedObjectives.grasas_insaturadas,      
                grasas_trans: updatedObjectives.grasas_trans,             
                sodio: updatedObjectives.sodio                  
            });
            setPersonas(updatedObjectives.personas);
            setNutritionalAlerts(calculateNutritionalValuesObjectives(currentNutritionalValues, updatedObjectives, personas));
            resetNewObjectives();
        }
    }, [updatedObjectives]);

    useEffect(() => {
        if(Object.keys(aiDataPlan).length != 0){
            setAiPicker(true);
            setActivePicker(true);
        } else{
            setAiPicker(false);
        }
    }, [aiDataPlan]);

    if(loadingPlan) return <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>

    return(
        <section className={styles.planAlimenticioContainer}>
            <FileGenerating text={aiPlanLoading ? "Generando plan alimenticio" : 'Generando archivo del plan alimenticio'} canShow={planGenerando || aiPlanLoading} svg_start={aiPlanLoading ? "hardware-chip" : 'calendar'} svg_end={aiPlanLoading ? "calendar" : 'document-attach'}/>
            {datePickerForm 
            ? <div className={styles.datePicker}>
                <div className={styles.datePickerContainer}>
                    <h2>Selecciona los dias del plan</h2>
                    <DateRangeSlider
                        startDate={start}
                        endDate={end}
                        onChange={handleDates}
                    />
                    <div className={styles.buttonDatePicker}>
                        <MainButton action={handleCreatePlan} disabled={creacionLoading} type="button" icon="calendar" iconSize="3" fontSize="2.5" color="primary" borderRadius="1.5" text={creacionLoading ? "Creando..." : "Crear Plan Alimenticio"}/>
                    </div>
                </div>
            </div>
            : <><RecipePlanPicker aiAction={crearPlanAutomatico} updateRecipes={updateRecipes} currentProportions={recipeProportions} setProportions={setRecipeProportions} activeRecipes={activeRecipes} setActiveRecipes={setActiveRecipes} activePicker={activePicker} setActivePicker={setActivePicker} aiPicker={aiPicker} resetAiDataPlan={resetAiDataPlan} setAiPicker={setAiPicker}/>
            <Help title={'Plan alimenticio'} description={'Crea tu plan alimenticio'}>
                <MainButton action={handleOpenAiForm} disabled={false} type="button" icon="hardware-chip" iconSize="3" fontSize="2.5" color="primary" borderRadius="1.5" text={"Generar Automaticamente"}/>
            </Help>
            <div className={styles.planAlimenticioSeparation}>
                <div className={styles.planMainContent}>
                    <div className={styles.pdfDaysContainer}>
                        <div className={styles.daysContainer}>
                            { days.map(day => <div onClick={async () => await checkDay(day.value)} key={day.value} className={`${styles.dias} ${activeDay == day.value ? styles.activeDay : ""}`}><div key={day.value} className={styles.diaNumero}>{String(new Date(day.dia + 'T00:00:00').getDate()).padStart(2, '0')}</div><p className={styles.diaTexto}>{new Date(day.dia + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'short' })}.</p></div>) }                        
                        </div>
                        { activeRecipes.length > 0 && !loadingDay && <CircleButton action={generarPlanDia} args={[]} text="Descargar PDF de este dia" iconName={"document-attach"} iconSize="3rem"/>}
                        { !loadingDay && <CircleButton action={generatePlanZIP} args={[]} text="Descargar PDF del Plan" iconName={"folder-with-document"} iconSize="3rem"/>}
                        <CircleButton action={deletePlanAsk} args={[]} text="Borrar Plan Alimenticio" iconName={"close"} iconSize="3rem"/>                    
                    </div>
                    {!loadingDay 
                    ? <><div className={styles.selectedRecipes}>
                        <div className="recipesContent">
                            { activeRecipes.length != 0 && activeRecipes.map(recipe => <Recipe removeFromPlan={removeFromPlan} proportion={recipeProportions[recipe.id]} handlePortionChange={handlePortionChange} portionPicker={true} key={recipe.id} isModificationAllowed={false} cristal={true} recipe={recipe}/>) }
                            <button onClick={() => setActivePicker(true)} className={styles.addRecipes}><span className={styles.recipeAddIcon}><ReactSVG src={PlusIcon}/></span>Agregar Recetas...</button>
                        </div>
                    </div>
                    <div className={styles.objectiveCharts}>
                        <p className={`${activeRecipes.length > 0 ? styles.hiddenTip : ""} ${styles.addRecipesTip}`}>Comienza agregando una receta, ya sea propia o favorita</p>
                        {Object.keys(nutritionalObjectives).map((key) => (
                        <div
                            key={key}
                            className={`${activeRecipes.length > 0 ? "" : styles.hiddenChart} ${styles.objectiveChartSingle}`}
                        >
                            <h4>{key.toUpperCase().replace('_', ' ')}</h4>
                            <p className={nutritionalAlerts[key]?.estado == 'Alerta' ? styles.alerta : (nutritionalAlerts[key]?.estado == 'Aceptable' ? styles.aceptable : styles.peligro)}><ReactSVG src={`/src/assets/Iconos/${nutritionalAlerts[key]?.estado == 'Alerta' ? 'alert-circle' : (nutritionalAlerts[key]?.estado == 'Aceptable' ? 'checkmark-circle' : 'close-circle') }.svg`}/><span className={styles.visualAlert}>{nutritionalAlerts[key]?.mensaje}</span>{nutritionalAlerts[key]?.estado}</p>
                            <RadialChartComponent
                            data={[
                                {
                                name: `Objetivo: ${(nutritionalObjectives[key] ?? 0) * personas}`,
                                uv: (nutritionalObjectives[key] ?? 0) * personas,
                                fill: '#FF9900',
                                },
                                {
                                name: `Meta: ${
                                    currentNutritionalValues[key] != null
                                    ? currentNutritionalValues[key].toFixed(2)
                                    : 0
                                }`,
                                uv: currentNutritionalValues[key] ?? 0,
                                fill: '#FF5E00',
                                },
                            ]}
                            />
                        </div>
                        ))}                        
                        <button onClick={() => openNutritionalObjectivesForm(nutritionalObjectives, planID)} className={`${activeRecipes.length > 0 ? "" : styles.hiddenChart} ${styles.addRecipes}`}><span className={styles.recipeAddIcon}><ReactSVG src={CalendarIcon}/></span>Cambiar Objetivos...</button>
                    </div></> 
                    : <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>}
                </div>
                <div className={`${activeRecipes.length > 0 ? "" : styles.hiddenImportantData} ${styles.planImportantData} ${loadingDay && styles.loadingDay}`}>
                    <div className={styles.recipeNutritionTable}>
                        <h5 className={styles.headerInfoNutricional}>Informacion Nutricional</h5>
                        <NutritionalTable nutritionalData={nutritionalData}/>
                    </div>
                    <div className={styles.planTimesContainer}>
                        <h5 className={styles.planTimesDescription}>Tiempos:</h5>
                        <div className={styles.planTimes}>
                            <div className={styles.timePreparation}><ReactSVG src={timeIcon}/> {`${currentNutritionalValues.tiempo_preparacion} Minutos`}</div>
                            <div className={styles.timePreparation}><ReactSVG src={flameIcon}/> {`${currentNutritionalValues.tiempo_coccion} Minutos`}</div>
                        </div>
                    </div>
                    <div className={styles.recipeNutrientsPerCalories}>
                        <h4 className={styles.recipeNutrientsPerCaloriesHeader}>Nutrientes Por Calorias:</h4>
                        <PieChartComponent data={nutrientesPorCalorias}/>
                    </div>
                    <div className={styles.recipeContentsUsefulData}>
                        <h4 className={styles.recipeContentsText}>Ingredientes:</h4>
                        <div className={styles.ingredientsContainer}>
                            { ingredientesView.map(ingredient => <ShowImage key={ingredient.text} text={ingredient.text} position={'Top'} width={'17'} height={'12'} hasImage={ingredient.image != null} image={ingredient.image}/>)}
                        </div>
                    </div>
                </div>
            </div></>}
            <div className="mobileSpace"></div>
        </section>
    )
}