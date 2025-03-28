import { createContext, useContext, useReducer } from "react";

const UpdateDataContext = createContext();

const initialState = {
    updatedUser: {},
    disabledUser: -1,
    createdIngredient: {},
    updatedIngredient: {},
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
        case 'updateData/setDeletedIngredient':
            return { ...state, deletedIngredient: action.payload }
        case 'updateData/resetIngredientState':
            return { ...state, updatedIngredient: {}, createdIngredient: {}}
    }
}

const UpdateDataProvider = ({ children }) => {
    const [{ updatedUser, disabledUser, createdIngredient, updatedIngredient }, dispatch] = useReducer(reducer, initialState);

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

    function resetUserState(){
        dispatch({type: 'updateData/resetUserState'});
    }

    function resetIngredientState(){
        dispatch({type: 'updateData/resetIngredientState'})
    }

    return (
        <UpdateDataContext.Provider value={{
            updatedUser,
            disabledUser,
            createdIngredient,
            updatedIngredient,
            setUpdatedUser,
            setDisabledUser,
            setCreatedIngredient,
            setUpdatedIngredient,
            resetUserState,
            resetIngredientState
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