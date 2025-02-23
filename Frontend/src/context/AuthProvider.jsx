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
                    nombre: action.payload.nombre, 
                    email: state.user.email, 
                    pais: action.payload.pais, 
                    sobreMi: action.payload.about_me, 
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
            const response = await backendAPI.post('/auth/login/', { email: email, password });
            dispatch({type: 'auth/addAccessToken', payload: response.data.access});
        } catch(error){
            throw new Error(error.response.data.error);
        }
    }

    const register = async (nombre, email, password) => {
        try{
            await backendAPI.post('/auth/register/', { nombre, correo: email, password });
        } catch(error){
            throw new Error(error.response.data.error);
        }
    }

    const getUserData = async () => {
        try{
            const response = await backendAPI.get('/user/details/');
            dispatch({type: 'auth/addUserData', payload: response.data});
        } catch(error){
            console.log(error);
            if(error.response?.status == 401){
                await refreshAccessToken(getUserData);
            }
        }
    }

    const changeUserData = async userData => {
        dispatch({type: 'auth/changeUserData', payload: userData});
    }

    const refreshAccessToken = async (callback = null, ...callbackArgs) => {
        try {
            const response = await backendAPI.post('/token/refresh/');
            dispatch({ type: 'auth/addAccessToken', payload: response.data.access });
            if (callback && typeof callback === "function") {
                pendingCallback.current = { callback, args: callbackArgs };
            }
        } catch (error) {
            console.log("Refresh token failed", error);
            dispatch({ type: 'auth/Logout' }); // Logout if refresh fails
        }
    };

    const logout = async () => {
        try {
            await backendAPI.post('/auth/logout/');
            dispatch({ type: 'auth/Logout' }); 
        } catch (error) {
            console.log(error);
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
            await refreshAccessToken(getUserData);
            dispatch({type: 'auth/loadFinished'});
        }
        runRefreshToken();
    }, []);

    useEffect(() => {
        if (accessToken) {
            backendAPI.defaults.headers.Authorization = `Bearer ${accessToken}`;
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