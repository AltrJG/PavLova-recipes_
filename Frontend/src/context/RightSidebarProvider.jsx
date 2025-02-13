import { createContext, useContext, useReducer } from "react";


const RightSidebarContext = createContext();

const initialState = {
    isOpen: false,
    updatePermissions: false,
    modifyProfile: false
}

function reducer(state, action){
    switch(action.type){
        case 'rightSidebar/open':
            return { ...state, isOpen: true }
        case 'rightSidebar/close':
            return { ...state, isOpen: false }
        case 'rightSidebar/openModifyProfile':
            return { ...state, modifyProfile: true, updatePermissions: false }
        case 'rightSidebar/openUpdatePermissions':
            return { ...state, modifyProfile: false, updatePermissions: true }
    }
}

const RightSidebarProvider = ({ children }) => {
    const [{ isOpen, updatePermissions, modifyProfile }, dispatch] = useReducer(reducer, initialState);

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

    function openUpdatePermissions(){
        openRightSidebar();
        dispatch({type: 'rightSidebar/openUpdatePermissions'});
    }

    return (
        <RightSidebarContext.Provider value={{
            isOpen,
            updatePermissions,
            modifyProfile,
            openModifyProfile,
            openUpdatePermissions,
            closeRightSidebar,
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