import { createContext, useContext, useReducer } from "react";

const RightSidebarContext = createContext();

const initialState = {
    isOpen: false,
    updatePermissions: false,
    modifyProfile: false,
    ingredientForm: false,
    recipeAdvanceFiltersForm: false,
    recipeAdvanceFilters: {},
    aiForm: false,
    aiFormSettings: false,
    aiFormUpdatePreset: {},
    userModify: {},
    ingredientModify: null,
    categoriaEtiquetaForm: false,
    categoriaModify: false,
    etiquetaModify: false,
    categoriaEtiquetaModify: null,
    nutritionalObjectivesForm: false,
    nutritionalObjectives: {},
    changeVisibilityForm: false,
    changeVisibilityData: {},
    healthScoreForm: false,
    healthScoreData: {}
}

function reducer(state, action){
    switch(action.type){
        case 'rightSidebar/open':
            return { ...state, isOpen: true }
        case 'rightSidebar/close':
            return { ...state, isOpen: false }
        case 'rightSidebar/openModifyProfile':
            return { ...state, modifyProfile: true, updatePermissions: false, ingredientForm: false, ingredientModify: null, categoriaEtiquetaForm: false, etiquetaModify: false, categoriaModify: false, categoriaEtiquetaModify: null, nutritionalObjectivesForm: false, nutritionalObjectives: {}, recipeAdvanceFiltersForm: false, recipeAdvanceFilters: {}, aiForm: false, aiFormSettings: false, changeVisibilityForm: false, changeVisibilityData: {}, healthScoreForm: false, healthScoreData: {}, aiFormUpdatePreset: {} }
        case 'rightSidebar/openUpdatePermissions':
            return { ...state, modifyProfile: false, updatePermissions: true, ingredientForm: false, ingredientModify: null, categoriaEtiquetaForm: false, etiquetaModify: false, categoriaModify: false, categoriaEtiquetaModify: null, nutritionalObjectivesForm: false, nutritionalObjectives: {}, recipeAdvanceFiltersForm: false, recipeAdvanceFilters: {}, aiForm: false, aiFormSettings: false, changeVisibilityForm: false, changeVisibilityData: {}, healthScoreForm: false, healthScoreData: {}, aiFormUpdatePreset: {} }
        case 'rightSidebar/openIngredientForm':
            return { ...state, modifyProfile: false, updatePermissions: false, ingredientForm: true, ingredientModify: null, categoriaEtiquetaForm: false, etiquetaModify: false, categoriaModify: false, categoriaEtiquetaModify: null, nutritionalObjectivesForm: false, nutritionalObjectives: {}, recipeAdvanceFiltersForm: false, recipeAdvanceFilters: {}, aiForm: false, aiFormSettings: false, changeVisibilityForm: false, changeVisibilityData: {}, healthScoreForm: false, healthScoreData: {}, aiFormUpdatePreset: {} }
        case 'rightSidebar/openCategoriaEtiquetaForm':
            return { ...state, modifyProfile: false, updatePermissions: false, ingredientForm: false, ingredientModify: null, categoriaEtiquetaForm: true, etiquetaModify: false, categoriaModify: false, categoriaEtiquetaModify: null, nutritionalObjectivesForm: false, nutritionalObjectives: {}, recipeAdvanceFiltersForm: false, recipeAdvanceFilters: {}, aiForm: false, aiFormSettings: false, changeVisibilityForm: false, changeVisibilityData: {}, healthScoreForm: false, healthScoreData: {}, aiFormUpdatePreset: {} }
        case 'rightSidebar/setUserModify':
            return { ...state, userModify: action.payload }
        case 'rightSidebar/setCategoriaModify':
            return { ...state, categoriaModify: true, etiquetaModify: false, categoriaEtiquetaModify: action.payload }
        case 'rightSidebar/setEtiquetaModify':
            return { ...state, categoriaModify: false, etiquetaModify: true, categoriaEtiquetaModify: action.payload }
        case 'rightSidebar/setIngredientModify':
            return { ...state, ingredientModify: action.payload }
        case 'rightSidebar/openNutritionalObjectivesForm':
            return { ...state, modifyProfile: false, updatePermissions: false, ingredientForm: false, ingredientModify: null, categoriaEtiquetaForm: false, etiquetaModify: false, categoriaModify: false, categoriaEtiquetaModify: null, nutritionalObjectivesForm: true, nutritionalObjectives: action.payload, recipeAdvanceFiltersForm: false, recipeAdvanceFilters: {}, aiForm: false, aiFormSettings: false, changeVisibilityForm: false, changeVisibilityData: {}, healthScoreForm: false, healthScoreData: {}, aiFormUpdatePreset: {} }
        case 'rightSidebar/openRecipesAdvanceFilters':
            return { ...state, modifyProfile: false, updatePermissions: false, ingredientForm: false, ingredientModify: null, categoriaEtiquetaForm: false, etiquetaModify: false, categoriaModify: false, categoriaEtiquetaModify: null, nutritionalObjectivesForm: false, nutritionalObjectives: {}, recipeAdvanceFiltersForm: true, recipeAdvanceFilters: action.payload, aiForm: false, aiFormSettings: false, changeVisibilityForm: false, changeVisibilityData: {}, healthScoreForm: false, healthScoreData: {}, aiFormUpdatePreset: {} }
        case 'rightSidebar/openAiForm':
            return { ...state, modifyProfile: false, updatePermissions: false, ingredientForm: false, ingredientModify: null, categoriaEtiquetaForm: false, etiquetaModify: false, categoriaModify: false, categoriaEtiquetaModify: null, nutritionalObjectivesForm: false, nutritionalObjectives: {}, recipeAdvanceFiltersForm: false, recipeAdvanceFilters: {}, aiForm: true, aiFormSettings: false, changeVisibilityForm: false, changeVisibilityData: {}, healthScoreForm: false, healthScoreData: {}, aiFormUpdatePreset: {} }
        case 'rightSidebar/openAiFormSettings':
            return { ...state, modifyProfile: false, updatePermissions: false, ingredientForm: false, ingredientModify: null, categoriaEtiquetaForm: false, etiquetaModify: false, categoriaModify: false, categoriaEtiquetaModify: null, nutritionalObjectivesForm: false, nutritionalObjectives: {}, recipeAdvanceFiltersForm: false, recipeAdvanceFilters: {}, aiForm: false, aiFormSettings: true, changeVisibilityForm: false, changeVisibilityData: {}, healthScoreForm: false, healthScoreData: {}, aiFormUpdatePreset: {} }
        case 'rightSidebar/updateAiFormSettings':
            return { ...state, modifyProfile: false, updatePermissions: false, ingredientForm: false, ingredientModify: null, categoriaEtiquetaForm: false, etiquetaModify: false, categoriaModify: false, categoriaEtiquetaModify: null, nutritionalObjectivesForm: false, nutritionalObjectives: {}, recipeAdvanceFiltersForm: false, recipeAdvanceFilters: {}, aiForm: false, aiFormSettings: true, changeVisibilityForm: false, changeVisibilityData: {}, healthScoreForm: false, healthScoreData: {}, aiFormUpdatePreset: action.payload }
        case 'rightSidebar/openChangeVisibilty':
            return { ...state, modifyProfile: false, updatePermissions: false, ingredientForm: false, ingredientModify: null, categoriaEtiquetaForm: false, etiquetaModify: false, categoriaModify: false, categoriaEtiquetaModify: null, nutritionalObjectivesForm: false, nutritionalObjectives: {}, recipeAdvanceFiltersForm: false, recipeAdvanceFilters: {}, aiForm: false, aiFormSettings: false, changeVisibilityForm: true, changeVisibilityData: action.payload, healthScoreForm: false, healthScoreData: {}, aiFormUpdatePreset: {} }
        case 'rightSidebar/openHealthScoreForm':
            return { ...state, modifyProfile: false, updatePermissions: false, ingredientForm: false, ingredientModify: null, categoriaEtiquetaForm: false, etiquetaModify: false, categoriaModify: false, categoriaEtiquetaModify: null, nutritionalObjectivesForm: false, nutritionalObjectives: {}, recipeAdvanceFiltersForm: false, recipeAdvanceFilters: {}, aiForm: false, aiFormSettings: false, changeVisibilityForm: false, changeVisibilityData: {}, healthScoreForm: true, healthScoreData: action.payload, aiFormUpdatePreset: {} }
        }
}

const RightSidebarProvider = ({ children }) => {
    const [{ 
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
        nutritionalObjectives, 
        recipeAdvanceFiltersForm, 
        recipeAdvanceFilters, 
        aiForm, 
        aiFormSettings, 
        changeVisibilityForm, 
        changeVisibilityData,
        healthScoreForm,
        healthScoreData,
        aiFormUpdatePreset }, 
        dispatch] = useReducer(reducer, initialState);

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

    function openNutritionalObjectivesForm(objectives = null, plan_id){
        openRightSidebar();
        dispatch({type: 'rightSidebar/openNutritionalObjectivesForm', payload: {objectives, plan_id}});
    }

    function openRecipesAdvanceFilters(filters = null){
        openRightSidebar();
        dispatch({type: 'rightSidebar/openRecipesAdvanceFilters', payload: filters});
    }

    function openAiForm(){
        openRightSidebar();
        dispatch({type: 'rightSidebar/openAiForm'})
    }

    function openAiFormSettings(preset = null){
        openRightSidebar();
        dispatch({type: 'rightSidebar/openAiFormSettings'});
        if(preset != null) dispatch({type: 'rightSidebar/updateAiFormSettings', payload: preset});
        if(preset == null) dispatch({type: 'rightSidebar/updateAiFormSettings', payload: {}});
    }

    function openChangeVisibilty(id, nombre, visibilidad){
        openRightSidebar();
        dispatch({type: 'rightSidebar/openChangeVisibilty', payload: {id, nombre, visibilidad}});
    }

    function openHealthScoreForm(id, nombre, scores){
        openRightSidebar();
        dispatch({type: 'rightSidebar/openHealthScoreForm', payload: {id, nombre, scores}});
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
            nutritionalObjectives,
            recipeAdvanceFiltersForm,
            recipeAdvanceFilters,
            aiForm,
            aiFormSettings,
            changeVisibilityForm,
            changeVisibilityData,
            healthScoreForm,
            healthScoreData,
            aiFormUpdatePreset,
            openModifyProfile,
            openUpdatePermissions,
            closeRightSidebar,
            openIngredientModify,
            openCategoriaEtiquetaForm,
            openNutritionalObjectivesForm,
            openRecipesAdvanceFilters,
            openAiForm,
            openAiFormSettings,
            openChangeVisibilty,
            openHealthScoreForm
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