import { createContext, useContext, useReducer } from "react";


const RightSidebarContext = createContext();

const initialState = {
    isOpen: false,
    updatePermissions: false,
    modifyProfile: false,
    ingredientForm: false,
    userModify: {},
    ingredientModify: {}
}

function reducer(state, action){
    switch(action.type){
        case 'rightSidebar/open':
            return { ...state, isOpen: true }
        case 'rightSidebar/close':
            return { ...state, isOpen: false }
        case 'rightSidebar/openModifyProfile':
            return { ...state, modifyProfile: true, updatePermissions: false, ingredientForm: false }
        case 'rightSidebar/openUpdatePermissions':
            return { ...state, modifyProfile: false, updatePermissions: true, ingredientForm: false }
        case 'rightSidebar/openIngredientForm':
            return { ...state, modifyProfile: false, updatePermissions: false, ingredientForm: true }
        case 'rightSidebar/setUserModify':
            return { ...state, userModify: action.payload }
        case 'rightSidebar/setIngredientModify':
            return { ...state, ingredientModify: action.payload }
    }
}

const RightSidebarProvider = ({ children }) => {
    const [{ isOpen, updatePermissions, modifyProfile, userModify, ingredientForm }, dispatch] = useReducer(reducer, initialState);

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

    return (
        <RightSidebarContext.Provider value={{
            isOpen,
            updatePermissions,
            modifyProfile,
            userModify,
            ingredientForm,
            openModifyProfile,
            openUpdatePermissions,
            closeRightSidebar,
            openIngredientModify
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