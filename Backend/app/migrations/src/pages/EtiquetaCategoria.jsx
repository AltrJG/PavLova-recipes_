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
import backendAPI from '../api/axiosConfig';
import Categoria from "../Components/Categoria";
import Etiqueta from "../Components/Etiqueta";
import Swal from "sweetalert2";
import FondoPavlova from "../Components/FondoPavlova";
import { useBackground } from "../context/BackgroundProvider";


export default function EtiquetaCategoria(){
    const { openCategoriaEtiquetaForm } = useRightSidebar();
    const { addPavlorficAero } = useBackground();
    const { refreshAccessToken, user, isStaff, isSuperUser } = useAuth();
    const { updatedEtiqueta, createdEtiqueta, createdCategoria, updatedCategoria, resetCategoriaEtiquetaState } = useUpdateData();

    const [ loading, setLoading ] = useState(true);
    // Ingredients data
    const [ etiquetaCategoriaFilters, setEtiquetaCategoriaFilters ] = useState({
        nombre: "",
        tipo: "Etiquetas"
    });
    const [ etiquetasCategorias, setEtiquetasCategorias ] = useState([]);

    // Pagination
    const [ nextPage, setNextPage ] = useState(null);
    const [ previousPage, setPreviousPage ] = useState(null);
    const [ count, setCount ] = useState(0);
    const [ currentPage, setCurrentPage ] = useState(1);

    // Filter form options
    const filterOptions = isSuperUser ? [
        { type: "text", name: "nombre", placeholder: "Filtrar por nombre de clasificacion..."},
        { type: "select", name: "tipo", defaultOption: "Categorias", options: ["Categorias", "Etiquetas"]}
    ] : [
        { type: "text", name: "nombre", placeholder: "Filtrar por nombre de clasificacion..."}
    ] ;

    const getEtiquetasCategorias = async (previous = null, next = null) => {
        setLoading(true);
        try{
            let url = previous 
            ? previous.split('app')[1] 
            : next 
            ? next.split('app')[1] 
            : `${etiquetaCategoriaFilters.tipo == "Etiquetas" ? "etiquetas/" : "categorias/"}`;

            const params = new URLSearchParams();

            if (etiquetaCategoriaFilters.nombre.trim() && previous == null && next == null) params.append("nombre", etiquetaCategoriaFilters.nombre);

            // Append query parameters if they exist
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await backendAPI(url);
            previous != null && setCurrentPage(currentPage-1);
            next != null && setCurrentPage(currentPage+1);
            previous == null && next == null && setCurrentPage(1);
            setCount(response.data.count);
            setNextPage(response.data.next);
            setPreviousPage(response.data.previous);
            next == null && setEtiquetasCategorias(response.data.results);
            next != null && setEtiquetasCategorias(users => [...users, ...response.data.results]);
        } catch(error){
            if(error.response?.status == 401){
                await refreshAccessToken(getEtiquetasCategorias);
            }
        } finally{
            setLoading(false);
        }
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

    const deleteCategoriaEtiquetaAsk = (categoriaEtiqueta, tipo) => {
        Swal.fire({
            title: `Eliminar ${tipo}`,
            icon: "question",
            text: `Estas seguro de eliminar la ${tipo} '${categoriaEtiqueta.nombre}'`,
            customClass: {
                title: "swal_title",
                icon: "swal_icon",
                htmlContainer: "swal_text",
                confirmButton: "swal_confirm"
            },
            showCancelButton: true,
            cancelButtonText: "Cancelar",
            confirmButtonText: "Eliminar",
            allowOutsideClick: () => !Swal.isLoading()
          }).then((result) => {
            if (result.isConfirmed) {
                deleteCategoriaEtiqueta(categoriaEtiqueta, tipo);
            }
        });
    }

    const deleteCategoriaEtiqueta = async (categoriaEtiqueta, tipo) => {
        try{
            tipo == 'Etiqueta' ? await backendAPI.delete(`etiquetas/${categoriaEtiqueta.id}/`) : await backendAPI.delete(`categorias/${categoriaEtiqueta.id}/`);
            Swal.fire({
                icon: "success",
                title: "Eliminado!",
                text: `La ${tipo} '${categoriaEtiqueta.nombre}' fue eliminado con exito`,
                showConfirmButton: true,
                customClass: {
                    title: "swal_title",
                    icon: "swal_icon",
                    htmlContainer: "swal_text",
                    confirmButton: "swal_confirm"
                }
            });
            setCurrentPage(1);
            await getEtiquetasCategorias();
        } catch(error){
            if(error.response?.status == 401){
                await refreshAccessToken(deleteCategoriaEtiqueta);
            }
        }
    }

    useEffect(() => {
        addPavlorficAero();
    }, [])

    useEffect(() => {
        setCurrentPage(1);
        getEtiquetasCategorias();
    }, [etiquetaCategoriaFilters.tipo]);

    useEffect(() => {
        if(Object.keys(createdEtiqueta) != 0){
            setEtiquetaCategoriaFilters({...etiquetaCategoriaFilters, tipo: "Etiquetas"});
            getEtiquetasCategorias();
            setCurrentPage(1);
            resetCategoriaEtiquetaState();
        }        
        else if(Object.keys(updatedEtiqueta) != 0){
            setEtiquetasCategorias(etiquetas => [
                ...etiquetas.filter(ingredient => ingredient.id !== updatedEtiqueta.id),
                updatedEtiqueta])
            resetCategoriaEtiquetaState();
        }
        if(Object.keys(createdCategoria) != 0){
            setEtiquetaCategoriaFilters({...etiquetaCategoriaFilters, tipo: "Categorias"});
            getEtiquetasCategorias();
            setCurrentPage(1);
            resetCategoriaEtiquetaState();
        }        
        else if(Object.keys(updatedCategoria) != 0){
            setEtiquetasCategorias(etiquetas => [
                ...etiquetas.filter(ingredient => ingredient.id !== updatedCategoria.id),
                updatedCategoria])
            resetCategoriaEtiquetaState();
        }
    }, [updatedEtiqueta, createdEtiqueta, updatedCategoria, createdCategoria]);

    return(
        <>
            <Help title={"Categorias y Etiquetas"} description={"Gestiona las clasificaciones para todos los usuarios"}>
                <MainButton action={registerCategoriaEtiqueta} disabled={false} type={'button'} icon={"bookmarks"} iconSize={"2.5"} fontSize={"2"} color={"primary"} borderRadius={'1'} text={"Crear Clasificacion"}/>
            </Help>
            <div className={styles.usersContainer}>
                <FilterForm setCurrentPage={setCurrentPage} action={getEtiquetasCategorias} filterOptions={filterOptions} data={etiquetaCategoriaFilters} setData={setEtiquetaCategoriaFilters}/>
                { loading 
                ? <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>
                : etiquetasCategorias.length == 0 
                ? <p className={styles.usersNotFound}>No se encontraron clasificaciones con los filtros colocados, prueba modificando los filtros</p>
                : <>
                <div className='categoriaEtiquetaContent'>
                    { etiquetaCategoriaFilters.tipo == 'Etiquetas' 
                        ? etiquetasCategorias.map(etiqueta=> (<Etiqueta preguntarEliminado={deleteCategoriaEtiquetaAsk} etiqueta={etiqueta}  key={etiqueta.id} actualizarEtiqueta={updateEtiqueta}/>)) 
                        : etiquetasCategorias.map(categoria=> (<Categoria preguntarEliminado={deleteCategoriaEtiquetaAsk} categoria={categoria} key={categoria.id} isSuperUser={isSuperUser} actualizarCategoria={updateCategoria}/>))
                    }
                </div>
                <div className="mobileSpace">
                    <Pagination
                        action={getEtiquetasCategorias}
                        next={nextPage} 
                        resultsPerPage={10}
                        previous={previousPage} 
                        count={count} 
                        loading={loading}
                        currentPage={currentPage} 
                        text={`Mostrando ${etiquetaCategoriaFilters.tipo} {start}-{end} de {count}`} />
                </div>
                </>}
                
            </div>
        </>
    )
}