import { createContext, useContext, useReducer } from "react";

const RightSidebarContext = createContext();

const initialState = {
    isOpen: false,
    updatePermissions: false,
    modifyProfile: false,
    ingredientForm: false,
    userModify: {},
    ingredientModify: null,
    categoriaEtiquetaForm: false,
    categoriaModify: false,
    etiquetaModify: false,
    categoriaEtiquetaModify: null
}

function reducer(state, action){
    switch(action.type){
        case 'rightSidebar/open':
            return { ...state, isOpen: true }
        case 'rightSidebar/close':
            return { ...state, isOpen: false }
        case 'rightSidebar/openModifyProfile':
            return { ...state, modifyProfile: true, updatePermissions: false, ingredientForm: false, ingredientModify: null, categoriaEtiquetaForm: false, etiquetaModify: false, categoriaModify: false, categoriaEtiquetaModify: null }
        case 'rightSidebar/openUpdatePermissions':
            return { ...state, modifyProfile: false, updatePermissions: true, ingredientForm: false, ingredientModify: null, categoriaEtiquetaForm: false, etiquetaModify: false, categoriaModify: false, categoriaEtiquetaModify: null }
        case 'rightSidebar/openIngredientForm':
            return { ...state, modifyProfile: false, updatePermissions: false, ingredientForm: true, ingredientModify: null, categoriaEtiquetaForm: false, etiquetaModify: false, categoriaModify: false, categoriaEtiquetaModify: null }
        case 'rightSidebar/openCategoriaEtiquetaForm':
            return { ...state, modifyProfile: false, updatePermissions: false, ingredientForm: false, ingredientModify: null, categoriaEtiquetaForm: true, etiquetaModify: false, categoriaModify: false, categoriaEtiquetaModify: null }
        case 'rightSidebar/setUserModify':
            return { ...state, userModify: action.payload }
        case 'rightSidebar/setCategoriaModify':
            return { ...state, categoriaModify: true, etiquetaModify: false, categoriaEtiquetaModify: action.payload }
        case 'rightSidebar/setEtiquetaModify':
            return { ...state, categoriaModify: false, etiquetaModify: true, categoriaEtiquetaModify: action.payload }
        case 'rightSidebar/setIngredientModify':
            return { ...state, ingredientModify: action.payload }
    }
}

const RightSidebarProvider = ({ children }) => {
    const [{ isOpen, updatePermissions, modifyProfile, userModify, ingredientForm, ingredientModify, categoriaEtiquetaForm, categoriaEtiquetaModify, categoriaModify, etiquetaModify }, dispatch] = useReducer(reducer, initialState);

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
            openModifyProfile,
            openUpdatePermissions,
            closeRightSidebar,
            openIngredientModify,
            openCategoriaEtiquetaForm
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