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


export default function IngredientsForm(){
    const [ activeOption, setActiveOption ] = useState("Informacion");
    const [ loading, setLoading ] = useState(false);
    const [ errorsHandler, setErrorsHandler ] = useState({});
    const { user, changeUserData, refreshAccessToken, isSuperUser, isStaff } = useAuth();
    const { ingredientModify } = useRightSidebar();
    const [imagen, setImagen] = useState([]);

    let willUserModifyIngredient = ingredientModify != null;

    const ManageIngredientsFormOptions = [
        { type: "text", name: "nombre", label: "Nombre:"},
        { type: "select", name: "consistencia", defaultOption: "Liquido", label: "Consistencia:", options: ["Liquido", "Solido"]},
        { type: "number", name: "calorias", label: "Calorias:"},
        { type: "number", name: "carbohidratos", label: "Carbohidratos (g):"},
        { type: "number", name: "proteinas", label: "Proteinas (g):"},
        { type: "number", name: "grasasSaturadas", label: "Grasas Saturadas (g):"},
        { type: "number", name: "grasasInsaturadas", label: "Grasas Insaturadas (g):"},
        { type: "number", name: "grasasTrans", label: "Grasas Trans (g):"},
        { type: "number", name: "sodio", label: "Sodio (mg):"},
        { type: "imageSingle", name: "imagenIngrediente", label: "Imagen del ingrediente (Opcional):", imageData: imagen, setImageData: setImagen }
    ];

    const IngredientVisibilityOptions = [
        { type: "select", name: "visibilidad", defaultOption: "Personal", label: "Visibilidad:", options: ["Personal", "Global"]},
    ];

    const options = [
        { type: 'Informacion', icon: 'nutrition', label: 'Ingrediente' },
        { type: 'Visibilidad', icon: 'eye', label: 'Visibilidad' },
    ];

    const [ ingredientData, setIngredientData ] = useState({
        nombre: "",
        consistencia: "Liquido",
        calorias: 0,
        carbohidratos: 0,
        proteinas: 0,
        grasasSaturadas: 0,
        grasasInsaturadas: 0,
        grasasTrans: 0,
        sodio: 0
    });
    const [ visibilityData, setVisibilityData ] = useState({
        visibilidad: "Personal",
    });

    const handleChangeInformation = async e => {
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
                formData.append('calorias', parseFloat(ingredientData.calorias));
                formData.append('carbohidratos', parseFloat(ingredientData.carbohidratos));
                formData.append('proteinas', parseFloat(ingredientData.proteinas));
                formData.append('grasas_saturadas', parseFloat(ingredientData.grasasSaturadas));
                formData.append('grasas_insaturadas', parseFloat(ingredientData.grasasInsaturadas));
                formData.append('grasas_trans', parseFloat(ingredientData.grasasTrans));
                formData.append('sodio', parseFloat(ingredientData.sodio));
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
                } else{
                    console.log(formData.getAll('grasas_saturadas'))
                    const response = await backendAPI.post('ingredientes/', formData);
                    setIngredientData({
                        nombre: "",
                        consistencia: "Liquido",
                        calorias: 0,
                        carbohidratos: 0,
                        proteinas: 0,
                        grasas_saturadas: 0,
                        grasas_insaturadas: 0,
                        grasas_trans: 0,
                        sodio: 0
                    });
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
    }

    const handleChangeVisibility = async e => {
        e.preventDefault();
    }

    const changeActiveOption = type => {
        setActiveOption(type);
        setErrorsHandler({});
    }

    useEffect(() => {
        if(willUserModifyIngredient){
            setIngredientData({
                nombre: ingredientModify?.nombre,
                consistencia: ingredientModify?.consistencia?.replace(/^./, char => char.toUpperCase()),
                calorias: ingredientModify?.calorias,
                carbohidratos: ingredientModify?.carbohidratos,
                proteinas: ingredientModify?.proteinas,
                grasasSaturadas: ingredientModify?.grasas_saturadas,
                grasasInsaturadas: ingredientModify?.grasas_insaturadas,
                grasasTrans: ingredientModify?.grasas_trans,
                sodio: ingredientModify?.sodio
            });
            setVisibilityData({ visibilidad: ingredientModify?.tipo?.replace(/^./, char => char.toUpperCase()) });
        } else{
            setIngredientData({
                nombre: "",
                consistencia: "Liquido",
                calorias: 0,
                carbohidratos: 0,
                proteinas: 0,
                grasas_saturadas: 0,
                grasas_insaturadas: 0,
                grasas_trans: 0,
                sodio: 0
            });
            setVisibilityData({ visibilidad: "Personal" });
        }
    }, [ingredientModify, willUserModifyIngredient])

    return(
        <div className={styles.changeProfileForm}>

            {(isStaff || isSuperUser) && <div className={styles.formOptions}>
                {options.map(option => (
                    <OptionButton 
                        isBackgroundBlack={true} 
                        key={option.label} 
                        option={option} 
                        active={activeOption} 
                        setData={changeActiveOption} 
                        icon={option.icon} 
                        makeRowOnMobile={false} 
                    />
                ))}  
            </div>}

            <h3 className={styles.formDescription}>
                {activeOption === "Informacion" && (willUserModifyIngredient ? `Modificar Ingrediente '${ingredientModify?.nombre}'` : "Crear Ingrediente (100 Gramos)")}
                {activeOption === "Visibilidad" && "Cambiar Visibilidad"}
            </h3>

            <RightSidebarErrors errors={errorsHandler} />

            {activeOption === "Informacion" && (
                <RightSidebarForms twoOnOne={true} action={handleChangeInformation} formOptions={ManageIngredientsFormOptions} setData={setIngredientData} data={ingredientData}>
                    <MainButton disabled={loading} type="submit" icon="nutrition" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={loading ? (!willUserModifyIngredient ? "Creando..." : "Modificando...") : (!willUserModifyIngredient ? "Crear ingrediente" : "Modificar ingrediente")} />
                </RightSidebarForms> 
            )}

            {activeOption === "Visibilidad" && (isStaff || isSuperUser) && (
                <RightSidebarForms action={handleChangeVisibility} formOptions={IngredientVisibilityOptions} setData={setVisibilityData} data={visibilityData}/>
            )}
        </div>
    )
}