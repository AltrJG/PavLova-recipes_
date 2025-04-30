import styles from './RecipeContents.module.css';
import ShowImage from './ShowImage';
import { useEffect, useState } from 'react';
import { useNutritionalDataRecipeProvider } from '../context/NutritionalDataRecipeProvider';

export default function RecipeContents({recipe}){

    const { ingredientesView, setIngredientesView, changePortion, porciones, setInitialPortion, setPorciones, setIngredientes, setNutritionalValues } = useNutritionalDataRecipeProvider();

    useEffect(() => {
        setInitialPortion(recipe.porciones);
        setPorciones(recipe.porciones);
        setIngredientes(recipe.ingredientes);
        let informacionNutrimental = {
            calorias: 0,
            proteina: 0,
            carbohidratos: 0,
            grasas_saturadas: 0,
            grasas_insaturadas: 0,
            grasas_trans: 0,
            sodio: 0
        }
        let newIngredientValues = recipe.ingredientes.map(ingredient => {
            let conversion = ingredient.cantidad;
            informacionNutrimental.calorias += (ingredient.ingrediente.calorias * (conversion));
            informacionNutrimental.proteina += (ingredient.ingrediente.proteinas * (conversion));
            informacionNutrimental.carbohidratos += (ingredient.ingrediente.carbohidratos * (conversion));
            informacionNutrimental.grasas_saturadas += (ingredient.ingrediente.grasas_saturadas * (conversion));
            informacionNutrimental.grasas_insaturadas += (ingredient.ingrediente.grasas_insaturadas * (conversion));
            informacionNutrimental.grasas_trans += (ingredient.ingrediente.grasas_trans * (conversion));
            informacionNutrimental.sodio += (ingredient.ingrediente.sodio * (conversion));
            setNutritionalValues(informacionNutrimental);
            return {
                text: `${(ingredient.cantidad)} ${ingredient.unidad == 'numerica' ? (ingredient.ingrediente.consistencia == 'solido' ? "g" : "ml") : ingredient.unidad == 'cucharadita' ? "cdta." : (ingredient.unidad == "cucharada" ? "cda." : (ingredient.unidad == "taza" ? "taza" : ""))} de ${ingredient.ingrediente.nombre}`,
                image: ingredient.ingrediente.foto_ingrediente.includes('ingrediente_placeholder') ? null : ingredient.ingrediente.foto_ingrediente
            }
        });
        setIngredientesView(newIngredientValues);
    }, []);

    return(
        <div className={styles.recipeContentsContainer}>
            <h4 className={styles.recipeContentsText}>Ingredientes:</h4>
            <div className={styles.portionSliderContainer}>
                <p className={styles.portionSliderText}>Porciones: <span className={styles.portionSliderValue}>{porciones}</span></p>
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={porciones}
                    onChange={(e) => changePortion(Number(e.target.value))}
                    className={styles.portionSlider}
                />
            </div>
            <div className={styles.recipeContentsUsefulData}>
                { ingredientesView.map(ingredient => <ShowImage key={ingredient.text} text={ingredient.text} position={ingredient.text.length > 20 ? 'Top' : 'Right'} width={'17'} height={'12'} hasImage={ingredient.image != null} image={ingredient.image}/>)}
            </div>
        </div>
    )
}