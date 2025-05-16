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

export default function SearchRecipes(){

    const { openRecipesAdvanceFilters } = useRightSidebar();

    const [ activeCategoria, setActiveCategoria ] = useState('');
    const [ etiquetasOptions, setEtiquetasOptions ] = useState([]);
    const [ categoriasOptions, setCategoriasOptions ] = useState([]);
    const [ removeFilters, setRemoveFilters ] = useState(false);
    const [ loading, setLoading ] = useState(true);
    const [ nextPage, setNextPage ] = useState(null);
    const [ previousPage, setPreviousPage ] = useState(null);
    const [ count, setCount ] = useState(0);
    const [ currentPage, setCurrentPage ] = useState(1);
    const { recipeFilters: advanceFilters, resetRecipeFilters } = useUpdateData();

    const [ recipeFilters, setRecipeFilters ] = useState({
        nombre: name != null ? name : "",
        correo: "",
        tipoUsuario: "Todos"
    });

    const [ searchOption, setSearchOption ] = useState('Categorias');
      
    const filterOptions = [
        { type: "text", name: "nombre", placeholder: "Filtrar por nombre..."},
        { type: "text", name: "correo", placeholder: "Filtrar por correo..."},
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
                const etiquetas = await backendAPI.get("/etiquetas/");
                const categorias = await backendAPI.get("/categorias/");
                setEtiquetasOptions(etiquetas.data.results);
                setCategoriasOptions(categorias.data.results);
            } catch(e){

            } finally{
                setLoading(false);
            }
        }
        obtenerInformacion(); 
    }, []);

    const getRecipes = () => {

    }

    const openAdvanceFilters = () => {
        openRecipesAdvanceFilters({
            etiquetas: etiquetasOptions
        });
    }

    const deleteFilters = () => {
        setRecipeFilters({
            nombre: "",
            correo: "",
            tipoUsuario: "Todos"
        });
        setActiveCategoria('');
        resetRecipeFilters();
    }

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
                <div className="recipesContent">
                    <Recipe/>
                    <Recipe/>
                    <Recipe/>
                    <Recipe/>
                    <Recipe/>
                    <Recipe/>
                    <Recipe/>
                    <Recipe/>
                    <Recipe/>
                    <Recipe/>
                </div>
                <div className='mobileSpace'>
                    <Pagination               
                        next={'tgwgfw'} 
                        previous={'wrw'} 
                        count={15} 
                        currentPage={5} 
                        text="Mostrando Recetas {start}-{end} de {count}"
                    />
                </div>
            </div>
        </>
    )
}