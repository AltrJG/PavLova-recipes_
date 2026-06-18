import { useEffect, useState } from 'react';
import styles from './EtiquetaCategoriaForm.module.css';
import MainButton from './MainButton';
import OptionButton from './OptionButton';
import RightSidebarErrors from './RightSidebarErrors';
import RightSidebarForms from './RightSidebarForms';
import backendAPI from '../api/axiosConfig';
import { useRightSidebar } from '../context/RightSidebarProvider';
import { useAuth } from '../context/AuthProvider';
import Swal from "sweetalert2";
import { useUpdateData } from '../context/UpdateDataProvider';
import { validateEtiquetaCategoriaData } from './utils/validators';

export default function EtiquetaCategoriaForm(){

    const [ activeOption, setActiveOption ] = useState("Etiqueta");
    const [ loading, setLoading ] = useState(false);
    const [ errorsHandler, setErrorsHandler ] = useState({});
    const { refreshAccessToken, isSuperUser, isStaff } = useAuth();
    const { categoriaModify, etiquetaModify, categoriaEtiquetaModify } = useRightSidebar();
    const { setCreatedEtiqueta, setUpdatedEtiqueta, setCreatedCategoria, setUpdatedCategoria } = useUpdateData();
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
            const formData = new FormData();
            try{
                // Envio de informacion
                if(activeOption == 'Etiqueta'){
                    // Preparado de la informacion
                    formData.append('nombre', etiquetaData.nombre);

                    const response = etiquetaModify ? await backendAPI.put(`etiquetas/${categoriaEtiquetaModify.id}/`, formData) : await backendAPI.post("etiquetas/", formData);
                    Swal.fire({
                        icon: "success",
                        title: etiquetaModify ? "Etiqueta modificada" : "Etiqueta Creada",
                        text: etiquetaModify ? `Se ha modificado la etiqueta '${response.data.nombre}' con exito` : "Etiqueta Creada con exito",
                        showConfirmButton: true,
                        customClass: {
                            title: "swal_title",
                            icon: "swal_icon",
                            htmlContainer: "swal_text",
                            confirmButton: "swal_confirm"
                        }
                    });
                    !etiquetaModify && setEtiquetaData({nombre: ""});
                    etiquetaModify ? setUpdatedEtiqueta(response.data) : setCreatedEtiqueta(response.data);
                } else{
                    // Preparado de la informacion
                    formData.append('nombre', categoriaData.nombre);
                    if(imagen.length == 1){
                        formData.append('foto_categoria', imagen[0]);
                    }
                    // Preparado y envio de la peticion
                    const response = categoriaModify ? await backendAPI.put(`categorias/${categoriaEtiquetaModify.id}/`, formData) : await backendAPI.post("categorias/", formData);
                    Swal.fire({
                        icon: "success",
                        title: categoriaModify ? "Categoria modificada" : "Categoria Creada",
                        text: categoriaModify ? `Se ha modificado la categoria '${response.data.nombre}' con exito` : "Categoria Creada con exito",
                        showConfirmButton: true,
                        customClass: {
                            title: "swal_title",
                            icon: "swal_icon",
                            htmlContainer: "swal_text",
                            confirmButton: "swal_confirm"
                        }
                    });
                    !categoriaModify && setCategoriaData({nombre: ""});
                    setImagen([]);
                    categoriaModify ? setUpdatedCategoria(response.data) : setCreatedCategoria(response.data);
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
                <RightSidebarForms action={handleChangeInformation} formOptions={EtiquetaFormOptions} setData={setEtiquetaData} data={etiquetaData}>
                    <MainButton disabled={loading} type="submit" icon="bookmarks" iconSize="3" fontSize="2.5" color="secondary" borderRadius="1.5" text={loading ? (!etiquetaModify ? "Creando..." : "Modificando...") : (!etiquetaModify ? "Crear etiqueta" : "Modificar etiqueta")} />
                </RightSidebarForms>
            )}
        </div>
    )
}