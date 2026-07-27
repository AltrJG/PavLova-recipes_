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
    permissions: {
        "admin.add_logentry": false,
        "admin.change_logentry": false,
        "admin.delete_logentry": false,
        "admin.view_logentry": false,
        "auth.add_group": false,
        "auth.add_permission": false,
        "auth.change_group": false,
        "auth.change_permission": false,
        "auth.delete_group": false,
        "auth.delete_permission": false,
        "auth.view_group": false,
        "auth.view_permission": false,
        "contenttypes.add_contenttype": false,
        "contenttypes.change_contenttype": false,
        "contenttypes.delete_contenttype": false,
        "contenttypes.view_contenttype": false,
        "ingredients.add_ingrediente": false,
        "ingredients.add_porcioningrediente": false,
        "ingredients.change_ingrediente": false,
        "ingredients.change_porcioningrediente": false,
        "ingredients.delete_ingrediente": false,
        "ingredients.delete_porcioningrediente": false,
        "ingredients.view_ingrediente": false,
        "ingredients.view_porcioningrediente": false,
        "sessions.add_session": false,
        "sessions.change_session": false,
        "sessions.delete_session": false,
        "sessions.view_session": false,
        "token_blacklist.add_blacklistedtoken": false,
        "token_blacklist.add_outstandingtoken": false,
        "token_blacklist.change_blacklistedtoken": false,
        "token_blacklist.change_outstandingtoken": false,
        "token_blacklist.delete_blacklistedtoken": false,
        "token_blacklist.delete_outstandingtoken": false,
        "token_blacklist.view_blacklistedtoken": false,
        "token_blacklist.view_outstandingtoken": false,
        "users.add_emailchangerequest": false,
        "users.add_profilepicture": false,
        "users.add_profilepicturejob": false,
        "users.add_user": false,
        "users.add_usersociallink": false,
        "users.change_emailchangerequest": false,
        "users.change_profilepicture": false,
        "users.change_profilepicturejob": false,
        "users.change_user": false,
        "users.change_usersociallink": false,
        "users.delete_emailchangerequest": false,
        "users.delete_profilepicture": false,
        "users.delete_profilepicturejob": false,
        "users.delete_user": false,
        "users.delete_usersociallink": false,
        "users.view_admin_fields": false,
        "users.view_emailchangerequest": false,
        "users.view_profilepicture": false,
        "users.view_profilepicturejob": false,
        "users.view_user": false,
        "users.view_usersociallink": false
    },
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
        case 'auth/addUserPermissions':
            const userPermissions = action.payload || [];
            const userPermissionsSet = new Set(userPermissions);

            const updatedPermissions = Object.keys(state.permissions).reduce((acc, permKey) => {
                acc[permKey] = userPermissionsSet.has(permKey);
                return acc;
            }, {});

            console.log()

            return {
                ...state,
                accessToken: action.payload.accessToken || action.payload,
                isAuthenticated: true,
                permissions: updatedPermissions
            };
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
    const [{ user, isLoading, accessToken, isAuthenticated, isStaff, isSuperUser, permissions }, dispatch] = useReducer(reducer, initialState);

    const login = async (email, password) => {
        try{
            const response = await backendAPI.post('/auth/', { email: email, password });
            dispatch({type: 'auth/addAccessToken', payload: response.data.access});
        } catch(error){
            throw new Error(error.response.data.detail);
        }
    }

    const register = async (nombre, email, password) => {
        try{
            await backendAPI.post('/users/', { username: nombre, email, password });
        } catch(error){
            const errors = error.response?.data;

            const firstError = Object.values(errors)[0]?.[0] || "Ocurrio un error inesperado.";

            throw new Error(firstError);
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

    const getUserPermissions = async () => {
        dispatch({type: 'auth/isLoading'});
        try{
            const response = await backendAPI.get('/users/me/context/');
            dispatch({type: 'auth/addUserPermissions', payload: response.data.permissions ?? []});
        } catch(error){
            if(error.response?.status == 401){
                await refreshAccessToken(getUserPermissions);
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
            await getUserPermissions();
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
            permissions,
            changeUserData,
            logout,
            login,
            register,
            getUserData,
            getUserPermissions,
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