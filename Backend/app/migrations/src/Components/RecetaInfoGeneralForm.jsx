import OnPageForm from "./OnPageForm";
import styles from './RecetaInfoGeneralForm.module.css';

export default function RecetaInfoGeneralForm({data, imagen, setImagen, setData}){

    const informacionGeneralFormOptions = [
        { type: "text", name: "nombre", label: "Nombre:", onSide: false},
        { type: "textarea", name: "frase", label: "Frase:", onSide: false},
        { type: "number", name: "tiempo_preparado", label: "Tiempo para preparar la receta:", onSide: true},
        { type: "number", name: "tiempo_cocinado", label: "Tiempo para cocinar la receta:", onSide: true},
        { type: "imageSingle", name: "imagenReceta", label: "Imagen de la receta:", imageData: imagen, setImageData: setImagen }
    ];

    return(
        <>
        <h2 className={styles.formInfoGeneral}>Informacion General</h2>
        <OnPageForm formOptions={informacionGeneralFormOptions} data={data} setData={setData}/>
        </>
    )
}