import Help from '../Components/Help';
import MainButton from '../Components/MainButton';
import styles from './SearchRecipes.module.css';
import tempImage from '../assets/manzana_test.png';
import CategoriaSlider from '../Components/CategoriaSlider';
import { useEffect, useState } from 'react';
import FilterForm from '../Components/FilterForm';
import Recipe from '../Components/Recipe';
import OptionButton from '../Components/OptionButton';
import Pagination from '../Components/Pagination';
import { useRightSidebar } from '../context/RightSidebarProvider';
import backendAPI from '../api/axiosConfig';
import closeSVG from '../assets/Iconos/close.svg'
import { ReactSVG } from 'react-svg';
import FondoPavlova from '../Components/FondoPavlova';
import { useUpdateData } from '../context/UpdateDataProvider';
import { FadeLoader } from 'react-spinners';
import { useAuth } from '../context/AuthProvider';

export default function SearchRecipes(){

    const { openRecipesAdvanceFilters } = useRightSidebar();

    const [ activeCategoria, setActiveCategoria ] = useState('');
    const [ etiquetasOptions, setEtiquetasOptions ] = useState([]);
    const [ categoriasOptions, setCategoriasOptions ] = useState([]);
    const [ removeFilters, setRemoveFilters ] = useState(false);
    const [ recipes, setRecipes ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ nextPage, setNextPage ] = useState(null);
    const [ previousPage, setPreviousPage ] = useState(null);
    const [ count, setCount ] = useState(0);
    const [ currentPage, setCurrentPage ] = useState(1);
    const { recipeFilters: advanceFilters, resetRecipeFilters } = useUpdateData();
    const { refreshAccessToken } = useAuth();

    const [ recipeFilters, setRecipeFilters ] = useState({
        nombre: name != null ? name : "",
        nombre_usuario: "",
        tipoUsuario: "Todos"
    });

    const [ searchOption, setSearchOption ] = useState('Categorias');
      
    const filterOptions = [
        { type: "text", name: "nombre", placeholder: "Filtrar por nombre..."},
        { type: "text", name: "nombre_usuario", placeholder: "Filtrar por nombre del creador..."},
        { type: "select", name: "tipoUsuario", defaultOption: "Todos", options: ["Todos", "Usuarios", "Moderadores", "Administradores"]}
    ]

    const searchOptions = [
        { type: 'Categorias', icon: 'bookmarks', label: 'Categorias' },
        { type: 'Filtros', icon: 'restaurant', label: 'Filtros' }
    ];

    useEffect(() => {
        setLoading(true);
        const obtenerInformacion = async () => {
            try{
                const etiquetas = await backendAPI.get("/etiquetas/all");
                const categorias = await backendAPI.get("/categorias/all");
                setEtiquetasOptions(etiquetas.data);
                setCategoriasOptions(categorias.data);
                const response = await getRecipes();
                setRecipes(response.data.results);
            } catch(error){
                if(error.response?.status == 401){
                    await refreshAccessToken(getRecipes);
                }
            } finally{
                setLoading(false);
            }
        }
        obtenerInformacion(); 
    }, []);

    const getRecipes = async (previous = null, next = null, noFilters = false) => {
        setLoading(true);
        try{
            let url = previous 
            ? previous.split('app')[1] 
            : next 
            ? next.split('app')[1] 
            : `/recetas/`;

            if(!noFilters){
                const params = new URLSearchParams();

                Object.keys(recipeFilters).forEach(filter => {
                    if(filter == 'tipoUsuario'){
                        recipeFilters[filter] != 'Todos' && (params.append(`${filter}`, recipeFilters[filter]));
                    } else{
                        recipeFilters[filter] != '' && (params.append(`${filter}`, recipeFilters[filter]));
                    }
                });        
                activeCategoria != "" && params.append('categoria', activeCategoria);
                advanceFilters.tiempo_preparacion != 360 && params.append('tiempo_preparacion', advanceFilters.tiempo_preparacion);
                advanceFilters.tiempo_coccion != 360 && params.append('tiempo_coccion', advanceFilters.tiempo_preparacion);;
                advanceFilters.rating != 0 && params.append('rating', advanceFilters.rating);
                advanceFilters.show_recipes_score != 'Todas' && params.append('recipes_score_visibility', advanceFilters.show_recipes_score.replaceAll(' ', '_'));
                advanceFilters.selected_etiquetas.length != 0 && advanceFilters.selected_etiquetas.map(etiqueta => params.append('etiquetas', etiqueta));

                // Append query parameters if they exist
                if (params.toString()) {
                    url += `?${params.toString()}`;
                }
            }
            console.log(url);
            const response = await backendAPI(url);
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

    const openAdvanceFilters = () => {
        openRecipesAdvanceFilters({
            etiquetas: etiquetasOptions
        });
    }

    const deleteFilters = async () => {
        setRecipeFilters({
            nombre: "",
            correo: "",
            tipoUsuario: "Todos"
        });
        setActiveCategoria('');
        resetRecipeFilters();
        await getRecipes(null, null, true);
    }

    useEffect(() => {
        const triggerUpdateRecipes = async () => {
            await getRecipes();
        }
        triggerUpdateRecipes();
    }, [ activeCategoria, advanceFilters ]);

    useEffect(() => {
        let isFilterActive = false;
        Object.keys(recipeFilters).forEach(filter => {
            if(filter == 'tipoUsuario'){
                recipeFilters[filter] != 'Todos' && (isFilterActive = true);
            } else{
                recipeFilters[filter] != '' && (isFilterActive = true);
            }
        });
        activeCategoria != "" && (isFilterActive = true);
        advanceFilters.tiempo_preparacion != 360 && (isFilterActive = true);
        advanceFilters.tiempo_coccion != 360 && (isFilterActive = true);
        advanceFilters.rating != 0 && (isFilterActive = true);
        advanceFilters.show_recipes_score != 'Todas' && (isFilterActive = true);
        advanceFilters.selected_etiquetas.length != 0 && (isFilterActive = true);
        if(isFilterActive){
            setRemoveFilters(true);
        } else{
            setRemoveFilters(false);
        }
    }, [recipeFilters, activeCategoria, advanceFilters])
    
    return(
        <>
            <FondoPavlova/>
            <Help title={"Buscar recetas."} description={"Encuentra tu siguiente receta favorita."}>
                <div className={styles.filterOptionsContainer}>
                    <div className={styles.filterOptions}>
                        {removeFilters && <div onClick={() => deleteFilters()} className={styles.closeFilters}><ReactSVG src={closeSVG}/></div>}
                        { searchOptions.map(option => <OptionButton key={option.label} option={option} active={searchOption} setData={setSearchOption} icon={option.icon} makeRowOnMobile={false}/>)}
                    </div>
                    <MainButton action={openAdvanceFilters} disabled={false} type={'button'} icon={"filter-circle"} iconSize={"2.5"} fontSize={"2"} color={"primary"} borderRadius={'1'} text={"Filtros avanzados"}/>
                </div>
            </Help>
            <div className={styles.searchRecipesContainer}>
                {searchOption == "Filtros" && <FilterForm setCurrentPage={setCurrentPage} action={getRecipes} filterOptions={filterOptions} data={recipeFilters} setData={setRecipeFilters}/> }
                {searchOption == "Categorias" && <CategoriaSlider categorias={categoriasOptions} setActiveCategoria={setActiveCategoria} activeCategoria={activeCategoria} isFilter={true}/>}
                { loading 
                ? <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>
                : recipes.length == 0 
                ? <p className={styles.usersNotFound}>No se encontraron clasificaciones con los filtros colocados, prueba modificando los filtros</p>
                : <><div className="recipesContent">
                    {recipes.map(recipe => <Recipe cristal={true} recipe={recipe}/>)}
                </div>
                <div className='mobileSpace'>
                    <Pagination               
                        action={getRecipes}
                        next={nextPage} 
                        previous={previousPage} 
                        count={count} 
                        currentPage={currentPage} 
                        text="Mostrando Recetas {start}-{end} de {count}"
                    />
                </div></>}
            </div>
        </>
    )
}