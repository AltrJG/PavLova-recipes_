import { useEffect, useState } from "react"
import FilterForm from "../Components/FilterForm";
import Help from "../Components/Help";
import styles from "./UserIngredients.module.css";
import Pagination from "../Components/Pagination";
import Ingredient from "../Components/Ingredient";
import { FadeLoader } from "react-spinners";
import MainButton from "../Components/MainButton";
import { useRightSidebar } from "../context/RightSidebarProvider";
import backendAPI from "../api/axiosConfig";
import { useAuth } from "../context/AuthProvider";


export default function UserIngredients(){
    //Right Sidebar Actions
    const { openIngredientModify } = useRightSidebar();
    const { refreshAccessToken, user, isStaff, isSuperUser } = useAuth();

    const [ loading, setLoading ] = useState(true);
    // Ingredients data
    const [ ingredientFilters, setIngredientFilters ] = useState({
        nombre: "",
        visibilidad: "Todos"
    });
    const [ ingredients, setIngredients ] = useState([]);

    // Pagination
    const [ nextPage, setNextPage ] = useState(null);
    const [ previousPage, setPreviousPage ] = useState(null);
    const [ count, setCount ] = useState(0);
    const [ currentPage, setCurrentPage ] = useState(1);

    // Filter form options
    const filterOptions = [
        { type: "text", name: "nombre", placeholder: "Filtrar por nombre de ingrediente..."},
        { type: "select", name: "visibilidad", defaultOption: "Todos", options: ["Todos", "Universales", "Propios"]}
    ]

    const getIngredients = async (previous = null, next = null) => {
        setLoading(true);
        try{
            let url = previous 
            ? previous.split('app')[1] 
            : next 
            ? next.split('app')[1] 
            : `/ingredientes/`;

            const params = new URLSearchParams();

            if (ingredientFilters.nombre.trim() && previous == null && next == null) params.append("nombre", ingredientFilters.nombre);
            if (ingredientFilters.visibilidad !== "Todos" && previous == null && next == null) params.append("role", ingredientFilters.visibilidad);

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
            setIngredients(response.data.results);
        } catch(error){
            console.log(error);
            if(error.response?.status == 401){
                await refreshAccessToken(getIngredients);
            }
        } finally{
            setLoading(false);
        }
    };

    const updateIngredient = ingredient => {
        openIngredientModify(ingredient)
    }

    const registerIngredient = () => {
        openIngredientModify(null)
    }

    useEffect(() => {
        getIngredients();
    }, []);

    return(
        <>
            <Help title={"Tus ingredientes"} description={"Gestiona los ingredientes que tienes"}>
                <MainButton action={registerIngredient} disabled={false} type={'button'} icon={"nutrition"} iconSize={"2.5"} fontSize={"2"} color={"primary"} borderRadius={'1'} text={"Crear Ingrediente"}/>
            </Help>
            <div className={styles.usersContainer}>
                <FilterForm setCurrentPage={setCurrentPage} action={getIngredients} filterOptions={filterOptions} data={ingredientFilters} setData={setIngredientFilters}/>
                { loading 
                ? <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>
                : ingredients.length == 0 
                ? <p className={styles.usersNotFound}>No se encontraron ingredientes con los filtros colocados, prueba modificando los filtros</p>
                : <>
                <div className='ingredientsContent'>
                    { ingredients.map(ingredient => <Ingredient isStaff={isStaff} isSuperUser={isSuperUser} user_id={user.id} actionModify={updateIngredient} key={ingredient.id} ingredient={ingredient}/>) }
                </div>
                <Pagination
                    action={getIngredients}    
                    next={nextPage} 
                    previous={previousPage} 
                    count={count} 
                    currentPage={currentPage} 
                    text="Mostrando Ingredientes {start}-{end} de {count}" />
                </>}
            </div>
        </>
    )
}