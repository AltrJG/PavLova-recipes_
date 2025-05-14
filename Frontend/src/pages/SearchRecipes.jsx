import Help from '../Components/Help';
import MainButton from '../Components/MainButton';
import styles from './SearchRecipes.module.css';
import tempImage from '../assets/manzana_test.png';
import CategoriaSlider from '../Components/CategoriaSlider';
import { useState } from 'react';
import FilterForm from '../Components/FilterForm';
import Recipe from '../Components/Recipe';
import OptionButton from '../Components/OptionButton';
import Pagination from '../Components/Pagination';
import { useRightSidebar } from '../context/RightSidebarProvider';

export default function SearchRecipes(){

    const { openRecipesAdvanceFilters } = useRightSidebar();

    const [ activeCategoria, setActiveCategoria ] = useState('');
    const [ loading, setLoading ] = useState(true);
    const [ nextPage, setNextPage ] = useState(null);
    const [ previousPage, setPreviousPage ] = useState(null);
    const [ count, setCount ] = useState(0);
    const [ currentPage, setCurrentPage ] = useState(1);

    const [ recipeFilters, setRecipeFilters ] = useState({
        nombre: name != null ? name : "",
        correo: "",
        tipoUsuario: "Todos"
    });

    const [ searchOption, setSearchOption ] = useState('Categorias');

    const datosDummy = [
        { id: 1, nombre: "Comida Frita", imagen: tempImage },
        { id: 2, nombre: "Postre", imagen: tempImage },
        { id: 3, nombre: "Arroz", imagen: tempImage },
        { id: 4, nombre: "Ensalada", imagen: tempImage },
        { id: 5, nombre: "Espagueti", imagen: tempImage },
        { id: 6, nombre: "Sopa", imagen: tempImage },
      ];
      
    const filterOptions = [
        { type: "text", name: "nombre", placeholder: "Filtrar por nombre..."},
        { type: "text", name: "correo", placeholder: "Filtrar por correo..."},
        { type: "select", name: "tipoUsuario", defaultOption: "Todos", options: ["Todos", "Usuarios", "Moderadores", "Administradores"]}
    ]

    const searchOptions = [
        { type: 'Categorias', icon: 'bookmarks', label: 'Categorias' },
        { type: 'Filtros', icon: 'restaurant', label: 'Filtros' }
    ];

    const getRecipes = () => {

    }

    const openAdvanceFilters = () => {
        openRecipesAdvanceFilters({});
    }
    
    return(
        <>
            <Help title={"Buscar recetas."} description={"Encuentra tu siguiente receta favorita."}>
                <div className={styles.filterOptionsContainer}>
                    <div className={styles.filterOptions}>
                        { searchOptions.map(option => <OptionButton key={option.label} option={option} active={searchOption} setData={setSearchOption} icon={option.icon} makeRowOnMobile={false}/>)}
                    </div>
                    <MainButton action={openAdvanceFilters} disabled={false} type={'button'} icon={"filter-circle"} iconSize={"2.5"} fontSize={"2"} color={"primary"} borderRadius={'1'} text={"Filtros avanzados"}/>
                </div>
            </Help>
            <div className={styles.searchRecipesContainer}>
                {searchOption == "Filtros" && <FilterForm setCurrentPage={setCurrentPage} action={getRecipes} filterOptions={filterOptions} data={recipeFilters} setData={setRecipeFilters}/> }
                {searchOption == "Categorias" && <CategoriaSlider categorias={datosDummy} setActiveCategoria={setActiveCategoria} activeCategoria={activeCategoria} isFilter={true}/>}
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