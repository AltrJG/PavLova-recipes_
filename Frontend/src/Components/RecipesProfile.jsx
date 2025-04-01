import { useState } from "react";
import Recipe from "./Recipe";
import styles from "./RecipesProfile.module.css";
import Pagination from "./Pagination";

export default function RecipesProfile(){
    
    const [selectedFilter, setSelectedFilter] = useState("my_recipes");

    const handleFilter = selection => {
        setSelectedFilter(selection);
    }

    return(
        <div className={styles.profileRecipesContainer}>
            <div className={styles.profileSearch}>
                <button onClick={() => handleFilter("my_recipes")} className={`${styles.profileSearchOption} ${selectedFilter == "my_recipes" ? styles.activeOption : ""}`}>Mis Recetas</button>
                <button onClick={() => handleFilter("my_favorites")} className={`${styles.profileSearchOption} ${selectedFilter == "my_favorites" ? styles.activeOption : ""}`}>Mis Favoritos</button>
            </div>
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
            <Pagination                    
                        
                    next={'tgwgfw'} 
                    previous={'wrw'} 
                    count={15} 
                    currentPage={5} 
                    text="Mostrando Recetas {start}-{end} de {count}"/>
        </div>
    )
}