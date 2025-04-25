import styles from './Etiqueta.module.css';
import CardButton from './CardButton';

export default function Etiqueta({ preguntarEliminado, actualizarEtiqueta, etiqueta }){

    return(
        <div className={styles.card}>
            <span className={styles.name}>{etiqueta.nombre}</span>
            <CardButton
                text="Editar"
                hoverWidth="8.5rem"
                top={1}
                left={2}
                icon="Create"
                onClick={() => actualizarEtiqueta(etiqueta)}
            />  
            <CardButton
                text="Eliminar"
                hoverWidth="9rem"
                top={6}
                left={2}
                icon="Trash"
                onClick={() => preguntarEliminado(etiqueta, 'Etiqueta')}
            />  
        </div>
    )
}