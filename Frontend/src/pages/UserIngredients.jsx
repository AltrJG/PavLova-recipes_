import { useEffect, useState } from "react"
import FilterForm from "../Components/FilterForm";
import Help from "../Components/Help";
import styles from "./UserIngredients.module.css";
import Pagination from "../Components/Pagination";
import Ingredient from "../Components/Ingredient";
import { FadeLoader } from "react-spinners";
import MainButton from "../Components/MainButton";
import { useRightSidebar } from "../context/RightSidebarProvider";


export default function UserIngredients(){
    //Right Sidebar Actions
    const { openIngredientModify } = useRightSidebar();

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

    const getIngredients = async () => {
        console.log("Ingredientes");
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 3000);
    };

    useEffect(() => {
        getIngredients();
    }, []);

    return(
        <>
            <Help title={"Tus ingredientes"} description={"Gestiona los ingredientes que tienes"}>
                <MainButton action={openIngredientModify} disabled={false} type={'button'} icon={"nutrition"} iconSize={"2.5"} fontSize={"2"} color={"primary"} borderRadius={'1'} text={"Crear Ingrediente"}/>
            </Help>
            <div className={styles.usersContainer}>
                <FilterForm setCurrentPage={setCurrentPage} action={getIngredients} filterOptions={filterOptions} data={ingredientFilters} setData={setIngredientFilters}/>
                { loading 
                ? <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>
                : ingredients.length == 0 
                ? <p className={styles.usersNotFound}>No se encontraron ingredientes con los filtros colocados, prueba modificando los filtros</p>
                : <>
                <div className='usersContent'>
                    { ingredients.map(ingredient => <Ingredient key={ingredient.id} ingredient={ingredient}/>) }
                </div>
                <Pagination
                    action={getIngredients}    
                    next={nextPage} 
                    previous={previousPage} 
                    count={count} 
                    currentPage={currentPage} 
                    text="Mostrando Ingredientes {start}-{end} de {count}" />
                </>}
                <div className='ingredientsContent'>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                    <Ingredient/>
                </div>
            </div>
        </>
    )
}