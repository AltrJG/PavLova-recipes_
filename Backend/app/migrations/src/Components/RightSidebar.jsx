import { useRightSidebar } from '../context/RightSidebarProvider';
import AIForm from './AIForm';
import AIFormSettings from './AIFormSettings';
import ChangeProfileForm from './ChangeProfileForm';
import ChangeUserPermissions from './ChangeUserPermissions';
import ChangeVisibilityForm from './ChangeVisibilityForm';
import EtiquetaCategoriaForm from './EtiquetaCategoriaForm';
import HealthScoreForm from './HealthScoreForm';
import IngredientsForm from './IngredientsForm';
import ObjectivesForm from './ObjectivesForm';
import RecipeAdvanceFilters from './RecipeAdvanceFilters';
import styles from './RightSidebar.module.css';

export default function RightSidebar(){

    const { 
        isOpen, 
        closeRightSidebar, 
        modifyProfile, 
        updatePermissions, 
        ingredientForm, 
        categoriaEtiquetaForm, 
        nutritionalObjectivesForm, 
        recipeAdvanceFiltersForm, 
        aiForm, 
        aiFormSettings, 
        changeVisibilityForm,
        healthScoreForm } = useRightSidebar();

    return(
        <>
            <div className={`${styles.rightSidebarContainer} ${isOpen ? styles.rightSidebarOpen : ""}`}>
                {modifyProfile && <ChangeProfileForm/>}
                {updatePermissions && <ChangeUserPermissions/>}
                {ingredientForm && <IngredientsForm/>}
                {categoriaEtiquetaForm && <EtiquetaCategoriaForm/>}
                {nutritionalObjectivesForm && <ObjectivesForm/>}
                {recipeAdvanceFiltersForm && <RecipeAdvanceFilters/>}
                {aiForm && <AIForm/>}
                {aiFormSettings && <AIFormSettings/>}
                {changeVisibilityForm && <ChangeVisibilityForm/>}
                {healthScoreForm && <HealthScoreForm/>}
            </div>
            <div onClick={closeRightSidebar} className={`${styles.rightSidebarFilter} ${isOpen ? styles.rightSidebarFilterOpen : ""}`}></div>
            <div className={`${styles.rightSidebarClose} ${isOpen ? styles.rightSidebarCloseActive : ""}`} onClick={closeRightSidebar}>X</div>
        </>
    )
}