import { createContext, useContext, useReducer } from "react";

const UpdateDataContext = createContext();

const initialState = {
    updatedUser: {},
    disabledUser: -1,
    createdIngredient: {},
    updatedIngredient: {},
    createdEtiqueta: {},
    updatedEtiqueta: {},
    createdCategoria: {},
    updatedCategoria: {},
}

function reducer(state, action){
    switch(action.type){
        case 'updateData/updateUser':
            return { ...state, updatedUser: action.payload }
        case 'updateData/disableUser':
            return { ...state, disabledUser: action.payload }
        case 'updateData/resetUserState':
            return { ...state, updatedUser: {}, disabledUser: -1 }
        case 'updateData/setCreatedIngredient':
            return { ...state, createdIngredient: action.payload }
        case 'updateData/setUpdatedIngredient':
            return { ...state, updatedIngredient: action.payload }
        case 'updateData/resetIngredientState':
            return { ...state, updatedIngredient: {}, createdIngredient: {}}
        case 'updateData/setCreatedEtiqueta':
            return { ...state, createdEtiqueta: action.payload }
        case 'updateData/setUpdatedEtiqueta':
            return { ...state, updatedEtiqueta: action.payload }
        case 'updateData/setCreatedCategoria':
            return { ...state, createdCategoria: action.payload }
        case 'updateData/setUpdatedCategoria':
            return { ...state, updatedCategoria: action.payload }
        case 'updateData/resetEtiquetaState':
            return { ...state, updatedEtiqueta: {}, createdEtiqueta: {}}
        case 'updateData/resetCategoriaState':
            return { ...state, updatedCategoria: {}, createdCategoria: {}}
    }
}

const UpdateDataProvider = ({ children }) => {
    const [{ updatedUser, disabledUser, createdIngredient, updatedIngredient, createdEtiqueta, updatedEtiqueta, createdCategoria, updatedCategoria }, dispatch] = useReducer(reducer, initialState);

    function setUpdatedUser(user){
        dispatch({type: 'updateData/updateUser', payload: user});
    }

    function setDisabledUser(userId){
        dispatch({type: 'updateData/disableUser', payload: userId});
    }

    function setCreatedIngredient(ingredient){
        dispatch({type: 'updateData/setCreatedIngredient', payload: ingredient});
    }

    function setUpdatedIngredient(ingredient){
        dispatch({type: 'updateData/setUpdatedIngredient', payload: ingredient});
    }

    function setCreatedEtiqueta(etiqueta){
        dispatch({type: 'updateData/setCreatedEtiqueta', payload: etiqueta});
    }

    function setUpdatedEtiqueta(etiqueta){
        dispatch({type: 'updateData/setUpdatedEtiqueta', payload: etiqueta});
    }

    function setCreatedCategoria(categoria){
        dispatch({type: 'updateData/setCreatedCategoria', payload: categoria});
    }

    function setUpdatedCategoria(categoria){
        dispatch({type: 'updateData/setUpdatedCategoria', payload: categoria});
    }

    function resetUserState(){
        dispatch({type: 'updateData/resetUserState'});
    }

    function resetIngredientState(){
        dispatch({type: 'updateData/resetIngredientState'})
    }

    function resetCategoriaEtiquetaState(){
        dispatch({type: "updateData/resetEtiquetaState"});
        dispatch({type: "updateData/resetCategoriaState"});
    }

    return (
        <UpdateDataContext.Provider value={{
            updatedUser,
            disabledUser,
            createdIngredient,
            updatedIngredient,
            createdEtiqueta,
            updatedEtiqueta,
            createdCategoria,
            updatedCategoria,
            setUpdatedUser,
            setDisabledUser,
            setCreatedIngredient,
            setUpdatedIngredient,
            setCreatedEtiqueta,
            setUpdatedEtiqueta,
            setCreatedCategoria,
            setUpdatedCategoria,
            resetUserState,
            resetIngredientState,
            resetCategoriaEtiquetaState
        }}>
            {children}
        </UpdateDataContext.Provider>
    );
}

function useUpdateData(){
    const context = useContext(UpdateDataContext);
    if(context === undefined) throw new Error('UpdateDataContext was used outside the UpdateDataProvider');
    return context;
}

export { UpdateDataProvider, useUpdateData};