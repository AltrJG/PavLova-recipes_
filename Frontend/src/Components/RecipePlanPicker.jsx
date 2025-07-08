import { useState, useEffect } from 'react';
import Help from './Help';
import styles from './RecipePlanPicker.module.css';
import FilterForm from './FilterForm';
import Recipe from './Recipe';
import MainButton from './MainButton';
import OptionButton from './OptionButton';
import Pagination from './Pagination';
import { useAuth } from '../context/AuthProvider';
import { FadeLoader } from 'react-spinners';
import backendAPI from '../api/axiosConfig';

export default function RecipePlanPicker({updateRecipes, currentProportions, activeRecipes, setProportions, setActiveRecipes, activePicker, setActivePicker}){
    const [ loading, setLoading ] = useState(true);
    const [ triggerUpdateData, setTriggerUpdateData ] = useState(false);
    const [ nextPage, setNextPage ] = useState(null);
    const [ previousPage, setPreviousPage ] = useState(null);
    const [ count, setCount ] = useState(0);
    const [ currentPage, setCurrentPage ] = useState(1);
    const { refreshAccessToken, isSuperUser, isStaff, user } = useAuth();
    const [ recipes, setRecipes ] = useState([]);
    const [ selectedRecipes, setSelectedRecipes ] = useState([]);

    const [ searchOption, setSearchOption ] = useState('mis-recetas');

    const [ recipeFilters, setRecipeFilters ] = useState({
        nombre: "",
        nombre_usuario: "",
        rating: ''
    });
      
    const filterOptions = [
        { type: "text", name: "nombre", placeholder: "Filtrar por nombres..."},
        { type: "text", name: "nombre_usuario", placeholder: "Filtrar por nombre de creador..."},
        { type: "number", name: "rating", placeholder: "Calificacion minima...", minNumber: 0, maxNumber: 5}
    ]

    const searchOptions = [
        { type: 'favoritos', icon: 'heart', label: 'Favoritos' },
        { type: 'mis-recetas', icon: 'restaurant', label: 'Mis Recetas' }
    ];

    const getRecipes = async (previous = null, next = null) => {
        setLoading(true);
        try{
            let url = previous 
            ? previous.split('app')[1] 
            : next 
            ? next.split('app')[1] 
            : `${searchOption == 'mis-recetas' ? '/recetas' : ''}/${searchOption}${searchOption == 'favoritos' ? "/mis-favoritos/" : ''}`;

            const params = new URLSearchParams();

            if (recipeFilters.nombre.trim() && previous == null && next == null) params.append("nombre", recipeFilters.nombre);
            if (recipeFilters.nombre_usuario.trim() && previous == null && next == null) params.append("nombre_usuario", recipeFilters.nombre_usuario);
            if (!isNaN(recipeFilters.rating) && recipeFilters.rating > 0 && recipeFilters.rating <= 5 && previous == null && next == null) params.append("rating", recipeFilters.rating);

            // Append query parameters if they exist
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            const response = await backendAPI(url);
            console.log(response);
            previous != null && setCurrentPage(currentPage-1);
            next != null && setCurrentPage(currentPage+1);
            setCount(response.data.count);
            setNextPage(response.data.next);
            setPreviousPage(response.data.previous);
            setRecipes(response.data.results);
        } catch(error){
            if(error.response?.status == 401){
                await refreshAccessToken(getRecipes);
            }
        } finally{
            setLoading(false);
        }
    }

    const handleActiveRecipes = async () => {
        let proportions = selectedRecipes.reduce((acc, selectedRecipe) => {
            console.log(selectedRecipe);
            if (selectedRecipe['id'] !== undefined && selectedRecipe['porciones'] !== undefined) {
                acc[(selectedRecipe['id'])] = { value: currentProportions[selectedRecipe['id']]?.value ?? 1, wasUpdated: false };
            }
            return acc;
        }, {});
        setActiveRecipes(selectedRecipes);
        setProportions(proportions);
        setActivePicker(false);
        setTriggerUpdateData(true);
    }

    const handleSelectedRecipes = recipe => {
        setSelectedRecipes(() => {
          const index = selectedRecipes.findIndex(item => item.id === (recipe?.receta || recipe?.id));
          let fixedRecipe = recipe;
          if(searchOption == 'favoritos'){
            fixedRecipe = {
                id: recipe.receta,
                nombre: recipe.receta_nombre,
                frase: recipe.frase,
                procedimiento: recipe.procedimiento,
                porciones: recipe.porciones,
                foto_receta: recipe.receta_imagen_url,
                tiempo_preparacion: recipe.receta_tiempo_preparacion,
                tiempo_coccion: recipe.receta_tiempo_coccion,
                visibilidad: recipe.visibilidad,
                visibilidad_estado: recipe.visibilidad_estado,
                categoria_info: {
                    nombre: recipe.receta_categoria
                },
                ingredientes: recipe.ingredientes,
                creador_info: {
                    name: recipe.creador_nombre
                },
                rating_promedio: recipe.receta_rating_promedio
            }
          }
          if(index === -1) {
              return [...selectedRecipes, fixedRecipe];
          } else {
              return selectedRecipes.filter(item => item.id !== fixedRecipe.id);
          }
      });
    }

    useEffect(() => {
        getRecipes();
    }, [searchOption]);

    useEffect(() => {
        if(activePicker){
            setSelectedRecipes(activeRecipes);
        }
    }, [activePicker]);

    useEffect(() => {
        updateRecipes(selectedRecipes);
        setTriggerUpdateData(false);
    }, [triggerUpdateData]);
    
    return(
        <>
            <div className={`${styles.darkenedBack} ${activePicker ? styles.activeDarkenedBack : ""}`}></div>
            <div onClick={() => setActivePicker(false)} className={`${styles.rightSidebarClose} ${activePicker ? styles.activeClose : ""}`}>X</div>
            <div className={`${styles.recipePickerContainer} ${activePicker ? styles.activePicker : ""}`}>
            <Help title={"Elegir Recetas"} description={"Elige entre tus recetas seleccionadas"}>
                <div className={styles.filterOptionsContainer}>
                    <div className={styles.filterOptions}>
                        { searchOptions.map(option => <OptionButton key={option.label} option={option} active={searchOption} setData={setSearchOption} icon={option.icon} makeRowOnMobile={false}/>)}
                    </div>
                    <MainButton action={handleActiveRecipes} disabled={false} type={'button'} icon={"save"} iconSize={"2.1"} fontSize={"1.8"} color={"primary"} borderRadius={'1'} text={"Guardar Cambios."}/>
                </div>
            </Help>
            <div className={styles.recipePicker}>
                <FilterForm setCurrentPage={setCurrentPage} action={getRecipes} filterOptions={filterOptions} data={recipeFilters} setData={setRecipeFilters}/>
                {loading 
                ? <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>
                : recipes.length == 0 
                ? <p className={styles.usersNotFound}>No se encontraron recetas con los filtros colocados, prueba modificando los filtros</p> 
                : <><div className="recipesContent">
                    { recipes.map(recipe => <Recipe activeRecipes={selectedRecipes} recipePickerAction={handleSelectedRecipes} recipePickerActive={true} canUserViewVisibility={searchOption == 'mis-recetas'} isSuperUser={isSuperUser} isStaff={isStaff} user={user} cristal={false} key={recipe.id} recipe={recipe} isModificationAllowed={false}/>) }
                </div>
                <div>
                    <Pagination
                        action={getRecipes}
                        resultsPerPage={10}              
                        next={nextPage} 
                        previous={previousPage} 
                        count={count} 
                        currentPage={currentPage} 
                        text="Mostrando Recetas {start}-{end} de {count}"
                    />
                </div></>}
                </div>
            </div>
        </>
    )
}