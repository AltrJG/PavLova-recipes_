import Help from "../Components/Help";
import styles from "./EtiquetaCategoria.module.css";
import MainButton from "../Components/MainButton";
import { useEffect, useState } from "react";
import FilterForm from "../Components/FilterForm";
import { FadeLoader } from "react-spinners";
import Pagination from "../Components/Pagination";
import { useRightSidebar } from "../context/RightSidebarProvider";
import { useAuth } from "../context/AuthProvider";
import { useUpdateData } from "../context/UpdateDataProvider";
import Categoria from "../Components/Categoria";
import Etiqueta from "../Components/Etiqueta";


export default function EtiquetaCategoria(){
    const { openCategoriaEtiquetaForm } = useRightSidebar();
    const { refreshAccessToken, user, isStaff, isSuperUser } = useAuth();
    //const { updatedIngredient, createdIngredient, deletedIngredient, resetIngredientState } = useUpdateData();

    const [ loading, setLoading ] = useState(true);
    // Ingredients data
    const [ ingredientFilters, setIngredientFilters ] = useState({
        nombre: "",
        tipo: "Categorias"
    });
    const [ ingredients, setIngredients ] = useState([]);

    // Pagination
    const [ nextPage, setNextPage ] = useState(null);
    const [ previousPage, setPreviousPage ] = useState(null);
    const [ count, setCount ] = useState(0);
    const [ currentPage, setCurrentPage ] = useState(1);

    // Filter form options
    const filterOptions = [
        { type: "text", name: "nombre", placeholder: "Filtrar por nombre de clasificacion..."},
        { type: "select", name: "tipo", defaultOption: "Categorias", options: ["Categorias", "Etiquetas"]}
    ];

    const getEtiquetasCategorias = () => {
        setTimeout(() => {
            setLoading(false);
        }, 3000);
    }

    const updateCategoria = categoriaEtiqueta => {
        openCategoriaEtiquetaForm(categoriaEtiqueta, 'Categoria');
    }

    const updateEtiqueta = categoriaEtiqueta => {
        openCategoriaEtiquetaForm(categoriaEtiqueta, 'Etiqueta');
    }

    const registerCategoriaEtiqueta = () => {
        openCategoriaEtiquetaForm(null, null)
    }

    useEffect(() => {
        getEtiquetasCategorias();
    }, []);

    return(
        <>
            <Help title={"Categorias y Etiquetas Presentes"} description={"Gestiona la informacion presente para todos los usuarios"}>
                <MainButton action={registerCategoriaEtiqueta} disabled={false} type={'button'} icon={"bookmarks"} iconSize={"2.5"} fontSize={"2"} color={"primary"} borderRadius={'1'} text={"Crear Clasificacion"}/>
            </Help>
            <div className={styles.usersContainer}>
                <FilterForm setCurrentPage={setCurrentPage} action={getEtiquetasCategorias} filterOptions={filterOptions} data={ingredientFilters} setData={setIngredientFilters}/>
                { loading 
                ? <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>
                : ingredients.length == 0 
                ? <p className={styles.usersNotFound}>No se encontraron clasificaciones con los filtros colocados, prueba modificando los filtros</p>
                : <>
                <div className='ingredientsContent'>
                    
                </div>
                <Pagination
                    action={getEtiquetasCategorias}    
                    next={nextPage} 
                    previous={previousPage} 
                    count={count} 
                    currentPage={currentPage} 
                    text="Mostrando Etiquetas {start}-{end} de {count}" />
                </>}
                <div className='categoriaEtiquetaContent'>
                    <Categoria isSuperUser={isSuperUser} actualizarCategoria={updateCategoria}/>
                    <Etiqueta actualizarEtiqueta={updateEtiqueta}/>
                </div>
            </div>
        </>
    )
}