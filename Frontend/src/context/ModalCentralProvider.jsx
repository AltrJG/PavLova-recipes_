import { createContext, useContext, useReducer } from "react";

const ModalCentralContext = createContext();

const initialState = {
    isOpen: false,
    permissionManager: false,
    userModify: {},
}

function reducer(state, action){
    switch(action.type){
        case 'modalCentral/open':
            return { ...state, isOpen: true }
        case 'modalCentral/close':
            return { ...state, isOpen: false }
        case 'modalCentral/openPermissionManager':
            return { ...state, isOpen: true, permissionManager: true, userModify: action.payload}
        }
}

const ModalCentralProvider = ({ children }) => {
    const [{ 
        isOpen,
        permissionManager
    }, dispatch] = useReducer(reducer, initialState);

    function openModalCentral(){
        dispatch({type: 'modalCentral/open'});
    }

    function closeModalCentral(){
        dispatch({type: 'modalCentral/close'});
    }

    function openPermissionManager(user){
        dispatch({type: 'modalCentral/openPermissionManager', payload: user});
    }

    return (
        <ModalCentralContext.Provider value={{
            isOpen,
            permissionManager,
            openModalCentral,
            closeModalCentral,
            openPermissionManager,
        }}>
            {children}
        </ModalCentralContext.Provider>
    );
}

function useModalCentral(){
    const context = useContext(ModalCentralContext);
    if(context === undefined) throw new Error('ModalCentralContext was used outside the ModalCentralContext');
    return context;
}

export { ModalCentralProvider, useModalCentral}