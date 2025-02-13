import { useState } from "react"
import styles from './SearchContent.module.css';

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
                <button
                    key={option.type}
                    onClick={() => setSearchOption(option.type)}
                    type="button"
                    className={`${styles.button_search_type} ${searchOption === option.type && styles.selected}`}
                    aria-label={`Buscar por ${option.label}`}
                >
                    <ion-icon name={searchOption === option.type ? option.icon : `${option.icon}-outline`}></ion-icon>
                    {option.label}
                </button>
            ))}  
            </div>          <button aria-label="Iniciar búsqueda" type="submit" className={styles.main_content_search_bar_button}><ion-icon name="search-outline"></ion-icon></button>
        </form>
    )
}