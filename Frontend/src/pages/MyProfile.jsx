import { useEffect, useState } from 'react';
import Help from '../Components/Help';
import MainButton from '../Components/MainButton';
import RecipesProfile from '../Components/RecipesProfile';
import UserDetails from '../Components/UserDetails';
import { useAuth } from '../context/AuthProvider';
import { useRightSidebar } from '../context/RightSidebarProvider';
import styles from './MyProfile.module.css';
import backendAPI from '../api/axiosConfig';
import { FadeLoader } from 'react-spinners';

export default function MyProfile(){
    const { openModifyProfile } = useRightSidebar();
    const { user, refreshAccessToken } = useAuth();
    const [ totalCreados, setTotalCreados ] = useState(0);
    const [ totalFavoritos, setTotalFavoritos ] = useState(0);
    const [ loading, setLoading ] = useState(true);

    const getUserRecipesTotals = async () => {
        try{
            const favoriteData = await backendAPI(`/favoritos/mis-favoritos/?page_size=1`);
            const recipeData = await backendAPI(`/recetas/mis-recetas/?page_size=1`);
            setTotalFavoritos(favoriteData.data.count);
            setTotalCreados(recipeData.data.count);
        } catch(error){
            if(error.response?.status == 401){
                await refreshAccessToken(getUserRecipesTotals);
            }
        } finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        setLoading(true);
        getUserRecipesTotals();
    }, []);

    if (loading) return <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>

    return(
        <>
            <Help title={"Mi Perfil"} description={"Aqui puedes ver los detalles de tu perfil"}>
                <MainButton action={openModifyProfile} disabled={false} type={'button'} icon={"settings"} iconSize={"2.5"} fontSize={"2"} color={"primary"} borderRadius={'1'} text={"Cambiar Informacion"}/>
            </Help>
            <div className={styles.profileCurrentUser}>
                <UserDetails totalCreados={totalCreados} totalFavoritos={totalFavoritos}/>
                <RecipesProfile user_id={user?.id}/>
            </div>
            <div className='mobileSpace'></div>
        </>
    )
}