import styles from './RecipeContents.module.css';
import ShowImage from './ShowImage';
import { useEffect, useState } from 'react';
import { useNutritionalDataRecipeProvider } from '../context/NutritionalDataRecipeProvider';
import { calcularNutrientes } from './utils/calculadorNutrientes';

export default function RecipeContents({recipe, admin=false, staff=false}){

    const { ingredientesView, setIngredientesView, changePortion, porciones, setInitialPortion, setPorciones, setIngredientes, setNutritionalValues } = useNutritionalDataRecipeProvider();

    useEffect(() => {
        setInitialPortion(recipe.porciones);
        setPorciones(recipe.porciones);
        setIngredientes(recipe.ingredientes);
        let nutrientes = calcularNutrientes(recipe.ingredientes, recipe.porciones, recipe.porciones);
        setNutritionalValues(nutrientes);
        let newIngredientValues = recipe.ingredientes.map(ingredient => {
            return {
                text: `${(ingredient.cantidad.toFixed(2))} ${ingredient.unidad == 'numerica' ? (ingredient.ingrediente.consistencia == 'solido' ? "g" : "ml") : ingredient.unidad == 'cucharadita' ? "cdta." : (ingredient.unidad == "cucharada" ? "cda." : (ingredient.unidad == "taza" ? "taza" : ""))} ${['taza', 'cucharadita', 'cucharada', 'numerica'].includes(ingredient.unidad) ? 'de' : ''} ${!['taza', 'cucharadita', 'cucharada', 'numerica'].includes(ingredient.unidad) ? ingredient.unidad.trim().split(' ').slice(1).join(' ') : ingredient.ingrediente.nombre} ${(admin || staff) ? `(EA: ${ingredient.ingrediente.escala_agua})` : ""}`,
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
                { ingredientesView.map(ingredient => <ShowImage key={ingredient.text} text={ingredient.text} position={'Top'} width={'17'} height={'12'} hasImage={ingredient.image != null} image={ingredient.image}/>)}
            </div>
        </div>
    )
}