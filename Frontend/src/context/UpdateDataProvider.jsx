import { createContext, useContext, useReducer } from "react";

const UpdateDataContext = createContext();

const initialState = {
    updatedUser: {},
    disabledUser: -1
}

function reducer(state, action){
    switch(action.type){
        case 'updateData/updateUser':
            return { ...state, updatedUser: action.payload }
        case 'updateData/disableUser':
            return { ...state, disabledUser: action.payload }
        case 'updateData/resetUserState':
            return { ...state, updatedUser: {}, disabledUser: -1 }
    }
}

const UpdateDataProvider = ({ children }) => {
    const [{ updatedUser, disabledUser }, dispatch] = useReducer(reducer, initialState);

    function setUpdatedUser(user){
        dispatch({type: 'updateData/updateUser', payload: user});
    }

    function setDisabledUser(userId){
        dispatch({type: 'updateData/disableUser', payload: userId});
    }

    function resetUserState(){
        dispatch({type: 'updateData/resetUserState'});
    }

    return (
        <UpdateDataContext.Provider value={{
            updatedUser,
            disabledUser,
            setUpdatedUser,
            setDisabledUser,
            resetUserState
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