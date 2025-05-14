import RightSidebarErrors from "./RightSidebarErrors";
import styles from "./IngredientsForm.module.css";
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
    const { isSuperUser, isStaff } = useAuth();

    const ManageIngredientsFormOptions = [
        { type: "slider", name: "tiempo_preparacion", label: "Tiempo de Preparacion maximo (Minutos)", defaultValue: 360, max: 360, min: 0, showInput: true},
        { type: "slider", name: "tiempo_coccion", label: "Tiempo de Coccion maximo (Minutos)", defaultValue: 360, max: 360, min: 0, showInput: true},
        { type: "slider", name: "rating", label: "Rating Minimo", defaultValue: 0, max: 5, min: 0, showInput: true },
        { type: "select", name: "show_recipes_score", label: "Visibilidad de recetas",  defaultOption: "Todas", options: ["Recetas con puntuacion de salud", "Recetas sin puntuacion de salud", "Todas"]},
    ];

    const [ ingredientData, setIngredientData ] = useState({
        tiempo_preparacion: 360,
        tiempo_coccion: 360,
        rating: 0,
        show_recipes_score: 'Todas',
    });

    /*const handleChangeInformation = async e => {
        e.preventDefault();
        setLoading(true);
        let errors = validateIngredientData(ingredientData);
        setErrorsHandler(errors);
        if(Object.keys(errors).length === 0){
            const formData = new FormData();
            try{
                // Preparado de la informacion
                formData.append('nombre', ingredientData.nombre);
                formData.append('consistencia', ingredientData.consistencia.toLowerCase());
                formData.append('calorias', parseFloat(ingredientData.calorias)/100);
                formData.append('carbohidratos', parseFloat(ingredientData.carbohidratos)/100);
                formData.append('proteinas', parseFloat(ingredientData.proteinas)/100);
                formData.append('grasas_saturadas', parseFloat(ingredientData.grasasSaturadas)/100);
                formData.append('grasas_insaturadas', parseFloat(ingredientData.grasasInsaturadas)/100);
                formData.append('grasas_trans', parseFloat(ingredientData.grasasTrans)/100);
                formData.append('sodio', parseFloat(ingredientData.sodio)/100);
                formData.append('tipo', visibilityData.visibilidad.toLowerCase());
                if(imagen.length == 1){
                    formData.append('foto_ingrediente', imagen[0]);
                }
                if(willUserModifyIngredient){
                    const response = await backendAPI.put(`ingredientes/${ingredientModify.id}/`, formData);
                    Swal.fire({
                        icon: "success",
                        title: "Ingrediente Modificado",
                        text: response.data.message,
                        showConfirmButton: true,
                        customClass: {
                            title: "swal_title",
                            icon: "swal_icon",
                            htmlContainer: "swal_text",
                            confirmButton: "swal_confirm"
                        }
                    });
                    setUpdatedIngredient(response.data);
                } else{
                    const response = await backendAPI.post('ingredientes/', formData);
                    setIngredientData({
                        nombre: "",
                        consistencia: "Liquido",
                        calorias: '0',
                        carbohidratos: '0',
                        proteinas: '0',
                        grasasSaturadas: '0',
                        grasasInsaturadas: '0',
                        grasasTrans: '0',
                        sodio: '0'
                    });
                    setImagen([]);
                    setVisibilityData({visibilidad: 'Personal'});
                    Swal.fire({
                        icon: "success",
                        title: "Ingrediente Creado",
                        text: response.data.message,
                        showConfirmButton: true,
                        customClass: {
                            title: "swal_title",
                            icon: "swal_icon",
                            htmlContainer: "swal_text",
                            confirmButton: "swal_confirm"
                        }
                    });
                    setCreatedIngredient(response.data);
                }
            } catch(error){
                console.log(error);
                if(error.response?.status == 401){
                    await refreshAccessToken(handleChangeInformation, e);
                } else{
                    setErrorsHandler(error.response.data);
                }
            } finally{
                setLoading(false);
            }
        }
        setLoading(false);
    }*/

    return(
        <div className={styles.changeProfileForm}>
            <h3 className={styles.formDescription}>
                Filtros Avanzados
            </h3>

            <RightSidebarErrors errors={errorsHandler} />

            <RightSidebarForms twoOnOne={false} formOptions={ManageIngredientsFormOptions} setData={setIngredientData} data={ingredientData}>
                <MainButton disabled={loading} type="submit" icon="nutrition" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={"Agregar Filtros"} />
            </RightSidebarForms> 
        </div>
    )
}