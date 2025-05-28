import { useEffect, useState } from 'react';
import BurbujaCanvas from '../Components/BurbujaCanvas';
import RecetaFormOptions from '../Components/RecetaFormOptions';
import styles from './CrearReceta.module.css';
import RecetaInfoGeneralForm from '../Components/RecetaInfoGeneralForm';
import Help from '../Components/Help';
import MainButton from '../Components/MainButton';
import { useNavigate, useSearchParams } from 'react-router-dom';
import tempImage from '../assets/manzana_test.png';
import { validateRecetaData } from '../Components/utils/validators';
import EnrichedTextRecipe from '../Components/EnrichedTextRecipe';
import RecetaCategoriaForm from '../Components/RecetaCategoriaForm';
import backendAPI from '../api/axiosConfig';
import SelectorIngredientes from '../Components/SelectorIngredientes';
import { FadeLoader } from 'react-spinners';
import { useAuth } from '../context/AuthProvider';
import Swal from 'sweetalert2';
import RightSidebarErrors from '../Components/RightSidebarErrors';
import RotatingBall from '../Components/RotatingBall';
import { useUpdateData } from '../context/UpdateDataProvider';

export default function CrearReceta() {

  const [active, setActive] = useState('info');
  const [ searchParams ] = useSearchParams();
  const { refreshAccessToken, user, isStaff, isSuperUser } = useAuth();
  const { createdIngredient, resetIngredientState } = useUpdateData();
  const [ loading, setLoading ] = useState(true);
  const [ isUpdateActive, setIsUpdateActive ] = useState(false);
  const [ loadingRequest, setLoadingRequest ] = useState(false);
  const [ ingredientOptions, setIngredientOptions ] = useState([]);
  const [ categorias, setCategorias ] = useState([]);
  const [ etiquetasOptions, setEtiquetasOptions ] = useState([]);
  const [ activeIngredientOptions, setActiveIngredientOptions ] = useState([]);
  const [ errorsHandler, setErrorsHandler ] = useState([]);
  const navigate = useNavigate();

  const recetaEditar = searchParams.get("recetaEditar");

  const [generalRecipeData, setGeneralRecipeData] = useState({
    nombre: '',
    frase: '',
    tiempo_preparado: '',
    tiempo_cocinado: '',
    imagenReceta: null
  });

  const [ richTextRecipe, setRichTextRecipe ] = useState([
    {
      type: "paragraph",
      children: [{ text: "Its time to write some text..." }]
    }
  ])

  const [ etiquetas, setEtiquetas ] = useState([]);
  const [ imagen, setImagen ] = useState([]);
  const [ activeCategoria, setActiveCategoria ] = useState('');
  const [ porciones, setPorciones ] = useState(1);

  const volver = () => {
    navigate(-1);
  }

  const toggleEtiquetas = etiqueta => {
    setEtiquetas(prevEtiquetas => {
      const index = prevEtiquetas.findIndex(item => item === etiqueta);
      if(index === -1) {
          return [...prevEtiquetas, etiqueta];
      } else {
          return prevEtiquetas.filter(item => item !== etiqueta);
      }
  });
  }

  useEffect(() => {
    setLoading(true);
    const obtenerRecetaActualizar = async () => {
      try{
        const recetaActualizar = await backendAPI.get(`/recetas/${recetaEditar}`);
        console.log(recetaActualizar.data);
        setRichTextRecipe(JSON.parse(recetaActualizar.data.procedimiento));
        const ingredientesUpdate = recetaActualizar.data.ingredientes.map(ingrediente => {
            return {
                value: ingrediente.ingrediente.nombre,
                label: ingrediente.ingrediente.nombre,
                image: ingrediente.ingrediente.foto_ingrediente,
                consistencia: ingrediente.ingrediente.consistencia,
                id: ingrediente.ingrediente.id,
                cantidad: ingrediente.cantidad,
                tipoMetrica: ingrediente.unidad
            }
        });
        setGeneralRecipeData({
          nombre: recetaActualizar.data.nombre,
          frase: recetaActualizar.data.frase,
          tiempo_preparado: recetaActualizar.data.tiempo_preparacion,
          tiempo_cocinado: recetaActualizar.data.tiempo_coccion,
          imagenReceta: null
        });
        const etiquetasSeleccionadas = recetaActualizar.data.etiquetas_info.map(etiqueta => etiqueta.id);
        setEtiquetas(etiquetasSeleccionadas);
        setActiveCategoria(recetaActualizar.data.categoria_info.id);
        handleIngredientesSeleccionados(ingredientesUpdate);
        setPorciones(recetaActualizar.data.porciones);
        setIsUpdateActive(true);
      } catch(error){
        if(error.response?.status == 401){
          await refreshAccessToken(obtenerRecetaActualizar);
        }
      }
    }
    const obtenerInformacion = async () => {
      try{
        const ingredientes = await backendAPI.get('/ingredientes');
        const categorias = await backendAPI.get("/categorias/");
        const etiquetas = await backendAPI.get("/etiquetas/");
        setIngredientOptions(ingredientes.data.results);
        setCategorias(categorias.data.results);
        setEtiquetasOptions(etiquetas.data.results);
      }
      catch(error){
        console.log(error);
        if(error.response?.status == 401){
            await refreshAccessToken(obtenerInformacion);
        }
    } finally{
        setLoading(false);
    }
    };
    obtenerInformacion();
    if(recetaEditar != null){
      setLoading(true);
      obtenerRecetaActualizar();
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const updateIngredientOptions = async () => {
      if(Object.keys(createdIngredient).length != 0){
        const ingredientes = await backendAPI.get('/ingredientes');
        setIngredientOptions(ingredientes.data.results);
        resetIngredientState();
      }
    }
    updateIngredientOptions();
  }, [createdIngredient]);

  const handleIngredientesSeleccionados = ingredientesActivos => {
    let newIngredients = ingredientesActivos.map(ingrediente => {
      if(activeIngredientOptions.findIndex(ingred => ingred.id == ingrediente.id) == -1){
        return{
          value: ingrediente.value,
          label: ingrediente.label,
          image: ingrediente.image,
          consistencia: ingrediente.consistencia,
          id: ingrediente.id,
          cantidad: ingrediente.cantidad,
          tipoMetrica: ingrediente.tipoMetrica
        }
      }
      return null;
    }).filter(Boolean);
    let oldIngredients = activeIngredientOptions.map(ingrediente => {
      if(ingredientesActivos.findIndex(ingred => ingred.id == ingrediente.id) != -1){
        return ingrediente;
      }
      return null
    }).filter(Boolean);

    let ingredients = oldIngredients.concat(newIngredients);
    setActiveIngredientOptions(ingredients);
  }

  const handleFormChange = (id, field, value) => {
    setActiveIngredientOptions(prev =>
      prev.map(ingredient =>
          ingredient.id === id ? { ...ingredient, [field]: value } : ingredient
      )
  );
  }

  const removeIngredient = id => {
    let deletedIngredient = activeIngredientOptions.filter(ingredient => ingredient.id != id);
    setActiveIngredientOptions(deletedIngredient);
  }

  const createReceta = async e => {
    e.preventDefault();
    setLoadingRequest(true);

    // Preparar los datos para su analisis
    const recetaPayload = {
        nombre: generalRecipeData.nombre,
        frase: generalRecipeData.frase,
        tiempo_preparacion: generalRecipeData.tiempo_preparado,
        tiempo_coccion: generalRecipeData.tiempo_cocinado,
        porciones: porciones,
        ingredientes: activeIngredientOptions.map(ingrediente => ({
            ingrediente_id: ingrediente.id,
            cantidad: ingrediente.cantidad,
            unidad: ingrediente.tipoMetrica
        })),
        categoria: activeCategoria,
        etiquetas: etiquetas,
        procedimiento: JSON.stringify(richTextRecipe),
    };

    let errors = validateRecetaData(recetaPayload);
    setErrorsHandler(errors);
    if(Object.keys(errors).length === 0){
        setErrorsHandler({});
        try{
            const response = recetaEditar != null ? await backendAPI.put(`recetas/${recetaEditar}/`, recetaPayload) : await backendAPI.post('recetas/', recetaPayload);
            
            const recetaId = recetaEditar != null ? recetaEditar : response.data.id;

            await subirImagenReceta(recetaId);
            Swal.fire({
                icon: "success",
                title: recetaEditar ? "Actualizada" : "Receta Creada",
                text: `Se ha ${recetaEditar ? "actualizado" : "creado"} la receta '${generalRecipeData.nombre}' con exito!`,
                showConfirmButton: true,
                customClass: {
                    title: "swal_title",
                    icon: "swal_icon",
                    htmlContainer: "swal_text",
                    confirmButton: "swal_confirm"
                }
            });
            navigate('/mis_recetas');
        } catch(error){
            console.log(error);
            if(error.response?.status == 401){
                await refreshAccessToken(createReceta, e);
            }
        } finally{
            setLoadingRequest(false);
        }
    }
    setLoadingRequest(false);
}

const subirImagenReceta = async (recetaId) => {
  if (imagen && imagen.length > 0) {
    const formData = new FormData();
    formData.append('foto_receta', imagen[0]);  // Asegúrate que imagen es un File

    try {
      await backendAPI.put(`/recetas/${recetaId}/upload_imagen/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      console.error('Error al subir imagen:', error);
    }
  }
};

RecetaInfoGeneralForm


  return (
    <div className={styles.container}>
      <BurbujaCanvas />
      <RotatingBall />
      {loading 
      ? <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>
      : <><Help title={"Crear o Editar receta"} description={"Crea o modifica la receta seleccionada"}>
        <MainButton action={volver} disabled={false} type={'button'} icon={"arrow-back-circle"} iconSize={"2.5"} fontSize={"2"} color={"primary"} borderRadius={'1'} text={"Volver Atras"}/>
      </Help>
      <div className={styles.crearRecetaOptions}>
        <RecetaFormOptions activeOption={active} setActiveOption={setActive}/>
        <div className={styles.formContainer}>
          <div className={`${styles.section} ${active === "info" ? styles.activeSection : ""}`}>
            <RecetaInfoGeneralForm setImagen={setImagen} imagen={imagen} setData={setGeneralRecipeData} data={generalRecipeData}/>
          </div>
          <div className={`${styles.section} ${active === "clas" ? styles.activeSection : ""} ${active === "clas" ? styles.sliderForm : ""}`}>
            <h2 className={styles.formInfoGeneral}>Clasificaciones</h2>
            <RecetaCategoriaForm activeEtiquetas={etiquetas} etiquetas={etiquetasOptions} toggleEtiquetas={toggleEtiquetas} categorias={categorias} setActiveCategoria={setActiveCategoria} activeCategoria={activeCategoria}/>
          </div>
          <div className={`${styles.section} ${active === "ingre" ? styles.activeSection : ""}`}>
            <h2 className={styles.formInfoGeneral}>Ingredientes</h2>
            <SelectorIngredientes porciones={porciones} setPorciones={setPorciones} activeIngredients={activeIngredientOptions} removeIngredient={removeIngredient} handleFormChange={handleFormChange} handleChange={handleIngredientesSeleccionados} ingredientes={ingredientOptions}/>
          </div>
          <div className={`${styles.section} ${active === "proced" ? styles.activeSection : ""}`}>
            <h2 className={styles.formInfoGeneral}>Procedimiento</h2>
            <EnrichedTextRecipe recetaProceso={richTextRecipe} setRecetaProceso={setRichTextRecipe} isUpdateActive={isUpdateActive}/>
          </div>
        </div>
      </div>
      <div className={styles.createButtonCenter}>
        <RightSidebarErrors errors={errorsHandler} />
        <MainButton action={createReceta} disabled={loadingRequest} type={'button'} icon={"restaurant"} iconSize={"4.5"} fontSize={"3"} color={"primary"} borderRadius={'1'} text={loadingRequest ? (recetaEditar != null ? "Actualizando..." : "Creando...") : (recetaEditar ? "Actualizar Receta" : "Crear Receta")}/>
      </div>
      <div className='mobileSpace'></div></>}
    </div>
  );
}