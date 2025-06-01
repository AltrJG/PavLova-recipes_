import Help from '../Components/Help';
import MainButton from '../Components/MainButton';
import styles from './SearchRecipes.module.css';
import { useEffect, useState } from 'react';
import FilterForm from '../Components/FilterForm';
import Recipe from '../Components/Recipe';
import OptionButton from '../Components/OptionButton';
import Pagination from '../Components/Pagination';
import { useNavigate } from 'react-router-dom';
import backendAPI from '../api/axiosConfig';
import { useAuth } from '../context/AuthProvider';
import Swal from "sweetalert2";
import { FadeLoader } from 'react-spinners';
import FondoPavlova from '../Components/FondoPavlova';

export default function UserRecipes(){

    const [ loading, setLoading ] = useState(true);
    const [ nextPage, setNextPage ] = useState(null);
    const [ previousPage, setPreviousPage ] = useState(null);
    const [ count, setCount ] = useState(0);
    const [ currentPage, setCurrentPage ] = useState(1);
    const { refreshAccessToken, isSuperUser, isStaff, user } = useAuth();
    const [ recipes, setRecipes ] = useState([]);

    const [ searchOption, setSearchOption ] = useState('mis_recetas');

    const navigate = useNavigate();

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
        { type: 'mis_recetas', icon: 'restaurant', label: 'Mis Recetas' }
    ];

    const getRecipes = async (previous = null, next = null) => {
        setLoading(true);
        try{
            let url = previous 
            ? previous.split('app')[1] 
            : next 
            ? next.split('app')[1] 
            : `/recetas/`;

            const params = new URLSearchParams();

            if (recipeFilters.nombre.trim() && previous == null && next == null) params.append("nombre", recipeFilters.nombre);
            if (recipeFilters.nombre_usuario.trim() && previous == null && next == null) params.append("autor", recipeFilters.autor);
            if (!isNaN(recipeFilters.rating) && recipeFilters.rating > 0 && recipeFilters.rating <= 5 && previous == null && next == null) params.append("rating", recipeFilters.rating);

            // Append query parameters if they exist
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            const response = await backendAPI(url);
            previous != null && setCurrentPage(currentPage-1);
            next != null && setCurrentPage(currentPage+1);
            setCount(response.data.count);
            setNextPage(response.data.next);
            setPreviousPage(response.data.previous);
            setRecipes(response.data.results);
        } catch(error){
            console.log(error);
            if(error.response?.status == 401){
                await refreshAccessToken(getRecipes);
            }
        } finally{
            setLoading(false);
        }
    }

    const deleteRecetaAsk = (receta) => {
        Swal.fire({
            title: "Eliminar Receta",
            icon: "question",
            text: `Estas seguro de eliminar la receta '${receta.nombre}'`,
            customClass: {
                title: "swal_title",
                icon: "swal_icon",
                htmlContainer: "swal_text",
                confirmButton: "swal_confirm"
            },
            showCancelButton: true,
            cancelButtonText: "Cancelar",
            confirmButtonText: "Eliminar",
            allowOutsideClick: () => !Swal.isLoading()
          }).then((result) => {
            if (result.isConfirmed) {
                deleteReceta(receta);
            }
        });
    }

    const deleteReceta = async (receta) => {
        try{
            await backendAPI.delete(`recetas/${receta.id}/`);
            Swal.fire({
                icon: "success",
                title: "Eliminado!",
                text: `La receta '${receta.nombre}' fue eliminada con exito`,
                showConfirmButton: true,
                customClass: {
                    title: "swal_title",
                    icon: "swal_icon",
                    htmlContainer: "swal_text",
                    confirmButton: "swal_confirm"
                }
            });
            await getRecipes();
        } catch(error){
            console.log(error);
            if(error.response?.status == 401){
                await refreshAccessToken(deleteReceta, receta);
            }
        }
    }

    useEffect(() => {
        getRecipes();
    }, []);
    
    return(
        <>
            <FondoPavlova/>
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
                {loading 
                ? <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>
                : recipes.length == 0 
                ? <p className={styles.usersNotFound}>No se encontraron recetas con los filtros colocados, prueba modificando los filtros</p> 
                : <><div className="recipesContent">
                    { recipes.map(recipe => <Recipe isSuperUser={isSuperUser} isStaff={isStaff} user={user} cristal={true} key={recipe.id} recipe={recipe} isModificationAllowed={true} deleteAction={deleteRecetaAsk}/>) }
                </div>
                <div className='mobileSpace'>
                    <Pagination               
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