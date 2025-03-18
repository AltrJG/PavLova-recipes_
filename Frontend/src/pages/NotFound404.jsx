import { Link } from "react-router-dom";
import MainButton from "../Components/MainButton";
import styles from './NotFound404.Module.css';

export default function NotFound404(){
    return(
        <div className={styles.notFoundContainer}>
            <h3 className={styles.notFoundDetails}>No se encontro la pagina que buscabas</h3>
            <Link to={'/'} className={styles.notFoundBack}><MainButton disabled={false} type="button" icon="arrow-back" iconSize="2.5" fontSize="2" color="primary" borderRadius="1.5" text={"Volver a inicio"} /></Link>
        </div>
    )
}