import { Link } from "react-router-dom";
import MainButton from "../Components/MainButton";
import styles from './NotFound404.module.css';
import badPavlova from '../assets/mala_pavlova.png';

export default function NotFound404({text = "No se encontro la pagina que buscabas."}){
    return(
        <div className={styles.notFoundContainer}>
            <img src={badPavlova}/>
            <h3 className={styles.notFoundDetails}>{text}</h3>
            <Link to={'/'} className={styles.notFoundBack}><MainButton disabled={false} type="button" icon="arrow-back" iconSize="2.5" fontSize="2" color="primary" borderRadius="1.5" text={"Volver a inicio"} /></Link>
        </div>
    )
}