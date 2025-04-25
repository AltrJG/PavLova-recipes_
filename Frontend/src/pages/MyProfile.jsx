import Help from '../Components/Help';
import MainButton from '../Components/MainButton';
import RecipesProfile from '../Components/RecipesProfile';
import UserDetails from '../Components/UserDetails';
import { useRightSidebar } from '../context/RightSidebarProvider';
import styles from './MyProfile.module.css';

export default function MyProfile(){
    const { openModifyProfile } = useRightSidebar();

    return(
        <>
            <Help title={"Mi Perfil"} description={"Aqui puedes ver los detalles de tu perfil"}>
                <MainButton action={openModifyProfile} disabled={false} type={'button'} icon={"settings"} iconSize={"2.5"} fontSize={"2"} color={"primary"} borderRadius={'1'} text={"Cambiar Informacion"}/>
            </Help>
            <div className={styles.profileCurrentUser}>
                <UserDetails/>
                <RecipesProfile/>
            </div>
            <div className='mobileSpace'></div>
        </>
    )
}