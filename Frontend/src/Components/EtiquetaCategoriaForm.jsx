import { useEffect, useState } from 'react';
import styles from './EtiquetaCategoriaForm.module.css';
import MainButton from './MainButton';
import OptionButton from './OptionButton';
import RightSidebarErrors from './RightSidebarErrors';
import RightSidebarForms from './RightSidebarForms';
import { useRightSidebar } from '../context/RightSidebarProvider';
import { useAuth } from '../context/AuthProvider';
import { useUpdateData } from '../context/UpdateDataProvider';
import { validateEtiquetaCategoriaData } from './utils/validators';

export default function EtiquetaCategoriaForm(){

    const [ activeOption, setActiveOption ] = useState("Etiqueta");
    const [ loading, setLoading ] = useState(false);
    const [ errorsHandler, setErrorsHandler ] = useState({});
    const { refreshAccessToken, isSuperUser, isStaff } = useAuth();
    const { categoriaModify, etiquetaModify, categoriaEtiquetaModify } = useRightSidebar();
    const { setCreatedIngredient, setUpdatedIngredient } = useUpdateData();
    const [imagen, setImagen] = useState([]);

    const CategoriaFormOptions = [
        { type: "text", name: "nombre", label: "Nombre:"},
        { type: "imageSingle", name: "imagenCategoria", label: "Imagen de la categoria (Opcional):", imageData: imagen, setImageData: setImagen }
    ];

    const EtiquetaFormOptions = [
        { type: "text", name: "nombre", label: "Nombre:"},
    ];

    const options = [
        { type: 'Categoria', icon: 'library', label: 'Categoria' },
        { type: 'Etiqueta', icon: 'bookmarks', label: 'Etiqueta' },
    ];

    const [ categoriaData, setCategoriaData ] = useState({
        nombre: "",
    });
    const [ etiquetaData, setEtiquetaData ] = useState({
        nombre: "",
    });

    const handleChangeInformation = async e => {
        e.preventDefault();
        setLoading(true);
        let errors = validateEtiquetaCategoriaData(activeOption == 'Categoria' ? categoriaData : etiquetaData);
        setErrorsHandler(errors);
        if(Object.keys(errors).length === 0){
            /*const formData = new FormData();
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
            }*/
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
        if(categoriaEtiquetaModify){
            categoriaModify && setCategoriaData({nombre: categoriaEtiquetaModify.nombre});
            categoriaModify && setActiveOption('Categoria');
            etiquetaModify && setEtiquetaData({nombre: categoriaEtiquetaModify.nombre});
            etiquetaModify && setActiveOption('Etiqueta');
        } else{
            setCategoriaData({nombre: ""});
            setEtiquetaData({nombre: ""});
            setActiveOption("Etiqueta");
        }
    }, [categoriaEtiquetaModify])

    return(
        <div className={styles.changeProfileForm}>

            {(isSuperUser) && (!categoriaModify && !etiquetaModify) && <div className={styles.formOptions}>
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
                {activeOption === "Categoria" && (categoriaModify ? `Modificar Categoria '${categoriaEtiquetaModify?.nombre}'` : "Crear Categoria")}
                {activeOption === "Etiqueta" && (etiquetaModify ? `Modificar Etiqueta '${categoriaEtiquetaModify?.nombre}'` : "Crear Etiqueta")}
            </h3>

            <RightSidebarErrors errors={errorsHandler} />

            {activeOption === "Categoria" && isSuperUser && (
                <RightSidebarForms twoOnOne={false} action={handleChangeInformation} formOptions={CategoriaFormOptions} setData={setCategoriaData} data={categoriaData}>
                    <MainButton disabled={loading} type="submit" icon="library" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={loading ? (!categoriaModify ? "Creando..." : "Modificando...") : (!categoriaModify ? "Crear categoria" : "Modificar categoria")} />
                </RightSidebarForms> 
            )}

            {activeOption === "Etiqueta" && (isStaff || isSuperUser) && (
                <RightSidebarForms action={handleChangeVisibility} formOptions={EtiquetaFormOptions} setData={setEtiquetaData} data={etiquetaData}>
                    <MainButton disabled={loading} type="submit" icon="bookmarks" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={loading ? (!etiquetaModify ? "Creando..." : "Modificando...") : (!etiquetaModify ? "Crear etiqueta" : "Modificar etiqueta")} />
                </RightSidebarForms>
            )}
        </div>
    )
}