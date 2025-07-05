import { ReactSVG } from 'react-svg';
import styles from './RecetaFormOptions.module.css';

export default function RecetaFormOptions({activeOption, setActiveOption}){
    const recipeOptions = [
        { type: 'info', icon: 'information-circle', label: 'Informacion General', descripcion: "Agrega o cambia la informacion general de la receta" },
        { type: 'clas', icon: 'library', label: 'Clasificacion', descripcion: "Agrega o cambia la clasificacion de la receta" },
        { type: 'ingre', icon: 'nutrition', label: 'Ingredientes', descripcion: "Agrega o cambia los ingredientes que necesita la receta" },
        { type: 'proced', icon: 'document-text', label: 'Procedimiento', descripcion: "Agrega o cambia el procedimiento para la receta" },
    ];

    return(
        <div className={styles.recetaFormOptionsContainer}>
            {recipeOptions.map(option => <div onClick={() => setActiveOption(option.type)} key={option.type} className={`${activeOption == option.type ? styles.active : ""} ${styles.recetaFormOption}`}>
                <div className={styles.recetaFormOptionIcon}>
                    <ReactSVG src={`/src/assets/Iconos/${option.icon}${activeOption == option.type ? "" : "-outline"}.svg`}/>
                </div>
                <div className={styles.recetaFormOptionText}>
                    <h4 className={styles.recetaFormOptionTitle}>{option.label}</h4>
                    <p className={styles.recetaFormOptionDescription}>{option.descripcion}</p>
                </div>
            </div>
            )}
        </div>
    )
}