import { createContext, useContext, useReducer, useState } from "react";
import { calcularNutrientes } from "../Components/utils/calculadorNutrientes";
import { useAuth } from "./AuthProvider";

const NutritionalDataRecipeContext = createContext();

const NutritionalDataRecipeProvider = ({ children }) => {
    const [ porciones, setPorciones ] = useState(0);
    const [ ingredientes, setIngredientes ] = useState([]);
    const [ ingredientesView, setIngredientesView ] = useState([]);
    const [ nutritionalValues, setNutritionalValues ] = useState({});
    const [ initialPortion, setInitialPortion ] = useState(0);
    const { isSuperUser, isStaff } = useAuth();

    const changePortion = porcionesData => {

        setPorciones(porcionesData);
        let nutrientes = calcularNutrientes(ingredientes, initialPortion, porcionesData);
        setNutritionalValues(nutrientes);
        let newIngredientValues = ingredientes.map(ingredient => {
            let conversion = (ingredient.cantidad/initialPortion) * (porcionesData);
            return {
                text: `${conversion.toFixed(2)} ${ingredient.unidad == 'numerica' ? (ingredient.ingrediente.consistencia == 'solido' ? "g" : "ml") : ingredient.unidad == 'cucharadita' ? "cdta." : (ingredient.unidad == "cucharada" ? "cda." : (ingredient.unidad == "taza" ? "taza" : ""))} de ${ingredient.ingrediente.nombre} ${(isSuperUser || isStaff) ? `(EA: ${ingredient.ingrediente.escala_agua})` : ""}`,
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