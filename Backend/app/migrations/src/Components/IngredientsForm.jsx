import RightSidebarErrors from "./RightSidebarErrors";
import styles from "./IngredientsForm.module.css";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import OptionButton from "./OptionButton";
import RightSidebarForms from "./RightSidebarForms";
import MainButton from "./MainButton";
import { validateIngredientData, validateIngredientOptionData } from "./utils/validators";
import Swal from "sweetalert2";
import backendAPI from "../api/axiosConfig";
import { useRightSidebar } from "../context/RightSidebarProvider";
import { useUpdateData } from "../context/UpdateDataProvider";
import CardButton from "./CardButton";


export default function IngredientsForm(){
    const [ activeOption, setActiveOption ] = useState("Informacion");
    const [ loading, setLoading ] = useState(false);
    const [ errorsHandler, setErrorsHandler ] = useState({});
    const { refreshAccessToken, isSuperUser, isStaff } = useAuth();
    const { ingredientModify } = useRightSidebar();
    const [ ingredientPortionModify, setIngredientPortionModify ] = useState({});
    const { setCreatedIngredient, setUpdatedIngredient } = useUpdateData();
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
        { type: 'number', name: 'escala_agua', label: "Peso con respecto al agua" },
        { type: "imageSingle", name: "imagenIngrediente", label: "Imagen del ingrediente (Opcional):", imageData: imagen, setImageData: setImagen }
    ];

    const IngredientVisibilityOptions = [
        { type: "toggle", trueOption: "Global", falseOption: "Personal", name: "visibilidad", label: "Visibilidad:", defaultOption: "Personal"}
    ];

    const CreateIngredientOptionFormOptions = [
        { type: "text", name: "nombre", label: "Nombre de porcion:"},
        { type: "number", name: "cantidad", label: "Cantidad de porcion (g o ml):"},
    ];

    const options = [
        { type: 'Informacion', icon: 'nutrition', label: 'Ingrediente', visibleOnCreate: true },
        { type: 'Visibilidad', icon: 'eye', label: 'Visibilidad', visibleOnCreate: true },
        { type: 'Opcion_pers', icon: 'scale', label: 'Crear Porc.', visibleOnCreate: false },
        { type: 'porciones', icon: 'bookmarks', label: 'Porciones', visibleOnCreate: false },
    ];

    const [ ingredientData, setIngredientData ] = useState({
        nombre: "",
        consistencia: "Liquido",
        calorias: '0',
        carbohidratos: '0',
        proteinas: '0',
        grasasSaturadas: '0',
        grasasInsaturadas: '0',
        grasasTrans: '0',
        sodio: '0',
        escala_agua: 1.0
    });
    const [ visibilityData, setVisibilityData ] = useState({
        visibilidad: "Personal",
    });
    const [ ingredientOptionData, setIngredientOptionData ] = useState({
        nombre: "",
        cantidad: 0,
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
                formData.append('calorias', parseFloat(ingredientData.calorias)/100);
                formData.append('carbohidratos', parseFloat(ingredientData.carbohidratos)/100);
                formData.append('proteinas', parseFloat(ingredientData.proteinas)/100);
                formData.append('grasas_saturadas', parseFloat(ingredientData.grasasSaturadas)/100);
                formData.append('grasas_insaturadas', parseFloat(ingredientData.grasasInsaturadas)/100);
                formData.append('grasas_trans', parseFloat(ingredientData.grasasTrans)/100);
                formData.append('sodio', parseFloat(ingredientData.sodio)/100);
                formData.append('tipo', visibilityData.visibilidad.toLowerCase());
                formData.append("escala_agua", parseFloat(ingredientData.escala_agua));
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
                        sodio: '0',
                        escala_agua: 1.0,
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

    const handleCreateIngredientPortion = async e => {
        e.preventDefault();
        setLoading(true);
        let errors = validateIngredientOptionData(ingredientOptionData);
        setErrorsHandler(errors);
        if(Object.keys(errors).length === 0){
            try{
                if(willUserModifyIngredient){
                    const response = await backendAPI.post(`ingredientes_opciones/`, {
                        ingrediente: ingredientModify?.id,
                        cantidad: ingredientOptionData.cantidad,
                        nombre: ingredientOptionData.nombre,
                    });
                    ingredientModify.opciones.push(response.data);
                    setUpdatedIngredient(ingredientModify);
                    Swal.fire({
                        icon: "success",
                        title: "Porcion de ingrediente creada",
                        text: 'Se ha creado esta porcion de ingrediente, ya se puede utilizar en recetas!',
                        showConfirmButton: true,
                        customClass: {
                            title: "swal_title",
                            icon: "swal_icon",
                            htmlContainer: "swal_text",
                            confirmButton: "swal_confirm"
                        }
                    });
                    setIngredientOptionData({
                        nombre: "",
                        cantidad: 0,
                    })
                }
            } catch(error){
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

    const handleUpdateIngredientPortion = async e => {
        e.preventDefault();
        setLoading(true);
        let errors = validateIngredientOptionData(ingredientOptionData);
        setErrorsHandler(errors);
        if(Object.keys(errors).length === 0){
            try{
                if(willUserModifyIngredient && Object.keys(ingredientPortionModify).length > 0){
                    const response = await backendAPI.patch(`ingredientes_opciones/${ingredientPortionModify.id}/`, {
                        cantidad: ingredientOptionData.cantidad,
                        nombre: ingredientOptionData.nombre,
                    });
                    ingredientModify.opciones = ingredientModify.opciones.map(opcion => opcion.id != response.data.id ? opcion : response.data);
                    setUpdatedIngredient(ingredientModify);
                    Swal.fire({
                        icon: "success",
                        title: "Porcion de ingrediente modificada",
                        text: 'Se ha modificado esta porcion de ingrediente!',
                        showConfirmButton: true,
                        customClass: {
                            title: "swal_title",
                            icon: "swal_icon",
                            htmlContainer: "swal_text",
                            confirmButton: "swal_confirm"
                        }
                    });
                    setIngredientOptionData({
                        nombre: "",
                        cantidad: 0,
                    });
                    setIngredientPortionModify({});
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

    const setIngredientOptionUpdate = opcion => {
        setIngredientPortionModify(opcion);
        setIngredientOptionData({ nombre: opcion.nombre, cantidad: opcion.cantidad });
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
                sodio: ingredientModify?.sodio,
                escala_agua: ingredientModify?.escala_agua
            });
            setIngredientOptionData({
                nombre: ingredientModify?.nombre,
                cantidad: 0,
            })
            setVisibilityData({ visibilidad: ingredientModify?.tipo?.replace(/^./, char => char.toUpperCase()) });
        } else{
            setActiveOption('Informacion');
            setIngredientData({
                nombre: "",
                consistencia: "Liquido",
                calorias: 0,
                carbohidratos: 0,
                proteinas: 0,
                grasasSaturadas: '0',
                grasasInsaturadas: '0',
                grasasTrans: '0',
                sodio: 0,
                escala_agua: 1.0
            });
            setVisibilityData({ visibilidad: "Personal" });
        }
    }, [ingredientModify, willUserModifyIngredient]);

    const deleteIngredientAsk = (ingredient) => {
        Swal.fire({
            title: "Eliminar Porcion",
            icon: "question",
            text: `Estas seguro de eliminar la porcion '${ingredient.nombre}' de '${ingredientModify.nombre}'`,
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
            await backendAPI.delete(`ingredientes_opciones/${ingredient.id}/`);
            Swal.fire({
                icon: "success",
                title: "Eliminado!",
                text: `La porcion personalizada '${ingredient.nombre}' fue eliminado con exito`,
                showConfirmButton: true,
                customClass: {
                    title: "swal_title",
                    icon: "swal_icon",
                    htmlContainer: "swal_text",
                    confirmButton: "swal_confirm"
                }
            });
            ingredientModify.opciones = ingredientModify.opciones.filter(opcion => opcion.id != ingredient.id);
            setUpdatedIngredient(ingredientModify);
        } catch(error){
            if(error.response?.status == 401){
                await refreshAccessToken(deleteIngrediente, ingredient);
            }
        }
    }

    return(
        <div className={styles.changeProfileForm}>

            {(isStaff || isSuperUser) && <div className={styles.formOptions}>
                {options.map(option => (
                    (option.visibleOnCreate || willUserModifyIngredient) && <OptionButton 
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
                {activeOption === "Opcion_pers" && willUserModifyIngredient && "Crear porcion personalizada"}
                {activeOption === "porciones" && willUserModifyIngredient && "Porciones Disponibles"}
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

            { activeOption === 'Opcion_pers' && willUserModifyIngredient && (
                <RightSidebarForms twoOnOne={false} action={handleCreateIngredientPortion} formOptions={CreateIngredientOptionFormOptions} setData={setIngredientOptionData} data={ingredientOptionData}>
                    <MainButton disabled={loading} type="submit" icon="scale" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={loading ? "Creando..." : "Crear porcion"} />
                </RightSidebarForms>
            )}

            { activeOption === 'porciones' && willUserModifyIngredient && (
                <div className={styles.opcionContainer}>
                {ingredientModify.opciones.length <= 0 && Object.keys(ingredientPortionModify).length == 0 && <p className={styles.noOptions}>No se han creado porciones personalizadas para este ingrediente, comienza creando una.</p>}
                {ingredientModify.opciones.length > 0 && Object.keys(ingredientPortionModify).length == 0 && ingredientModify.opciones.map(opcion => <div className={styles.opcionItem} key={opcion.id}><h5 className={styles.opcionNombre}>{opcion.nombre}</h5><p className={styles.opcionCantidad}>{`${opcion.cantidad} ${ingredientModify.consistencia == 'solido' ? "Gramos" : "Mililitros"}`}</p>                    
                        <CardButton
                            text="Editar"
                            hoverWidth="8rem"
                            top={.5}
                            left={3}
                            icon="create"
                            onClick={() => setIngredientOptionUpdate(opcion)}
                            backgroundColor="#ea7000"
                        />
                        <CardButton
                            text="Eliminar"
                            hoverWidth="9rem"
                            top={4.8}
                            left={3}
                            icon="trash"
                            onClick={() => deleteIngredientAsk(opcion)}
                            backgroundColor="#ea7000"
                        />
                    </div>
                )}
                { Object.keys(ingredientPortionModify).length > 0 
                  && <RightSidebarForms twoOnOne={false} action={handleUpdateIngredientPortion} formOptions={CreateIngredientOptionFormOptions} setData={setIngredientOptionData} data={ingredientOptionData}>
                    <MainButton disabled={loading} type="submit" icon="scale" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={loading ? "Actualizando..." : "Actualizar porcion"} />
                    <div className={styles.cancelButton} onClick={() => setIngredientPortionModify({})}>
                        <MainButton disabled={false} type="button" icon="close" iconSize="3" fontSize="2.5" color="cancel" borderRadius="1.5" text={"Cancelar"} />
                    </div>
                </RightSidebarForms>
                }
                </div>
            )}
        </div>
    )
}