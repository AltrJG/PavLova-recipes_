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
import tempImg from '../assets/manzana_test.png';
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
import { generarPlanDiaPDF } from '../Components/utils/PDFDataGenerator';
import { calcularNutrienteAporteCalorias, calcularNutrientes, combineIngredients } from '../Components/utils/calculadorNutrientes';
import DateRangeSlider from '../Components/DateRangeSlider';
import backendAPI from '../api/axiosConfig';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthProvider';

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
    const { updatedObjectives, resetNewObjectives } = useUpdateData();
    const { refreshAccessToken } = useAuth();
    const [ creacionLoading, setCreacionLoading ] = useState(false);
    const [ datePickerForm, setDatePickerForm ] = useState(true);
    const [ selectedDates, setSelectedDates ] = useState([]);
    const [ activePicker, setActivePicker ] = useState(false);
    const [ personas, setPersonas ] = useState(1);
    const [ activeDay, setActiveDay ] = useState(1);
    const [ ingredientesView, setIngredientesView ] = useState([]);
    const [ activeRecipes, setActiveRecipes ] = useState([]);
    const [ recipeProportions, setRecipeProportions ] = useState({});
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

    const days = [
        { value: 1, day: 'dayOne' },
        { value: 2, day: 'dayTwo' },
        { value: 3, day: 'dayThree' },
        { value: 4, day: 'dayFour' },
        { value: 5, day: 'dayFive' },
        { value: 6, day: 'daySix' },
        { value: 7, day: 'daySeven' }
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

    const handleOpenAiForm = () => {
        openAiForm()
    };

    const saveProportionChange = () => {
        console.log('SAVING...');
    }

    const handlePortionChange = (value, id, calculate = false) => {
        // Clear any existing timer
        clearTimeout(timerRef.current);
        // Almacenar la nueva informacion
        !calculate && setRecipeProportions({...recipeProportions, [id]: Number(value)});
        calculate && value > 0 && recipeProportions[id] < 10 && setRecipeProportions({...recipeProportions, [id]: ( recipeProportions[id] += value)});
        calculate && value < 0 && recipeProportions[id] > .2 && setRecipeProportions({...recipeProportions, [id]: ( recipeProportions[id] += value)});
        // Set a new timer
        timerRef.current = setTimeout(() => {
            saveProportionChange();
        }, 2000);
    };

    const removeFromPlan = (recipe_id) => {
        let currentRecipes = activeRecipes.filter(item => item.id !== recipe_id);
        setActiveRecipes(currentRecipes);
        let proportions = currentRecipes.reduce((acc, selectedRecipe) => {
            if (selectedRecipe['id'] !== undefined && selectedRecipe['porciones'] !== undefined) {
                acc[selectedRecipe['id']] = recipeProportions[selectedRecipe['id']] ?? 1;
            }
            return acc;
        }, {});
        setRecipeProportions(proportions);
    }

    useEffect(() => {
        addOllaHirviendo();
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
            resetNewObjectives();
        }
    }, [updatedObjectives]);

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
            nutrientesReceta = calcularNutrientes(activeRecipe.ingredientes, activeRecipe.porciones, recipeProportions[activeRecipe['id']]);
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
        setIngredientesView(combineIngredients(activeRecipes, recipeProportions));
    }, [activeRecipes, recipeProportions]);

    const generarPlanDia = async () =>{
        await generarPlanDiaPDF(activeRecipes, recipeProportions, nutritionalObjectives, nutrientesPorCalorias, currentNutritionalValues, '01-01-2001', ingredientesView, personas);
    }

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleDates = ([start, end]) => {
        setSelectedDates([formatDate(start), formatDate(end)]);
    };

    const handleCreatePlan = async () => {
        setCreacionLoading(true);
        try{
            const response = await backendAPI.post('/plan_alimenticio/', {
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
            console.log(response);
        } catch(error){
            if(error.response?.status == 401){
                await refreshAccessToken(handleCreatePlan);
            }
            console.log(error);
        } finally{
            setCreacionLoading(false);
        }
    }

    return(
        <section className={styles.planAlimenticioContainer}>
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
            : <><RecipePlanPicker currentProportions={recipeProportions} setProportions={setRecipeProportions} activeRecipes={activeRecipes} setActiveRecipes={setActiveRecipes} activePicker={activePicker} setActivePicker={setActivePicker}/>
            <Help title={'Plan alimenticio'} description={'Crea tu plan alimenticio'}>
                <MainButton action={handleOpenAiForm} disabled={false} type="button" icon="hardware-chip" iconSize="3" fontSize="2.5" color="primary" borderRadius="1.5" text={"Plan AI"}/>
            </Help>
            <div className={styles.planAlimenticioSeparation}>
                <div className={styles.planMainContent}>
                    <div className={styles.pdfDaysContainer}>
                        <div className={styles.daysContainer}>
                            { days.map(day => <div onClick={() => setActiveDay(day.value)} key={day.value} className={`${styles.dias} ${activeDay == day.value ? styles.activeDay : ""}`}><div key={day.value} className={styles.diaNumero}>{day.value}</div><p className={styles.diaTexto}>Dia</p></div>) }                        
                        </div>
                        { activeRecipes.length > 0 && <CircleButton action={generarPlanDia} args={[]} text="Descargar PDF de este dia" iconName={"document-attach"} iconSize="3rem"/>}
                        <CircleButton text="Descargar PDF del Plan" iconName={"folder-with-document"} iconSize="3rem"/>
                    </div>
                    <div className={styles.selectedRecipes}>
                        <div className="recipesContent">
                            { activeRecipes.length != 0 && activeRecipes.map(recipe => <Recipe removeFromPlan={removeFromPlan} proportion={recipeProportions[recipe.id]} handlePortionChange={handlePortionChange} portionPicker={true} key={recipe.id} isModificationAllowed={false} cristal={true} recipe={recipe}/>) }
                            <button onClick={() => setActivePicker(true)} className={styles.addRecipes}><span className={styles.recipeAddIcon}><ReactSVG src={PlusIcon}/></span>Agregar Recetas...</button>
                        </div>
                    </div>
                    <div className={styles.objectiveCharts}>
                        <p className={`${activeRecipes.length > 0 ? styles.hiddenTip : ""} ${styles.addRecipesTip}`}>Comienza agregando una receta, ya sea propia o favorita</p>
                        {Object.keys(nutritionalObjectives).map(key => <div key={key} className={`${activeRecipes.length > 0 ? "" : styles.hiddenChart} ${styles.objectiveChartSingle}`}><h4>{key.toUpperCase().replace('_', ' ')}</h4><RadialChartComponent data={[{name: `Objetivo: ${nutritionalObjectives[key]*personas}`, uv: (nutritionalObjectives[key]*personas), fill: '#FF9900'},{name: `Meta: ${currentNutritionalValues[key].toFixed(2)}`, uv: (currentNutritionalValues[key]).toFixed(2), fill: '#FF5E00'}]}/></div>)}
                        <button onClick={() => openNutritionalObjectivesForm(nutritionalObjectives)} className={`${activeRecipes.length > 0 ? "" : styles.hiddenChart} ${styles.addRecipes}`}><span className={styles.recipeAddIcon}><ReactSVG src={CalendarIcon}/></span>Cambiar Objetivos...</button>
                    </div>
                </div>
                <div className={`${activeRecipes.length > 0 ? "" : styles.hiddenImportantData} ${styles.planImportantData}`}>
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
                            { ingredientesView.map(ingredient => <ShowImage key={ingredient.text} text={ingredient.text} position={ingredient.text.length > 20 ? 'Top' : 'Right'} width={'17'} height={'12'} hasImage={ingredient.image != null} image={ingredient.image}/>)}
                        </div>
                    </div>
                </div>
            </div></>}
            <div className="mobileSpace"></div>
        </section>
    )
}