import styles from './Categoria.module.css';
import imagen from '../assets/manzana_test.png';
import CardButton from './CardButton';

export default function Categoria({ isSuperUser, actualizarCategoria }){

    const categoria = {
        nombre: 'Postre',
        imagen: imagen,
        id: 5
    }

    return(
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                <img src={categoria.imagen} alt={categoria.nombre} className={styles.image} />
            </div>
            <span className={styles.name}>{categoria.nombre}</span>
            {isSuperUser && <CardButton
                text="Editar"
                hoverWidth="8.5rem"
                top={1}
                left={1}
                icon="Create"
                onClick={() => actualizarCategoria(categoria)}
            />}  
            {isSuperUser && <CardButton
                text="Eliminar"
                hoverWidth="9rem"
                top={6}
                left={1}
                icon="Trash"
                onClick={() => console.log("yes")}
            />}  
        </div>
    )
}