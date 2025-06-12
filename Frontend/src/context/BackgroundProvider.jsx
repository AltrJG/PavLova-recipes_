import { createContext, useContext, useReducer, useState } from "react";
import { calcularNutrientes } from "../Components/utils/calculadorNutrientes";

const BackgroundContext = createContext();

const BackgroundProvider = ({ children }) => {
    const [ pavlorficAero, setPavlorficAero ] = useState(false);
    const [ ollaHirviendo, setOllaHirviendo ] = useState(false);

    const addPavlorficAero = () => {
        setPavlorficAero(true);
        setOllaHirviendo(false);
    }

    const addOllaHirviendo = () => {
        setPavlorficAero(false);
        setOllaHirviendo(true);
    }

    const disableBackground = () => {
        setPavlorficAero(false);
        setOllaHirviendo(false);
    }

    return (
        <BackgroundContext.Provider value={{
            pavlorficAero,
            ollaHirviendo,
            addPavlorficAero,
            addOllaHirviendo,
            disableBackground
        }}>
            {children}
        </BackgroundContext.Provider>
    );
}

function useBackground(){
    const context = useContext(BackgroundContext);
    if(context === undefined) throw new Error('NutritionalDataRecipeContext was used outside the RightSidebarProvider');
    return context;
}

export {BackgroundProvider, useBackground};