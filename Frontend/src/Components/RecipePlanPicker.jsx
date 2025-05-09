import { useState } from 'react';
import Help from './Help';
import styles from './RecipePlanPicker.module.css';
import FilterForm from './FilterForm';
import Recipe from './Recipe';
import MainButton from './MainButton';
import OptionButton from './OptionButton';
import Pagination from './Pagination';

export default function RecipePlanPicker({activePicker, setActivePicker}){

    const [ recipeFilters, setRecipeFilters ] = useState({
        nombre: "",
        autor: "",
        rating: ''
    });
    const [ searchOption, setSearchOption ] = useState('mis_recetas');


    const searchOptions = [
        { type: 'favoritos', icon: 'heart', label: 'Favoritos' },
        { type: 'mis_recetas', icon: 'restaurant', label: 'Mis Recetas' }
    ];

    const filterOptions = [
        { type: "text", name: "nombre", placeholder: "Filtrar por nombres..."},
        { type: "text", name: "autor", placeholder: "Filtrar por autores..."},
        { type: "number", name: "rating", placeholder: "Calificacion minima...", minNumber: 0, maxNumber: 5}
    ]

    return (
        <>
        <div className={`${styles.darkenedBack} ${activePicker ? styles.activeDarkenedBack : ""}`}></div>
        <div onClick={() => setActivePicker(false)} className={`${styles.rightSidebarClose} ${activePicker ? styles.activeClose : ""}`}>X</div>
        <div className={`${styles.recipePickerContainer} ${activePicker ? styles.activePicker : ""}`}>
            <Help title={"Elegir Recetas"} description={"Elige entre tus recetas seleccionadas"}>
                <div className={styles.filterOptionsContainer}>
                    <div className={styles.filterOptions}>
                        { searchOptions.map(option => <OptionButton key={option.label} option={option} active={searchOption} setData={setSearchOption} icon={option.icon} makeRowOnMobile={false}/>)}
                    </div>
                    <MainButton disabled={false} type={'button'} icon={"save"} iconSize={"2.1"} fontSize={"1.8"} color={"primary"} borderRadius={'1'} text={"Guardar Cambios."}/>
                </div>
            </Help>
            <div className={styles.recipePicker}>
                <FilterForm filterOptions={filterOptions} data={recipeFilters} setData={setRecipeFilters}/>
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
                    text="Mostrando Recetas {start}-{end} de {count}"
                />
            </div>
        </div>
        </>
    )
}