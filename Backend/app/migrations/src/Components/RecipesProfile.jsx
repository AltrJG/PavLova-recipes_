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
            setSelectedFilter(selection);
            setLoading(true);
            setCount(0);
            setCurrentPage(1);
            await getRecipes(null, null, selection);
        }
    }

    const getRecipes = async (previous = null, next = null, selection) => {
        setLoading(true);
        try{
            let url = previous 
            ? previous.split('app')[1] 
            : next 
            ? next.split('app')[1] 
            : `/${selection == 'my_recipes' ? "recetas" : "favoritos"}/por-usuario/${user_id}/?page_size=8`;
            const recipeData = await backendAPI(url);
            previous != null && setCurrentPage(currentPage-1);
            next != null && setCurrentPage(currentPage+1);
            previous == null && next == null && setCurrentPage(1);
            setCount(recipeData.data.count);
            setNextPage(recipeData.data.next);
            setPreviousPage(recipeData.data.previous);
            next == null && setRecipes(recipeData.data.results);
            next != null && setRecipes(prevRecipes => [...prevRecipes, ...recipeData.data.results]);
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
        <div className={styles.profileRecipesContainer}>
            <div className={styles.profileSearch}>
                <button onClick={() => handleFilter("my_recipes")} className={`${styles.profileSearchOption} ${selectedFilter == "my_recipes" ? styles.activeOption : ""}`}>Mis Recetas</button>
                <button onClick={() => handleFilter("my_favorites")} className={`${styles.profileSearchOption} ${selectedFilter == "my_favorites" ? styles.activeOption : ""}`}>Mis Favoritos</button>
            </div>
                { recipes.length == 0 
                ? <p className={styles.usersNotFound}>No se encontraron recetas de este usuario</p>
                : <><div className="recipesContent">
                    {recipes.map(recipe => <Recipe cristal={true} key={recipe.id} recipe={recipe}/>)}
                </div>
                { loading && <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>}
                <div className='mobileSpace'>
                    <Pagination
                        resultsPerPage={10}
                        action={getRecipes}
                        next={nextPage} 
                        previous={previousPage} 
                        count={count} 
                        currentPage={currentPage} 
                        loading={loading}
                        text="Mostrando Recetas {start}-{end} de {count}"
                    />
                </div></>}
        </div>
        </>
    )
}