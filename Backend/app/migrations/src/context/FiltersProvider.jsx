import { createContext, useContext, useState } from "react";

const FiltersContext = createContext();

const FiltersProvider = ({ children }) => {
    const [ userUpdate, setUserUpdate ] = useState(false);
    const [ activeCategoria, setActiveCategoria ] = useState('');
    const [ recipeUpdate, setRecipeUpdate ] = useState(false);
    const [ userFilters, setUserFilters ] = useState({
        nombre: "",
        correo: "",
        tipoUsuario: "Todos"
    });
    const [ userRecipeFilters, setUserRecipeFilters ] = useState({
        nombre: "",
        nombre_usuario: "",
        rating: ''
    });
    const [ searchOption, setSearchOption ] = useState('mis-recetas');
    const [ recipeFilters, setRecipeFilters ] = useState({
        nombre: "",
        nombre_usuario: "",
        tipoUsuario: "Todos"
    });

    const setGlobalUserName = (nombre) => {
        setUserFilters({
            nombre,
            correo: "",
            tipoUsuario: "Todos"
        })
    };

    const setGlobalRecipeName = (nombre) => {
        setActiveCategoria('');
        setRecipeFilters({
            nombre,
            nombre_usuario: "",
            tipoUsuario: "Todos"
        })
    }

    return (
        <FiltersContext.Provider value={{
            userFilters,
            userUpdate,
            recipeFilters,
            recipeUpdate,
            activeCategoria,
            userRecipeFilters, 
            searchOption,
            setSearchOption,
            setUserRecipeFilters,
            setActiveCategoria,
            setRecipeUpdate,
            setRecipeFilters,
            setUserUpdate,
            setUserFilters,
            setGlobalUserName,
            setGlobalRecipeName
        }}>
            {children}
        </FiltersContext.Provider>
    );
}

function useFilters(){
    const context = useContext(FiltersContext);
    if(context === undefined) throw new Error('NutritionalDataRecipeContext was used outside the RightSidebarProvider');
    return context;
}

export {FiltersProvider, useFilters};