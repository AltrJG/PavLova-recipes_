import styles from './Etiqueta.module.css';
import CardButton from './CardButton';

export default function Etiqueta({ actualizarEtiqueta }){

    const etiqueta = {
        nombre: 'Postre',
        id: 5
    }

    return(
        <div className={styles.card}>
            <span className={styles.name}>{etiqueta.nombre}</span>
            <CardButton
                text="Editar"
                hoverWidth="8.5rem"
                top={1}
                left={1}
                icon="Create"
                onClick={() => actualizarEtiqueta(etiqueta)}
            />  
            <CardButton
                text="Eliminar"
                hoverWidth="9rem"
                top={6}
                left={1}
                icon="Trash"
                onClick={() => console.log("yes")}
            />  
        </div>
    )
}