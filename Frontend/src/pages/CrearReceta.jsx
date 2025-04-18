import { useState } from 'react';
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

export default function CrearReceta() {

  const [active, setActive] = useState('info');
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
          <div className={`${styles.section} ${active === "proced" ? styles.activeSection : ""}`}>
            <h2 className={styles.formInfoGeneral}>Procedimiento</h2>
            <EnrichedTextRecipe recetaProceso={richTextRecipe} setRecetaProceso={setRichTextRecipe}/>
          </div>
          <div className={`${styles.section} ${active === "clas" ? styles.activeSection : ""} ${active === "clas" ? styles.sliderForm : ""}`}>
            <h2 className={styles.formInfoGeneral}>Clasificaciones</h2>
            <RecetaCategoriaForm activeEtiquetas={etiquetas} etiquetas={etiquetasRecetas} toggleEtiquetas={toggleEtiquetas} categorias={datosDummy} setActiveCategoria={setActiveCategoria} activeCategoria={activeCategoria}/>
          </div>
        </div>
      </div>
      <div className={styles.createButtonCenter}>
        <MainButton action={volver} disabled={false} type={'button'} icon={"restaurant"} iconSize={"4.5"} fontSize={"3"} color={"primary"} borderRadius={'1'} text={"Crear Receta"}/>
      </div>
    </div>
  );
}