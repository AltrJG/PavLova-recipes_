import { useEffect, useState } from 'react';
import { useNutritionalDataRecipeProvider } from '../context/NutritionalDataRecipeProvider';
import NutritionalBadge from './NutritionalBadge';
import NutritionalTable from './NutritionalTable';
import styles from './RecipeNutritionalFacts.module.css';
import { calcularNutrienteAporteCalorias } from './utils/calculadorNutrientes';

export default function RecipeNutritionalFacts(){

    const { nutritionalValues } = useNutritionalDataRecipeProvider();
    const [ nutritionalPercentages, setNutritionalPercentages ] = useState({});

    const nutritionalData = {
        Calorias: `${nutritionalValues?.calorias?.toFixed(2)} Kcal`,
        Carbohidratos: `${nutritionalValues?.carbohidratos?.toFixed(2)}g`,
        Proteinas: `${nutritionalValues?.proteina?.toFixed(2)}g`,
        'Grasas Saturadas': `${nutritionalValues?.grasas_saturadas?.toFixed(2)}g`,
        'Grasas Insaturadas': `${nutritionalValues?.grasas_insaturadas?.toFixed(2)}g`,
        'Grasas Trans': `${nutritionalValues?.grasas_trans?.toFixed(2)}g`,
        Sodio: `${nutritionalValues?.sodio?.toFixed(2)}mg`
    };

    useEffect(() => {
        setNutritionalPercentages(calcularNutrienteAporteCalorias(nutritionalValues));
    }, [nutritionalValues]);

    const nutritionalBadges = [
        { title: "Grasa saturada", unit: "%", value: nutritionalPercentages.grasas_saturadas, isNumber: false },
        { title: "Grasa insaturada", unit: "%", value: nutritionalPercentages.grasas_insaturadas, isNumber: false },
        { title: "Grasa Trans", unit: "%", value: nutritionalPercentages.grasas_trans, isNumber: false },
        { title: "Proteina", unit: "%", value: nutritionalPercentages.proteina, isNumber: false },
        { title: "Carbohi dratos", unit: "%", value: nutritionalPercentages.carbohidratos, isNumber: false },
      ];

    return(
        <div className={styles.recipeNutritionContainer}>
            <h4 className={styles.recipeContentsText}>Informacion Nutricional:</h4>
            <div className={styles.recipeNutritionTable}>
                <NutritionalTable nutritionalData={nutritionalData}/>
            </div>
            <div className={styles.infoContainer}>
                {nutritionalBadges.map((item, index) => (
                    <NutritionalBadge
                    key={index}
                    title={item.title}
                    unit={item.unit}
                    value={item.value}
                    isNumber={item.isNumber}
                    />
                ))}
            </div>
            <p className={styles.advise}>ATENCION: Puede que estos valores sean aproximaciones cercanas y no exactos, consulta a tu nutriólogo para mas informacion de esta receta. </p>
        </div>
    )
}