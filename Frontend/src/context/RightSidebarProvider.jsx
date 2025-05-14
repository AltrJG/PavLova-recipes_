import { createContext, useContext, useReducer } from "react";

const RightSidebarContext = createContext();

const initialState = {
    isOpen: false,
    updatePermissions: false,
    modifyProfile: false,
    ingredientForm: false,
    recipeAdvanceFiltersForm: false,
    recipeAdvanceFilters: {},
    userModify: {},
    ingredientModify: null,
    categoriaEtiquetaForm: false,
    categoriaModify: false,
    etiquetaModify: false,
    categoriaEtiquetaModify: null,
    nutritionalObjectivesForm: false,
    nutritionalObjectives: {}
}

function reducer(state, action){
    switch(action.type){
        case 'rightSidebar/open':
            return { ...state, isOpen: true }
        case 'rightSidebar/close':
            return { ...state, isOpen: false }
        case 'rightSidebar/openModifyProfile':
            return { ...state, modifyProfile: true, updatePermissions: false, ingredientForm: false, ingredientModify: null, categoriaEtiquetaForm: false, etiquetaModify: false, categoriaModify: false, categoriaEtiquetaModify: null, nutritionalObjectivesForm: false, nutritionalObjectives: {} }
        case 'rightSidebar/openUpdatePermissions':
            return { ...state, modifyProfile: false, updatePermissions: true, ingredientForm: false, ingredientModify: null, categoriaEtiquetaForm: false, etiquetaModify: false, categoriaModify: false, categoriaEtiquetaModify: null, nutritionalObjectivesForm: false, nutritionalObjectives: {} }
        case 'rightSidebar/openIngredientForm':
            return { ...state, modifyProfile: false, updatePermissions: false, ingredientForm: true, ingredientModify: null, categoriaEtiquetaForm: false, etiquetaModify: false, categoriaModify: false, categoriaEtiquetaModify: null, nutritionalObjectivesForm: false, nutritionalObjectives: {} }
        case 'rightSidebar/openCategoriaEtiquetaForm':
            return { ...state, modifyProfile: false, updatePermissions: false, ingredientForm: false, ingredientModify: null, categoriaEtiquetaForm: true, etiquetaModify: false, categoriaModify: false, categoriaEtiquetaModify: null, nutritionalObjectivesForm: false, nutritionalObjectives: {} }
        case 'rightSidebar/setUserModify':
            return { ...state, userModify: action.payload }
        case 'rightSidebar/setCategoriaModify':
            return { ...state, categoriaModify: true, etiquetaModify: false, categoriaEtiquetaModify: action.payload }
        case 'rightSidebar/setEtiquetaModify':
            return { ...state, categoriaModify: false, etiquetaModify: true, categoriaEtiquetaModify: action.payload }
        case 'rightSidebar/setIngredientModify':
            return { ...state, ingredientModify: action.payload }
        case 'rightSidebar/openNutritionalObjectivesForm':
            return { ...state, modifyProfile: false, updatePermissions: false, ingredientForm: false, ingredientModify: null, categoriaEtiquetaForm: false, etiquetaModify: false, categoriaModify: false, categoriaEtiquetaModify: null, nutritionalObjectivesForm: true, nutritionalObjectives: action.payload  }
        case 'rightSidebar/openRecipesAdvanceFilters':
            return { ...state, modifyProfile: false, updatePermissions: false, ingredientForm: false, ingredientModify: null, categoriaEtiquetaForm: false, etiquetaModify: false, categoriaModify: false, categoriaEtiquetaModify: null, nutritionalObjectivesForm: false, nutritionalObjectives: {}, recipeAdvanceFiltersForm: true, recipeAdvanceFilters: action.payload }
        }
}

const RightSidebarProvider = ({ children }) => {
    const [{ isOpen, updatePermissions, modifyProfile, userModify, ingredientForm, ingredientModify, categoriaEtiquetaForm, categoriaEtiquetaModify, categoriaModify, etiquetaModify, nutritionalObjectivesForm, recipeAdvanceFiltersForm, recipeAdvanceFilters }, dispatch] = useReducer(reducer, initialState);

    function openRightSidebar(){
        dispatch({type: 'rightSidebar/open'});
    }

    function closeRightSidebar(){
        dispatch({type: 'rightSidebar/close'});
    }

    function openModifyProfile(){
        openRightSidebar();
        dispatch({type: 'rightSidebar/openModifyProfile'});
    }

    function openUpdatePermissions(user){
        openRightSidebar();
        dispatch({type: 'rightSidebar/setUserModify', payload: user});
        dispatch({type: 'rightSidebar/openUpdatePermissions'});
    }

    function openIngredientModify(ingredient = null){
        openRightSidebar();
        dispatch({type: 'rightSidebar/openIngredientForm'});
        (ingredient != null) && dispatch({type: 'rightSidebar/setIngredientModify', payload: ingredient});
    }

    function openCategoriaEtiquetaForm(categoriaEtiqueta = null, type = null){
        openRightSidebar();
        dispatch({type: 'rightSidebar/openCategoriaEtiquetaForm'});
        (categoriaEtiqueta != null && type != null) && (type == 'Categoria' ? dispatch({type: 'rightSidebar/setCategoriaModify', payload: categoriaEtiqueta}) : dispatch({type: 'rightSidebar/setEtiquetaModify', payload: categoriaEtiqueta}) )
    }

    function openNutritionalObjectivesForm(objectives = null){
        openRightSidebar();
        dispatch({type: 'rightSidebar/openNutritionalObjectivesForm', payload: objectives});
    }

    function openRecipesAdvanceFilters(filters = null){
        openRightSidebar();
        dispatch({type: 'rightSidebar/openRecipesAdvanceFilters', payload: filters});
    }

    return (
        <RightSidebarContext.Provider value={{
            isOpen,
            updatePermissions,
            modifyProfile,
            userModify,
            ingredientForm,
            ingredientModify,
            categoriaEtiquetaForm,
            categoriaEtiquetaModify,
            categoriaModify,
            etiquetaModify,
            nutritionalObjectivesForm,
            recipeAdvanceFiltersForm,
            recipeAdvanceFilters,
            openModifyProfile,
            openUpdatePermissions,
            closeRightSidebar,
            openIngredientModify,
            openCategoriaEtiquetaForm,
            openNutritionalObjectivesForm,
            openRecipesAdvanceFilters
        }}>
            {children}
        </RightSidebarContext.Provider>
    );
}

function useRightSidebar(){
    const context = useContext(RightSidebarContext);
    if(context === undefined) throw new Error('RightSidebarContext was used outside the RightSidebarProvider');
    return context;
}

export { RightSidebarProvider, useRightSidebar}