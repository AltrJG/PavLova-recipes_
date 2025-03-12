import RightSidebarErrors from "./RightSidebarErrors";
import styles from "./IngredientsForm.module.css";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import OptionButton from "./OptionButton";
import RightSidebarForms from "./RightSidebarForms";
import MainButton from "./MainButton";
import { validateIngredientData } from "./utils/validators";


export default function IngredientsForm(){
    const [ activeOption, setActiveOption ] = useState("Informacion");
    const [ loading, setLoading ] = useState(false);
    const [ errorsHandler, setErrorsHandler ] = useState({});
    const { user, changeUserData, refreshAccessToken, isSuperUser, isStaff } = useAuth();
    const [imagen, setImagen] = useState([]);

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
        { type: "select", name: "visibilidad", defaultOption: "Personal", label: "Visibilidad:", options: ["Universal", "Personal"]},
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
    })

    const handleChangeInformation = async e => {
        e.preventDefault();
        setLoading(true);
        let errors = validateIngredientData(ingredientData);
        setErrorsHandler(errors);
        /*if(Object.keys(errors).length === 0){
            try{
                const response = await backendAPI.post('user/update_profile/', userData);
                changeUserData(userData);
                Swal.fire({
                    icon: "success",
                    title: "Informacion Modificada",
                    text: response.data.message,
                    showConfirmButton: true,
                    customClass: {
                        title: "swal_title",
                        icon: "swal_icon",
                        htmlContainer: "swal_text",
                        confirmButton: "swal_confirm"
                    }
                });
            } catch(error){
                console.log(error);
                if(error.response?.status == 401){
                    await refreshAccessToken(handleChangeInformation, e);
                }
            } finally{
                setLoading(false);
            }
        }*/
        setLoading(false);
    }

    const handleChangeVisibility = async e => {
        e.preventDefault();
    }

    const changeActiveOption = type => {
        setActiveOption(type);
        setErrorsHandler({});
    }

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
                {activeOption === "Informacion" && "Crear Ingrediente"}
                {activeOption === "Visibilidad" && "Cambiar Visibilidad"}
            </h3>

            <RightSidebarErrors errors={errorsHandler} />

            {activeOption === "Informacion" && (
                <RightSidebarForms twoOnOne={true} action={handleChangeInformation} formOptions={ManageIngredientsFormOptions} setData={setIngredientData} data={ingredientData}>
                    <MainButton disabled={loading} type="submit" icon="nutrition" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={loading ? "Creando..." : "Crear Ingrediente"} />
                </RightSidebarForms> 
            )}

            {activeOption === "Visibilidad" && (isStaff || isSuperUser) && (
                <RightSidebarForms action={handleChangeVisibility} formOptions={IngredientVisibilityOptions} setData={setVisibilityData} data={visibilityData}>
                    <MainButton disabled={loading} type="submit" icon="eye" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={loading ? "Cambiando..." : "Cambiar Visibilidad"} />
                </RightSidebarForms>
            )}
        </div>
    )
}