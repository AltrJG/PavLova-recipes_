import CardButton from './CardButton'
import styles from './PreconfiguracionIA.module.css'

export default function PreconfiguracionIA({ isDataOnForm = false, data, activeSetting = -1, handleSetting }){
    return(
        <div onClick={() => isDataOnForm && handleSetting(data.id)} className={`${!isDataOnForm ? styles.preconfiguracionNoFormContainer : ""} ${styles.preconfiguracionContainer} ${isDataOnForm && (activeSetting == data.id) && styles.activeSetting}`}>
            {!isDataOnForm && <CardButton 
                text="Info. Nutricional"
                hoverWidth="13rem"
                top={5}
                left={3}
                icon="nutrition"
                onClick={() => console.log("Yes")}
            />}   
            {!isDataOnForm && <CardButton 
                text="Info. Nutricional"
                hoverWidth="13rem"
                top={.5}
                left={3}
                icon="nutrition"
                onClick={() => console.log("Yes")}
            />}   
            <h3 className={styles.title}>{data.title}</h3>
            <p className={styles.description}>{data.description}</p>
            <div className={styles.preconfiguracionPorcentajes}>
                <p className={styles.preconfiguracionPorcentaje}>SO: <span>{data.sodio}%</span></p>
                <p className={styles.preconfiguracionPorcentaje}>PR: <span>{data.proteinas}%</span></p>
                <p className={styles.preconfiguracionPorcentaje}>CA: <span>{data.carbohidratos}%</span></p>
                <p className={styles.preconfiguracionPorcentaje}>GS: <span>{data.grasas_saturadas}%</span></p>
                <p className={styles.preconfiguracionPorcentaje}>GI: <span>{data.grasas_insaturadas}%</span></p>
                <p className={styles.preconfiguracionPorcentaje}>GT: <span>{data.grasas_trans}%</span></p>
            </div>
        </div>
    )
}