import NutritionalBadge from './NutritionalBadge';
import NutritionalTable from './NutritionalTable';
import styles from './RecipeNutritionalFacts.module.css';

export default function RecipeNutritionalFacts(){

    const nutritionalData = {
        Calorias: `50 Kcal`,
        Carbohidratos: `50g`,
        Proteinas: `50g`,
        'Grasas Saturadas': `50g`,
        'Grasas Insaturadas': `50g`,
        'Grasas Trans': `50g`,
        Sodio: `50mg`
    }

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