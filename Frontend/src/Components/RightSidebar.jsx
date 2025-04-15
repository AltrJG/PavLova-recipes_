import { useRightSidebar } from '../context/RightSidebarProvider';
import ChangeProfileForm from './ChangeProfileForm';
import ChangeUserPermissions from './ChangeUserPermissions';
import EtiquetaCategoriaForm from './EtiquetaCategoriaForm';
import IngredientsForm from './IngredientsForm';
import styles from './RightSidebar.module.css';

export default function RightSidebar(){

    const { isOpen, closeRightSidebar, modifyProfile, updatePermissions, ingredientForm, categoriaEtiquetaForm } = useRightSidebar();

    return(
        <>
            <div className={`${styles.rightSidebarContainer} ${isOpen ? styles.rightSidebarOpen : ""}`}>
                {modifyProfile && <ChangeProfileForm/>}
                {updatePermissions && <ChangeUserPermissions/>}
                {ingredientForm && <IngredientsForm/>}
                {categoriaEtiquetaForm && <EtiquetaCategoriaForm/>}
            </div>
            <div onClick={closeRightSidebar} className={`${styles.rightSidebarFilter} ${isOpen ? styles.rightSidebarFilterOpen : ""}`}></div>
            <div className={`${styles.rightSidebarClose} ${isOpen ? styles.rightSidebarCloseActive : ""}`} onClick={closeRightSidebar}>X</div>
        </>
    )
}