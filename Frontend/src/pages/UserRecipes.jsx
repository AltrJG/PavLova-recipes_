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
import { useNavigate } from 'react-router-dom';

export default function UserRecipes(){

    const [ loading, setLoading ] = useState(true);
    const [ nextPage, setNextPage ] = useState(null);
    const [ previousPage, setPreviousPage ] = useState(null);
    const [ count, setCount ] = useState(0);
    const [ currentPage, setCurrentPage ] = useState(1);

    const [ searchOption, setSearchOption ] = useState('mis_recetas');

    const navigate = useNavigate();

    const [ recipeFilters, setRecipeFilters ] = useState({
        nombre: "",
        correo: "",
        tipoUsuario: "Todos"
    });
      
    const filterOptions = [
        { type: "text", name: "nombre", placeholder: "Filtrar por nombre..."},
        { type: "text", name: "correo", placeholder: "Filtrar por correo..."},
        { type: "select", name: "tipoUsuario", defaultOption: "Todos", options: ["Todos", "Usuarios", "Moderadores", "Administradores"]}
    ]

    const searchOptions = [
        { type: 'favoritos', icon: 'heart', label: 'Favoritos' },
        { type: 'mis_recetas', icon: 'restaurant', label: 'Mis Recetas' }
    ];

    const getRecipes = () => {

    }
    
    return(
        <>
            <Help title={"Mis Recetas."} description={"Gestiona tus recetas y favoritos."}>
                <div className={styles.filterOptionsContainer}>
                    <div className={styles.filterOptions}>
                        { searchOptions.map(option => <OptionButton key={option.label} option={option} active={searchOption} setData={setSearchOption} icon={option.icon} makeRowOnMobile={false}/>)}
                    </div>
                    <MainButton action={() => navigate('/crear-receta')} disabled={false} type={'button'} icon={"restaurant"} iconSize={"2.5"} fontSize={"2"} color={"primary"} borderRadius={'1'} text={"Crear Receta"}/>
                </div>
            </Help>
            <div className={styles.searchRecipesContainer}>
                <FilterForm setCurrentPage={setCurrentPage} action={getRecipes} filterOptions={filterOptions} data={recipeFilters} setData={setRecipeFilters}/>
                <div className="recipesContent">
                    <Recipe isModificationAllowed={true}/>
                    <Recipe isModificationAllowed={true}/>
                    <Recipe isModificationAllowed={true}/>
                    <Recipe isModificationAllowed={true}/>
                    <Recipe isModificationAllowed={true}/>
                    <Recipe isModificationAllowed={true}/>
                    <Recipe isModificationAllowed={true}/>
                    <Recipe isModificationAllowed={true}/>
                    <Recipe isModificationAllowed={true}/>
                    <Recipe isModificationAllowed={true}/>
                </div>
                <Pagination               
                    next={'tgwgfw'} 
                    previous={'wrw'} 
                    count={15} 
                    currentPage={5} 
                    text="Mostrando Recetas {start}-{end} de {count}"
                />
            </div>
        </>
    )
}