import CategoriaSlider from './CategoriaSlider';
import styles from './RecetaCategoriaForm.module.css';

export default function RecetaCategoriaForm({categorias, etiquetas, activeCategoria, setActiveCategoria, activeEtiquetas, toggleEtiquetas}){
    return(
        <div className={styles.recetaCategoriaFormContainer}>
            <h2 className={styles.formTitle}>Selecciona una Categoria para la receta</h2>
            <div className={styles.recetaCategoriaFormSlider}>
                <CategoriaSlider categorias={categorias} setActiveCategoria={setActiveCategoria} activeCategoria={activeCategoria}/>
            </div>
            <div className={styles.recetaCategoriaFormEtiquetas}>
                <h2 className={styles.formTitle}>Selecciona las etiquetas para la receta</h2>
                <div className={styles.etiquetasContainer}>
                    {etiquetas.map(etiqueta => <p onClick={() => toggleEtiquetas(etiqueta.id)} key={etiqueta.id} className={`${(activeEtiquetas.findIndex(etiq => etiq == etiqueta.id) != -1) ? styles.activeEtiqueta : ""} ${styles.etiquetaOption}`}>{etiqueta.nombre}</p>)}
                </div>
            </div>
        </div>
    )
}