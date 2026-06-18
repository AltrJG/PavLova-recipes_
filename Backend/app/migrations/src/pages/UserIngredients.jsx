import { useEffect, useState } from "react"
import FilterForm from "../Components/FilterForm";
import Help from "../Components/Help";
import styles from "./UserIngredients.module.css";
import Pagination from "../Components/Pagination";
import Ingredient from "../Components/Ingredient";
import { FadeLoader } from "react-spinners";
import MainButton from "../Components/MainButton";
import { useRightSidebar } from "../context/RightSidebarProvider";
import backendAPI from "../api/axiosConfig";
import { useAuth } from "../context/AuthProvider";
import { useUpdateData } from "../context/UpdateDataProvider";
import Swal from "sweetalert2";
import FondoPavlova from "../Components/FondoPavlova";
import { useBackground } from "../context/BackgroundProvider";


export default function UserIngredients(){
    //Right Sidebar Actions
    const { openIngredientModify } = useRightSidebar();
    const { refreshAccessToken, user, isStaff, isSuperUser } = useAuth();
    const { updatedIngredient, createdIngredient, resetIngredientState } = useUpdateData();
    const { addPavlorficAero } = useBackground();

    const [ loading, setLoading ] = useState(true);
    // Ingredients data
    const [ ingredientFilters, setIngredientFilters ] = useState({
        nombre: "",
        visibilidad: "Todos"
    });
    const [ ingredients, setIngredients ] = useState([]);

    // Pagination
    const [ nextPage, setNextPage ] = useState(null);
    const [ previousPage, setPreviousPage ] = useState(null);
    const [ count, setCount ] = useState(0);
    const [ currentPage, setCurrentPage ] = useState(1);

    // Filter form options
    const filterOptions = [
        { type: "text", name: "nombre", placeholder: "Filtrar por nombre de ingrediente..."},
        { type: "select", name: "visibilidad", defaultOption: "Todos", options: ["Todos", "Universales", "Personales"]}
    ]

    const getIngredients = async (previous = null, next = null) => {
        setLoading(true);
        try{
            let type = (ingredientFilters.visibilidad == "Universales" ? "global" : "personal");
            let url = previous 
            ? previous.split('app')[1] 
            : next 
            ? next.split('app')[1] 
            : `/ingredientes/`;

            const params = new URLSearchParams();

            if (ingredientFilters.nombre.trim() && previous == null && next == null) params.append("nombre", ingredientFilters.nombre);
            if (ingredientFilters.visibilidad !== "Todos" && previous == null && next == null) params.append("tipo", type);

            // Append query parameters if they exist
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            const response = await backendAPI(url);
            previous != null && setCurrentPage(currentPage-1);
            next != null && setCurrentPage(currentPage+1);
            setCount(response.data.count);
            setNextPage(response.data.next);
            setPreviousPage(response.data.previous);
            next == null && setIngredients(response.data.results);
            next != null && setIngredients(prevRecipes => [...prevRecipes, ...response.data.results]);
        } catch(error){
            if(error.response?.status == 401){
                await refreshAccessToken(getIngredients);
            }
        } finally{
            setLoading(false);
        }
    };

    const deleteIngredientAsk = (ingredient) => {
        Swal.fire({
            title: "Eliminar Ingrediente",
            icon: "question",
            text: `Estas seguro de eliminar el ingrediente '${ingredient.nombre}'`,
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
                deleteIngrediente(ingredient);
            }
        });
    }

    const deleteIngrediente = async (ingredient) => {
        try{
            await backendAPI.delete(`ingredientes/${ingredient.id}/`);
            Swal.fire({
                icon: "success",
                title: "Eliminado!",
                text: `El ingrediente '${ingredient.nombre}' fue eliminado con exito`,
                showConfirmButton: true,
                customClass: {
                    title: "swal_title",
                    icon: "swal_icon",
                    htmlContainer: "swal_text",
                    confirmButton: "swal_confirm"
                }
            });
            setIngredients(ingredients.filter(existingIngredient => existingIngredient.id != ingredient.id));
        } catch(error){
            if(error.response?.status == 401){
                await refreshAccessToken(deleteIngrediente, ingredient);
            }
        }
    }

    const updateIngredient = ingredient => {
        const modifiedIngredient = {
            ...ingredient,
            calorias: Number.parseFloat(ingredient?.calorias * 100).toFixed(1),
            carbohidratos: Number.parseFloat(ingredient?.carbohidratos * 100).toFixed(3),
            proteinas: Number.parseFloat(ingredient?.proteinas * 100).toFixed(3),
            grasas_saturadas: Number.parseFloat(ingredient?.grasas_saturadas * 100).toFixed(3),
            grasas_insaturadas: Number.parseFloat(ingredient?.grasas_insaturadas * 100).toFixed(3),
            grasas_trans: Number.parseFloat(ingredient?.grasas_trans * 100).toFixed(3),
            sodio: Number.parseFloat(ingredient?.sodio * 100).toFixed(3),
        };
    
        openIngredientModify(modifiedIngredient);
    }

    const registerIngredient = () => {
        openIngredientModify(null)
    }

    useEffect(() => {
        addPavlorficAero();
        getIngredients();
    }, []);

    useEffect(() => {
        if(Object.keys(createdIngredient) != 0){
            getIngredients();
            setCurrentPage(1);
            resetIngredientState();
        }        
        else if(Object.keys(updatedIngredient) != 0){
            setIngredients(ingredients => 
                ingredients.map(ingredient => 
                    ingredient.id === updatedIngredient.id ? updatedIngredient : ingredient
                )
            );
            resetIngredientState();
        }
    }, [createdIngredient, updatedIngredient]);

    return(
        <>
            <Help title={"Tus ingredientes"} description={"Gestiona los ingredientes que tienes"}>
                <MainButton action={registerIngredient} disabled={false} type={'button'} icon={"nutrition"} iconSize={"2.5"} fontSize={"2"} color={"primary"} borderRadius={'1'} text={"Crear Ingrediente"}/>
            </Help>
            <div className={styles.usersContainer}>
                <FilterForm setCurrentPage={setCurrentPage} action={getIngredients} filterOptions={filterOptions} data={ingredientFilters} setData={setIngredientFilters}/>
                {  ingredients.length == 0 
                ? <p className={styles.usersNotFound}>No se encontraron ingredientes con los filtros colocados, prueba modificando los filtros</p>
                : <>
                <div className='ingredientsContent'>
                    { ingredients?.map(ingredient => <Ingredient askDelete={deleteIngredientAsk} isStaff={isStaff} isSuperUser={isSuperUser} user_id={user.id} actionModify={updateIngredient} key={ingredient.id} ingredient={ingredient}/>) }
                </div>
                    <div className="mobileSpace">
                    { loading && <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>}
                    <Pagination
                        action={getIngredients}    
                        next={nextPage} 
                        previous={previousPage} 
                        count={count} 
                        loading={loading}
                        currentPage={currentPage} 
                        text="Mostrando Ingredientes {start}-{end} de {count}" />
                    </div>
                </>}
            </div>
        </>
    )
}