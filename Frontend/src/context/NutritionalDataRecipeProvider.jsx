import { createContext, useContext, useReducer, useState } from "react";

const NutritionalDataRecipeContext = createContext();

const NutritionalDataRecipeProvider = ({ children }) => {
    const [ porciones, setPorciones ] = useState(0);
    const [ ingredientes, setIngredientes ] = useState([]);
    const [ ingredientesView, setIngredientesView ] = useState([]);
    const [ nutritionalValues, setNutritionalValues ] = useState({});
    const [ initialPortion, setInitialPortion ] = useState(0);

    const changePortion = porcionesData => {
        let informacionNutrimental = {
            calorias: 0,
            proteina: 0,
            carbohidratos: 0,
            grasas_saturadas: 0,
            grasas_insaturadas: 0,
            grasas_trans: 0,
            sodio: 0
        }
        setPorciones(porcionesData);
        let newIngredientValues = ingredientes.map(ingredient => {
            let conversion = (ingredient.cantidad/initialPortion) * (porcionesData);
            informacionNutrimental.calorias += (ingredient.ingrediente.calorias * (conversion));
            informacionNutrimental.proteina += (ingredient.ingrediente.proteinas * (conversion));
            informacionNutrimental.carbohidratos += (ingredient.ingrediente.carbohidratos * (conversion));
            informacionNutrimental.grasas_saturadas += (ingredient.ingrediente.grasas_saturadas * (conversion));
            informacionNutrimental.grasas_insaturadas += (ingredient.ingrediente.grasas_insaturadas * (conversion));
            informacionNutrimental.grasas_trans += (ingredient.ingrediente.grasas_trans * (conversion));
            informacionNutrimental.sodio += (ingredient.ingrediente.sodio * (conversion));
            setNutritionalValues(informacionNutrimental);
            return {
                text: `${conversion} ${ingredient.unidad == 'numerica' ? (ingredient.ingrediente.consistencia == 'solido' ? "g" : "ml") : ingredient.unidad == 'cucharadita' ? "cdta." : (ingredient.unidad == "cucharada" ? "cda." : (ingredient.unidad == "taza" ? "taza" : ""))} de ${ingredient.ingrediente.nombre}`,
                image: ingredient.ingrediente.foto_ingrediente.includes('ingrediente_placeholder') ? null : ingredient.ingrediente.foto_ingrediente
            }
        });
        setIngredientesView(newIngredientValues);
    }

    return (
        <NutritionalDataRecipeContext.Provider value={{
            porciones,
            ingredientesView,
            nutritionalValues,
            setNutritionalValues,
            setInitialPortion,
            changePortion,
            setPorciones,
            setIngredientes,
            setIngredientesView
        }}>
            {children}
        </NutritionalDataRecipeContext.Provider>
    );
}

function useNutritionalDataRecipeProvider(){
    const context = useContext(NutritionalDataRecipeContext);
    if(context === undefined) throw new Error('NutritionalDataRecipeContext was used outside the RightSidebarProvider');
    return context;
}

export {NutritionalDataRecipeProvider, useNutritionalDataRecipeProvider};