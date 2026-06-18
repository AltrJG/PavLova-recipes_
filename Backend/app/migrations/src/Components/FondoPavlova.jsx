import fondoUltimate from '../assets/fondo_pavlova_ultimate.png';
import styles from './FondoPavlova.module.css';
import circuloSmall from '../assets/fondo_light/circulo_small.png';
import diagonal from '../assets/fondo_light/diagonal.png';
import pavlova_circulo from '../assets/fondo_light/pavlova_circulo.png';

export default function FondoPavlova(){
    return(
        <div className={styles.fondoContainer}>
            <div className={styles.smallCircleGroup1}>
                <img src={circuloSmall} className={styles.smallCircle}/>
                <img src={circuloSmall} className={styles.smallCircle}/>
                <img src={circuloSmall} className={styles.smallCircle}/>
                <img src={circuloSmall} className={styles.smallCircle}/>
                <img src={circuloSmall} className={styles.smallCircle}/>
            </div>
            <div className={styles.smallCircleGroup2}>
                <img src={circuloSmall} className={styles.smallCircle}/>
                <img src={circuloSmall} className={styles.smallCircle}/>
                <img src={circuloSmall} className={styles.smallCircle}/>
                <img src={circuloSmall} className={styles.smallCircle}/>
                <img src={circuloSmall} className={styles.smallCircle}/>
                <img src={circuloSmall} className={styles.smallCircle}/>
            </div>
            <div className={styles.smallCircleGroup4}>
                <img src={circuloSmall} className={styles.smallCircle}/>
                <img src={circuloSmall} className={styles.smallCircle}/>
                <img src={circuloSmall} className={styles.smallCircle}/>
                <img src={circuloSmall} className={styles.smallCircle}/>
                <img src={circuloSmall} className={styles.smallCircle}/>
                <img src={circuloSmall} className={styles.smallCircle}/>
            </div>
            <div className={styles.smallCircleGroup3}>
                <img src={circuloSmall} className={styles.smallCircle}/>
                <img src={circuloSmall} className={styles.smallCircle}/>
                <img src={circuloSmall} className={styles.smallCircle}/>
                <img src={circuloSmall} className={styles.smallCircle}/>
                <img src={circuloSmall} className={styles.smallCircle}/>
            </div>
            <img src={diagonal} className={styles.diagonal}/>
            <img src={diagonal} className={styles.diagonal2}/>
            <img src={pavlova_circulo} className={styles.pavlova_circulo}/>
        </div>
    )
}