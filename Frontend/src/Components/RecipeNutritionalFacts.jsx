import { useNutritionalDataRecipeProvider } from '../context/NutritionalDataRecipeProvider';
import NutritionalBadge from './NutritionalBadge';
import NutritionalTable from './NutritionalTable';
import styles from './RecipeNutritionalFacts.module.css';

export default function RecipeNutritionalFacts(){

    const { nutritionalValues } = useNutritionalDataRecipeProvider();

    const nutritionalData = {
        Calorias: `${nutritionalValues.calorias.toFixed(2)} Kcal`,
        Carbohidratos: `${nutritionalValues.carbohidratos.toFixed(2)}g`,
        Proteinas: `${nutritionalValues.proteina.toFixed(2)}g`,
        'Grasas Saturadas': `${nutritionalValues.grasas_saturadas.toFixed(2)}g`,
        'Grasas Insaturadas': `${nutritionalValues.grasas_insaturadas.toFixed(2)}g`,
        'Grasas Trans': `${nutritionalValues.grasas_trans.toFixed(2)}g`,
        Sodio: `${nutritionalValues.sodio.toFixed(2)}mg`
    };

    const nutritionalBadges = [
        { title: "Grasa saturada", unit: "Cal/kcal", value: 20, isNumber: false },
        { title: "Otras grasas", unit: "Cal/kcal", value: 15, isNumber: false },
        { title: "Azúcares totales", unit: "Cal/kcal", value: 30, isNumber: false },
        { title: "Sodio", unit: "mg/g", value: 12, isNumber: false },
        { title: "Energía", unit: "Cal/kcal", value: 40, isNumber: true },
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
        </div>
    )
}