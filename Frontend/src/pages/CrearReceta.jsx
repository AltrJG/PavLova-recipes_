import { useEffect, useState } from 'react';
import BurbujaCanvas from '../Components/BurbujaCanvas';
import RecetaFormOptions from '../Components/RecetaFormOptions';
import styles from './CrearReceta.module.css';
import RecetaInfoGeneralForm from '../Components/RecetaInfoGeneralForm';
import Help from '../Components/Help';
import MainButton from '../Components/MainButton';
import { useNavigate } from 'react-router-dom';
import tempImage from '../assets/manzana_test.png';
import EnrichedTextRecipe from '../Components/EnrichedTextRecipe';
import RecetaCategoriaForm from '../Components/RecetaCategoriaForm';
import backendAPI from '../api/axiosConfig';
import SelectorIngredientes from '../Components/SelectorIngredientes';
import { FadeLoader } from 'react-spinners';
import { useAuth } from '../context/AuthProvider';
import Swal from 'sweetalert2';

export default function CrearReceta() {

  const [active, setActive] = useState('info');
  const { refreshAccessToken, user, isStaff, isSuperUser } = useAuth();
  const [ loading, setLoading ] = useState(true);
  const [ ingredientOptions, setIngredientOptions ] = useState([]);
  const [ categorias, setCategorias ] = useState([]);
  const [ etiquetasOptions, setEtiquetasOptions ] = useState([]);
  const [ activeIngredientOptions, setActiveIngredientOptions ] = useState([]);
  const navigate = useNavigate();

  const [generalRecipeData, setGeneralRecipeData] = useState({
    nombre: '',
    frase: '',
    tiempo_preparado: '',
    tiempo_cocinado: '',
    imagenReceta: null
  });

  const datosDummy = [
    { id: 1, nombre: "Comida Frita", imagen: tempImage },
    { id: 2, nombre: "Postre", imagen: tempImage },
    { id: 3, nombre: "Arroz", imagen: tempImage },
    { id: 4, nombre: "Ensalada", imagen: tempImage },
    { id: 5, nombre: "Espagueti", imagen: tempImage },
    { id: 6, nombre: "Sopa", imagen: tempImage },
  ];

  const etiquetasRecetas = [
    { id: 1, nombre: "Económico" },
    { id: 2, nombre: "Vegano" },
    { id: 3, nombre: "Sin Gluten" },
    { id: 4, nombre: "Bajo en Calorías" },
    { id: 5, nombre: "Rápido" },
    { id: 6, nombre: "Fácil" },
    { id: 7, nombre: "Saludable" },
    { id: 8, nombre: "Sin Lactosa" },
    { id: 9, nombre: "Bajo en Carbohidratos" },
    { id: 10, nombre: "Postre" }
];

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
  }, []);

  const handleIngredientesSeleccionados = ingredientesActivos => {
    let newIngredients = ingredientesActivos.map(ingrediente => {
      if(activeIngredientOptions.findIndex(ingred => ingred.id == ingrediente.id) == -1){
        return{
          value: ingrediente.value,
          label: ingrediente.label,
          image: ingrediente.image,
          consistencia: ingrediente.consistencia,
          id: ingrediente.id,
          cantidad: 0,
          tipoMetrica: 'numerica'
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
    console.log("i exist");
    setLoading(true);
    //let errors = validateUserData(userData);
    //setErrorsHandler(errors);
    //if(Object.keys(errors).length === 0){
        try{
            const recetaPayload = {
              nombre: generalRecipeData.nombre,
              frase: generalRecipeData.frase,
              tiempo_preparado: generalRecipeData.tiempo_preparado,
              tiempo_cocinado: generalRecipeData.tiempo_cocinado,
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
            const response = await backendAPI.post('recetas/', recetaPayload);
            console.log(response.data);
            Swal.fire({
                icon: "success",
                title: "Receta Creada",
                text: `Se ha creado la receta '${generalRecipeData.nombre}' con exito!`,
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
                await refreshAccessToken(createReceta, e);
            }
        } finally{
            setLoading(false);
        }
    //}
    setLoading(false);
}

  if(loading) return <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>;

  return (
    <div className={styles.container}>
      <BurbujaCanvas />
      <Help title={"Crear o Editar receta"} description={"Crea o modifica la receta seleccionada"}>
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
            <EnrichedTextRecipe recetaProceso={richTextRecipe} setRecetaProceso={setRichTextRecipe}/>
          </div>
        </div>
      </div>
      <div className={styles.createButtonCenter}>
        <MainButton action={createReceta} disabled={false} type={'button'} icon={"restaurant"} iconSize={"4.5"} fontSize={"3"} color={"primary"} borderRadius={'1'} text={"Crear Receta"}/>
      </div>
      <div className='mobileSpace'></div>
    </div>
  );
}