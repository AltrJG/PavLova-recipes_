import styles from './Categoria.module.css';
import CardButton from './CardButton';

export default function Categoria({ isSuperUser, actualizarCategoria, categoria, preguntarEliminado }){

    return(
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                <img src={categoria.foto_categoria} alt={categoria.nombre} className={styles.image} />
            </div>
            <span className={styles.name}>{categoria.nombre}</span>
            {isSuperUser && <CardButton
                text="Editar"
                hoverWidth="8.5rem"
                top={1}
                left={2}
                icon="create"
                onClick={() => actualizarCategoria(categoria)}
            />}  
            {isSuperUser && <CardButton
                text="Eliminar"
                hoverWidth="9rem"
                top={6}
                left={2}
                icon="trash"
                onClick={() => preguntarEliminado(categoria, 'Categoria')}
            />}  
        </div>
    )
}