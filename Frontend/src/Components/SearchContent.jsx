import { useState } from "react"
import styles from './SearchContent.module.css';
import OptionButton from "./OptionButton";

export default function SearchContent(){

    const [ searchOption, setSearchOption ] = useState("Recetas");
    const [ searchTextQuery, setSearchTextQuery ] = useState("");

    const searchOptions = [
        { type: 'Usuarios', icon: 'people', label: 'Usuarios' },
        { type: 'Recetas', icon: 'restaurant', label: 'Recetas' }
    ];

    const handleSubmitSearch = e => {
        e.preventDefault();
        console.log("hello");
    }

    return(
        <form onSubmit={e => handleSubmitSearch(e)} className={styles.main_content_search_bar}>
            <input onChange={e => setSearchTextQuery(e.target.value)} value={searchTextQuery} className={styles.search_bar} type={"text"} placeholder={`Busca ${searchOption}...`} name={"bookName"}/>
            <div className={styles.search_bar_buttons}>
            {searchOptions.map(option => (
                <OptionButton key={option.label} option={option} active={searchOption} setData={setSearchOption} icon={option.icon}/>
            ))}  
            </div>          <button aria-label="Iniciar búsqueda" type="submit" className={styles.main_content_search_bar_button}><ion-icon name="search-outline"></ion-icon></button>
        </form>
    )
}