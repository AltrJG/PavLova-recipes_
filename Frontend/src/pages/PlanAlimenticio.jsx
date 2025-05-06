import { useState } from 'react';
import BurbujaCanvas from '../Components/BurbujaCanvas';
import Help from '../Components/Help';
import styles from './PlanAlimenticio.module.css';
import Recipe from '../Components/Recipe';
import PlusIcon from '../assets/Iconos/add-circle-outline.svg';
import { ReactSVG } from 'react-svg';
import NutritionalTable from '../Components/NutritionalTable';

export default function PlanAlimenticio(){

    const [ activeDay, setActiveDay ] = useState(1);
    const days = [
        { value: 1, day: 'dayOne' },
        { value: 2, day: 'dayTwo' },
        { value: 3, day: 'dayThree' },
        { value: 4, day: 'dayFour' },
        { value: 5, day: 'dayFive' },
        { value: 6, day: 'daySix' },
        { value: 7, day: 'daySeven' }
    ]

    const nutritionalData = {
        Calorias: `50 Kcal`,
        Carbohidratos: `50g`,
        Proteinas: `50g`,
        'Grasas Saturadas': `50g`,
        'Grasas Insaturadas': `50g`,
        'Grasas Trans': `50g`,
        Sodio: `50mg`
    }

    return(
        <section className={styles.planAlimenticioContainer}>
            <BurbujaCanvas/>
            <Help title={'Plan alimenticio'} description={'Crea tu plan alimenticio'}></Help>
            <div className={styles.planAlimenticioSeparation}>
                <div className={styles.planMainContent}>
                    <div className={styles.daysContainer}>
                        { days.map(day => <div onClick={() => setActiveDay(day.value)} key={day.value} className={`${styles.dias} ${activeDay == day.value ? styles.activeDay : ""}`}><div className={styles.diaNumero}>{day.value}</div><p className={styles.diaTexto}>Dia</p></div>) }
                    </div>
                    <div className={styles.selectedRecipes}>
                        <div className="recipesContent">
                            <Recipe/>
                            <Recipe/>
                            <Recipe/>
                            <button className={styles.addRecipes}><span className={styles.recipeAddIcon}><ReactSVG src={PlusIcon}/></span>Agregar Recetas...</button>
                        </div>
                    </div>
                </div>
                <div className={styles.planImportantData}>
                    <div className={styles.recipeNutritionTable}>
                        <h5 className={styles.headerInfoNutricional}>Informacion Nutricional</h5>
                        <NutritionalTable nutritionalData={nutritionalData}/>
                    </div>
                </div>
            </div>
            <div className="mobileSpace"></div>
        </section>
    )
}