import RightSidebarErrors from "./RightSidebarErrors";
import styles from "./RecipeAdvanceFilters.module.css";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import OptionButton from "./OptionButton";
import RightSidebarForms from "./RightSidebarForms";
import MainButton from "./MainButton";
import { validateIngredientData } from "./utils/validators";
import Swal from "sweetalert2";
import backendAPI from "../api/axiosConfig";
import { useRightSidebar } from "../context/RightSidebarProvider";
import { useUpdateData } from "../context/UpdateDataProvider";


export default function RecipeAdvanceFilters(){
    const [ loading, setLoading ] = useState(false);
    const [ errorsHandler, setErrorsHandler ] = useState({});
    const [ selectedEtiquetas, setSelectedEtiquetas ] = useState([]);
    const { isSuperUser, isStaff } = useAuth();
    const { recipeAdvanceFilters, closeRightSidebar } = useRightSidebar();
    const { recipeFilters, setRecipeFilters } = useUpdateData();

    const ManageIngredientsFormOptions = [
        { type: "slider", step: "1", name: "tiempo_preparacion", label: "Tiempo de Preparacion maximo (Minutos)", defaultValue: 360, max: 360, min: 0, showInput: true},
        { type: "slider", step: "1", name: "tiempo_coccion", label: "Tiempo de Coccion maximo (Minutos)", defaultValue: 360, max: 360, min: 0, showInput: true},
        { type: "slider", step: "0.1", name: "rating", label: "Rating Minimo", defaultValue: '0.0', max: '5.0', min: 0, showInput: true },
        { type: "select", name: "show_recipes_score", label: "Visibilidad de recetas",  defaultOption: "Todas", options: ["Recetas con puntuacion de salud", "Recetas sin puntuacion de salud", "Todas"]},
    ];

    const [ advanceFiltersData, setAdvanceFiltersData ] = useState({
        tiempo_preparacion: 360,
        tiempo_coccion: 360,
        rating: 0,
        show_recipes_score: 'Todas',
    });

    const toggleEtiquetas = etiqueta => {
        setSelectedEtiquetas(prevEtiquetas => {
          const index = prevEtiquetas.findIndex(item => item === etiqueta);
          if(index === -1) {
              return [...prevEtiquetas, etiqueta];
          } else {
              return prevEtiquetas.filter(item => item !== etiqueta);
          }
      });
    }

    const handleChangeInformation = e => {
        e.preventDefault()
        setRecipeFilters({
            tiempo_preparacion: advanceFiltersData.tiempo_preparacion, 
            tiempo_coccion: advanceFiltersData.tiempo_coccion,
            rating: advanceFiltersData.rating,
            show_recipes_score: advanceFiltersData.show_recipes_score,
            selected_etiquetas: selectedEtiquetas
        });
        closeRightSidebar();
    }

    useEffect(() => {
        setSelectedEtiquetas(recipeFilters.selected_etiquetas);
        setAdvanceFiltersData({
            tiempo_preparacion: recipeFilters.tiempo_preparacion,
            tiempo_coccion: recipeFilters.tiempo_coccion,
            rating: recipeFilters.rating,
            show_recipes_score: recipeFilters.show_recipes_score,
        })
    }, [recipeFilters]);

    return(
        <div className={styles.changeProfileForm}>
            <h3 className={styles.formDescription}>
                Filtros Avanzados
            </h3>

            <RightSidebarErrors errors={errorsHandler} />

            <RightSidebarForms action={handleChangeInformation} twoOnOne={false} formOptions={ManageIngredientsFormOptions} setData={setAdvanceFiltersData} data={advanceFiltersData}>
                <h4 className={styles.etiquetaDesc}>Etiquetas:</h4>
                <div className={styles.etiquetasContainer}>
                    {recipeAdvanceFilters.etiquetas.map(etiqueta => <p onClick={() => toggleEtiquetas(etiqueta.id)} key={etiqueta.id} className={`${(selectedEtiquetas.findIndex(etiq => etiq == etiqueta.id) != -1) ? styles.activeEtiqueta : ""} ${styles.etiquetaOption}`}>{etiqueta.nombre}</p>)}
                </div>
                <MainButton disabled={loading} type="submit" icon="filter-circle" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={"Agregar Filtros"} />
            </RightSidebarForms> 
        </div>
    )
}