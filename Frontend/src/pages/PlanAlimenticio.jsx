import { useEffect, useState } from 'react';
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
import RotatingBall from '../Components/RotatingBall';
import CircleButton from '../Components/CircleButton';
import flameIcon from '../assets/Iconos/flame.svg';
import timeIcon from '../assets/Iconos/timer.svg';
import { useBackground } from '../context/BackgroundProvider';

export default function PlanAlimenticio(){

    const { openNutritionalObjectivesForm, openAiForm } = useRightSidebar();
    const { addOllaHirviendo } = useBackground();
    const { updatedObjectives, resetNewObjectives } = useUpdateData();
    const [ activePicker, setActivePicker ] = useState(false);
    const [ personas, setPersonas ] = useState(1);
    const [ activeDay, setActiveDay ] = useState(1);
    const [ nutritionalObjectives, setNutritionalObjectives ] = useState({
        calorias: 2000,               // kcal
        proteina: 50,                 // g
        carbohidratos: 275,          // g
        grasas_saturadas: 20,        // g
        grasas_insaturadas: 44,      // g
        grasas_trans: 2,             // g
        sodio: 2300                  // mg
    });
    const [ currentNutritionalValues, setCurrentNutritionalValues ] = useState({
        calorias: 800,               // kcal
        proteina: 35,                 // g
        carbohidratos: 100,          // g
        grasas_saturadas: 5,        // g
        grasas_insaturadas: 12,      // g
        grasas_trans: 1,             // g
        sodio: 1000                  // mg
    });

    const changeTemp = () => {
        setCurrentNutritionalValues(nutritionalObjectives);
    }

    const nutrientesPorCalorias = [
        { name: 'Grasas Saturadas', value: 23.44 },
        { name: 'Grasas Insaturadas', value: 12.46 },
        { name: 'Grasas Trans', value: 1.02 },
        { name: 'Proteina', value: 4.04 },
        { name: 'Carbohidratos', value: 58.76 },
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

    const ingredientesView = [
        {
          text: "1 taza de Harina de Trigo",
          image: null
        },
        {
          text: "2 cucharadas de Azúcar Morena",
          image: tempImg
        },
        {
          text: "3 huevos grandes",
          image: tempImg
        },
        {
          text: "100 ml de Leche Entera",
          image: null
        },
        {
          text: "Una pizca de sal fina",
          image: null
        },
        {
          text: "1 cucharadita de extracto de vainilla natural",
          image: tempImg
        }
      ];

    const nutritionalData = {
        Calorias: `50 Kcal`,
        Carbohidratos: `50g`,
        Proteinas: `50g`,
        'Grasas Saturadas': `50g`,
        'Grasas Insaturadas': `50g`,
        'Grasas Trans': `50g`,
        Sodio: `50mg`
    };

    const handleOpenAiForm = () => {
        openAiForm()
    }

    useEffect(() => {
        addOllaHirviendo();
    }, [])

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

    return(
        <section className={styles.planAlimenticioContainer}>
            <RecipePlanPicker activePicker={activePicker} setActivePicker={setActivePicker}/>
            <Help title={'Plan alimenticio'} description={'Crea tu plan alimenticio'}>
                <MainButton action={handleOpenAiForm} disabled={false} type="button" icon="hardware-chip" iconSize="3" fontSize="2.5" color="primary" borderRadius="1.5" text={"Plan AI"}/>
            </Help>
            <div className={styles.planAlimenticioSeparation}>
                <div className={styles.planMainContent}>
                    <div className={styles.pdfDaysContainer}>
                        <div className={styles.daysContainer}>
                            { days.map(day => <div onClick={() => setActiveDay(day.value)} key={day.value} className={`${styles.dias} ${activeDay == day.value ? styles.activeDay : ""}`}><div key={day.value} className={styles.diaNumero}>{day.value}</div><p className={styles.diaTexto}>Dia</p></div>) }                        
                        </div>
                        <CircleButton text="Descargar PDF de este dia" iconName={"document-attach"} iconSize="3rem"/>
                        <CircleButton text="Descargar PDF del Plan" iconName={"folder-with-document"} iconSize="3rem"/>
                    </div>
                    <div className={styles.selectedRecipes}>
                        <div className="recipesContent">
                            <Recipe cristal={true}/>
                            <Recipe cristal={true}/>
                            <Recipe cristal={true}/>
                            <button onClick={() => setActivePicker(true)} className={styles.addRecipes}><span className={styles.recipeAddIcon}><ReactSVG src={PlusIcon}/></span>Agregar Recetas...</button>
                        </div>
                    </div>
                    <div className={styles.objectiveCharts}>
                        {Object.keys(nutritionalObjectives).map(key => <div key={key} className={styles.objectiveChartSingle}><h4>{key.toUpperCase().replace('_', ' ')}</h4><RadialChartComponent data={[{name: `Objetivo: ${nutritionalObjectives[key]*personas}`, uv: nutritionalObjectives[key]*personas, fill: '#FF9900'},{name: `Meta: ${currentNutritionalValues[key]}`, uv: currentNutritionalValues[key], fill: '#FF5E00'}]}/></div>)}
                        <button onClick={() => openNutritionalObjectivesForm(nutritionalObjectives)} className={styles.addRecipes}><span className={styles.recipeAddIcon}><ReactSVG src={CalendarIcon}/></span>Cambiar Objetivos...</button>
                    </div>
                </div>
                <div onClick={() => changeTemp()} className={styles.planImportantData}>
                    <div className={styles.recipeNutritionTable}>
                        <h5 className={styles.headerInfoNutricional}>Informacion Nutricional</h5>
                        <NutritionalTable nutritionalData={nutritionalData}/>
                    </div>
                    <div className={styles.recipeContentsUsefulData}>
                        <h4 className={styles.recipeContentsText}>Ingredientes:</h4>
                        <div className={styles.ingredientsContainer}>
                            { ingredientesView.map(ingredient => <ShowImage key={ingredient.text} text={ingredient.text} position={ingredient.text.length > 20 ? 'Top' : 'Right'} width={'17'} height={'12'} hasImage={ingredient.image != null} image={ingredient.image}/>)}
                        </div>
                    </div>
                    <div className={styles.planTimesContainer}>
                        <h5 className={styles.planTimesDescription}>Tiempos:</h5>
                        <div className={styles.planTimes}>
                            <div className={styles.timePreparation}><ReactSVG src={timeIcon}/> {`10 Minutos`}</div>
                            <div className={styles.timePreparation}><ReactSVG src={flameIcon}/> {`10 Minutos`}</div>
                        </div>
                    </div>
                    <div className={styles.recipeNutrientsPerCalories}>
                        <h4 className={styles.recipeNutrientsPerCaloriesHeader}>Nutrientes Por Calorias:</h4>
                        <PieChartComponent data={nutrientesPorCalorias}/>
                    </div>
                </div>
            </div>
            <div className="mobileSpace"></div>
        </section>
    )
}