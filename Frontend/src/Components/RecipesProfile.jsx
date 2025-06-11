import { useEffect, useState } from "react";
import Recipe from "./Recipe";
import styles from "./RecipesProfile.module.css";
import Pagination from "./Pagination";
import { FadeLoader } from "react-spinners";
import backendAPI from "../api/axiosConfig";
import FondoPavlova from "./FondoPavlova";

export default function RecipesProfile({user_id}){
    
    const [selectedFilter, setSelectedFilter] = useState("my_recipes");
        
    const [ recipes, setRecipes ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ nextPage, setNextPage ] = useState(null);
    const [ previousPage, setPreviousPage ] = useState(null);
    const [ count, setCount ] = useState(0);
    const [ currentPage, setCurrentPage ] = useState(1);

    const handleFilter = async selection => {
        if(selectedFilter != selection){
            console.log(selection);
            setSelectedFilter(selection);
            setLoading(true);
            await getRecipes(null, null, selection);
        }
    }

    const getRecipes = async (previous = null, next = null, selection) => {
        try{
            console.log(selection);
            let url = previous 
            ? previous.split('app')[1] 
            : next 
            ? next.split('app')[1] 
            : `/${selection == 'my_recipes' ? "recetas" : "favoritos"}/por-usuario/${user_id}/?page_size=8`;
            const recipeData = await backendAPI(url);
            console.log(url);
            previous != null && setCurrentPage(currentPage-1);
            next != null && setCurrentPage(currentPage+1);
            setCount(recipeData.data.count);
            setNextPage(recipeData.data.next);
            setPreviousPage(recipeData.data.previous);
            setRecipes(recipeData.data.results);
        } catch(error){

        } finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        getRecipes(null, null, selectedFilter);
    }, []);

    return(
        <>
        <FondoPavlova/>
        <div className={styles.profileRecipesContainer}>
            <div className={styles.profileSearch}>
                <button onClick={() => handleFilter("my_recipes")} className={`${styles.profileSearchOption} ${selectedFilter == "my_recipes" ? styles.activeOption : ""}`}>Mis Recetas</button>
                <button onClick={() => handleFilter("my_favorites")} className={`${styles.profileSearchOption} ${selectedFilter == "my_favorites" ? styles.activeOption : ""}`}>Mis Favoritos</button>
            </div>
            {loading 
            ? <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>
            : (recipes.length != 0) 
            ? <><div className="recipesContent">
                    {recipes.map(recipe => <Recipe cristal={true} key={recipe.id} recipe={recipe}/>)}
                </div>
                <Pagination
                    action={getRecipes}
                    next={nextPage} 
                    previous={previousPage} 
                    count={count} 
                    currentPage={currentPage} 
                    resultsPerPage={8}
                    text="Mostrando Recetas {start}-{end} de {count}"
                />
            </>
            : <p className={styles.usersNotFound}>No se encontraron recetas de este usuario</p>}
        </div>
        </>
    )
}