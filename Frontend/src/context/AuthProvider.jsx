import { createContext, useContext, useEffect, useReducer, useRef } from "react";
import { data, useNavigate } from "react-router-dom";
import backendAPI from "../api/axiosConfig";
import Swal from "sweetalert2";

const AuthContext = createContext();

const initialState = {
    user: {},
    isLoading: true,
    accessToken: '',
    isAuthenticated: false,
    isStaff: false,
    isSuperUser: false,
}

function reducer(state, action){
    switch(action.type){
        case 'auth/isLoading':
            return { ...state, isLoading: true };
        case 'auth/loadFinished':
            return { ...state, isLoading: false };
        case 'auth/addAccessToken':
            return { ...state, accessToken: action.payload, isAuthenticated: true };
        case 'auth/addUserData':
            return { ...state, user: 
                {
                    id: action.payload.id,
                    nombre: action.payload.username, 
                    email: action.payload.email, 
                    pais: action.payload.country, 
                    sobreMi: action.payload.about, 
                    fotoPerfil: action.payload.profile_picture,
                    redFacebook: action.payload.social_facebook,
                    redYoutube: action.payload.social_youtube,
                    redTwitter: action.payload.social_twitter
                }, isStaff: action.payload.is_staff, isSuperUser: action.payload.is_superuser};
        case 'auth/changeUserData':
            return{ ...state, user: 
                {
                    id: state.user.id,
                    nombre: action.payload.username, 
                    email: state.user.email, 
                    pais: action.payload.country, 
                    sobreMi: action.payload.about, 
                    redFacebook: action.payload.facebook_link,
                    fotoPerfil: state.user.fotoPerfil,
                    redYoutube: action.payload.youtube_link,
                    redTwitter: action.payload.twitter_link
                }};
        case 'auth/Logout':
            return { ...state, user: {}, isAuthenticated: false, isStaff: false, isSuperUser: false, accessToken: ''};
    }
}


const AuthProvider = ({ children }) => {
    const pendingCallback = useRef(null);
    const [{ user, isLoading, accessToken, isAuthenticated, isStaff, isSuperUser }, dispatch] = useReducer(reducer, initialState);

    const login = async (email, password) => {
        try{
            const response = await backendAPI.post('/auth/', { email: email, password });
            dispatch({type: 'auth/addAccessToken', payload: response.data.access});
        } catch(error){
            throw new Error(error.response.data.error);
        }
    }

    const register = async (nombre, email, password) => {
        try{
            await backendAPI.post('/users/', { username: nombre, email, password });
        } catch(error){
            throw new Error(error.response.data.error);
        }
    }

    const getUserData = async () => {
        dispatch({type: 'auth/isLoading'});
        try{
            const response = await backendAPI.get('/users/me/');
            dispatch({type: 'auth/addUserData', payload: response.data});
        } catch(error){
            if(error.response?.status == 401){
                await refreshAccessToken(getUserData);
            }
        } finally{
            dispatch({type: 'auth/loadFinished'});
        }
    }

    const changeUserData = async userData => {
        dispatch({type: 'auth/changeUserData', payload: userData});
    }

    const refreshAccessToken = async (callback = null, ...callbackArgs) => {
        dispatch({type: 'auth/isLoading'});
        try {
            const response = await backendAPI.post('/auth/refresh/');
            dispatch({ type: 'auth/addAccessToken', payload: response.data.access });
            if (callback && typeof callback === "function") {
                pendingCallback.current = { callback, args: callbackArgs };
            }
        } catch (error) {
            dispatch({ type: 'auth/Logout' }); // Logout if refresh fails
        } finally{
            dispatch({type: 'auth/loadFinished'});
        }
    };

    const logout = async () => {
        try {
            await backendAPI.post('/auth/logout/');
            dispatch({ type: 'auth/Logout' }); 
        } catch (error) {
            
        }
        dispatch({ type: 'auth/Logout' });
        Swal.fire({
            icon: "success",
            title: "Sesion Cerrada",
            text: 'Has Cerrado Tu sesion',
            showConfirmButton: true,
            customClass: {
                title: "swal_title",
                icon: "swal_icon",
                htmlContainer: "swal_text",
                confirmButton: "swal_confirm"
            }
        });
    };

    useEffect(() => {
        dispatch({type: 'auth/isLoading'});
        const runRefreshToken = async () => {
            await refreshAccessToken();
            await getUserData();
            dispatch({type: 'auth/loadFinished'});
        }
        runRefreshToken();
    }, []);

    useEffect(() => {
        if (accessToken) {
            if (pendingCallback.current) {
                const { callback, args } = pendingCallback.current;
                callback(...args);
                pendingCallback.current = null;
            }
        } else {
            delete backendAPI.defaults.headers.Authorization;
        }
    }, [accessToken]);
    
    return(
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isSuperUser,
            isStaff,
            isLoading,
            changeUserData,
            logout,
            login,
            register,
            getUserData,
            refreshAccessToken
        }}>
            { children }
        </AuthContext.Provider>
    )
}

function useAuth(){
    const context = useContext(AuthContext);
    if(context === undefined) throw new Error('AuthContext was used outside the AuthProvider');
    return context;
}

export { useAuth, AuthProvider };