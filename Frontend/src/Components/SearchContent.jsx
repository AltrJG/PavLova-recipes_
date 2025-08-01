import React, { useState } from "react"
import styles from './SearchContent.module.css';
import OptionButton from "./OptionButton";
import { useLocation, useNavigate } from "react-router-dom";
import arrowDown from '/assets/Iconos/caret-down-outline.svg';
import { ReactSVG } from "react-svg";
import { useFilters } from "../context/FiltersProvider";
import { useUpdateData } from "../context/UpdateDataProvider";

export default function SearchContent(){

    const navigate = useNavigate();
    const location = useLocation();
    const [ searchOption, setSearchOption ] = useState("Recetas");
    const [ searchTextQuery, setSearchTextQuery ] = useState("");
    const [ filterPickerActive, setFilterPickerActive ] = useState(false);
    const { setGlobalUserName, setGlobalRecipeName, setUserUpdate, setRecipeUpdate } = useFilters();
    const { resetRecipeFilters } = useUpdateData();

    const searchOptions = [
        { type: 'Usuarios', icon: 'people', label: 'Usuarios' },
        { type: 'Recetas', icon: 'restaurant', label: 'Recetas' }
    ];

    const handleSubmitSearch = e => {
        e.preventDefault();
        if(searchOption == 'Usuarios'){
            setGlobalUserName(searchTextQuery);
            (location.pathname == "/users") && setUserUpdate(true);
            setSearchTextQuery("");
            navigate(`users`);
        } else{
            resetRecipeFilters();
            setGlobalRecipeName(searchTextQuery);
            if(location.pathname == "/"){
                console.log('updated!');
                setRecipeUpdate(true)
            };
            setSearchTextQuery("");
            navigate(`/?nombre=${searchTextQuery}`);
        }
    }

    return(
        <form onSubmit={e => handleSubmitSearch(e)} className={styles.main_content_search_bar}>
            <input onChange={e => setSearchTextQuery(e.target.value)} value={searchTextQuery} className={styles.search_bar} type={"text"} placeholder={`Busca ${searchOption} por nombre...`} name={"bookName"}/>
            <div className={`${styles.search_bar_buttons} ${filterPickerActive ? styles.filterPickerActiveOptions : ""}`}>
                {searchOptions.map(option => (
                    <OptionButton key={option.label} option={option} active={searchOption} setData={setSearchOption} icon={option.icon} makeRowOnMobile={true}/>
                ))}
            </div>
            <div onClick={() => setFilterPickerActive(!filterPickerActive)} className={`${styles.mobileFilterPicker} ${filterPickerActive ? styles.pickerActiveButton : ""}`}><ReactSVG src={arrowDown}/></div>
            <button aria-label="Iniciar búsqueda" type="submit" className={styles.main_content_search_bar_button}><ReactSVG src={`/assets/Iconos/search-outline.svg`}/></button>
        </form>
    )
}