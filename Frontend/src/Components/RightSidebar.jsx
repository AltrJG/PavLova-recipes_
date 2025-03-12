import { useRightSidebar } from '../context/RightSidebarProvider';
import ChangeProfileForm from './ChangeProfileForm';
import ChangeUserPermissions from './ChangeUserPermissions';
import IngredientsForm from './IngredientsForm';
import styles from './RightSidebar.module.css';

export default function RightSidebar(){

    const { isOpen, closeRightSidebar, modifyProfile, updatePermissions, ingredientForm } = useRightSidebar();

    return(
        <>
            <div className={`${styles.rightSidebarContainer} ${isOpen ? styles.rightSidebarOpen : ""}`}>
                {modifyProfile && <ChangeProfileForm/>}
                {updatePermissions && <ChangeUserPermissions/>}
                {ingredientForm && <IngredientsForm/>}
            </div>
            <div onClick={closeRightSidebar} className={`${styles.rightSidebarFilter} ${isOpen ? styles.rightSidebarFilterOpen : ""}`}></div>
            <div className={`${styles.rightSidebarClose} ${isOpen ? styles.rightSidebarCloseActive : ""}`} onClick={closeRightSidebar}>X</div>
        </>
    )
}