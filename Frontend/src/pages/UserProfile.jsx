import { useNavigate, useParams } from 'react-router-dom';
import Help from '../Components/Help';
import MainButton from '../Components/MainButton';
import RecipesProfile from '../Components/RecipesProfile';
import UserDetails from '../Components/UserDetails';
import { useRightSidebar } from '../context/RightSidebarProvider';
import styles from './UserProfile.module.css';
import { useEffect, useState } from 'react';
import NotFound404 from '../pages/NotFound404'
import backendAPI from '../api/axiosConfig';
import { FadeLoader } from 'react-spinners';
import { useAuth } from '../context/AuthProvider';

export default function UserProfile(){
    const navigate = useNavigate();
    let { user_id } = useParams();
    const { refreshAccessToken } = useAuth();
    const [ user, setUser ] = useState({});
    const [ loading, setLoading ] = useState(true);
    const [ errorPage, setErrorPage ] = useState(false);

    useEffect(() => {
        const getUserProfile = async () => {
            try{
                const userData = await backendAPI(`/user/${user_id}/`);
                setUser({
                    nombre: userData.data.name, 
                    email: userData.data.email, 
                    pais: userData.data.country, 
                    sobreMi: userData.data.about, 
                    fotoPerfil: userData.data.profile_picture,
                    redFacebook: userData.data.social_facebook,
                    redYoutube: userData.data.social_youtube,
                    redTwitter: userData.data.social_twitter
                });
                console.log(userData);
            } catch(error){
                if(error.response?.status == 401){
                    await refreshAccessToken(getUserProfile);
                } else{
                    setErrorPage(true);
                }
            } finally{
                setLoading(false);
            }
        }
        getUserProfile();
    }, []);

    const volver = () => {
        navigate(-1);
    }

    if(errorPage) return <NotFound404 text='No se encontro el usuario que buscabas.'/>

    return(
        <>
            { loading
            ? <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>
            :<><Help title={`Perfil de ${user?.nombre?.split(' ')[0]}`} description={"Aqui puedes ver los detalles de este usuario"}>
                <MainButton action={volver} disabled={false} type={'button'} icon={"arrow-back"} iconSize={"2.5"} fontSize={"2"} color={"primary"} borderRadius={'1'} text={"Volver"}/>
            </Help>
            <div className={styles.profileCurrentUser}>
                <UserDetails usuario={user}/>
                <RecipesProfile/>
            </div></>
            }
            <div className='mobileSpace'></div>
        </>
    )
}