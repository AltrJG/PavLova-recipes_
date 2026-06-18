import CardButton from './CardButton'
import styles from './PreconfiguracionIA.module.css'

export default function PreconfiguracionIA({deleteAction = null, editAction = null, isDataOnForm = false, data, activeSetting = -1, handleSetting }){
    return(
        <div onClick={() => isDataOnForm && handleSetting(data.id)} className={`${!isDataOnForm ? styles.preconfiguracionNoFormContainer : ""} ${styles.preconfiguracionContainer} ${isDataOnForm && (activeSetting == data.id) && styles.activeSetting}`}>
            {!isDataOnForm && <CardButton 
                text="Eliminar Preajuste"
                hoverWidth="14rem"
                top={5}
                left={3}
                icon="trash"
                onClick={() => deleteAction(data.nombre, data.id)}
            />}   
            {!isDataOnForm && <CardButton 
                text="Editar Preajuste"
                hoverWidth="13rem"
                top={.5}
                left={3}
                icon="create"
                onClick={() => editAction(data)}
            />}   
            <h3 className={styles.title}>{data.nombre}</h3>
            <p className={styles.description}>{data.descripcion}</p>
            <div className={styles.preconfiguracionPorcentajes}>
                <p className={styles.preconfiguracionPorcentaje}>SO: <span>{data.objetivo_sodio}%</span></p>
                <p className={styles.preconfiguracionPorcentaje}>PR: <span>{data.objetivo_proteina}%</span></p>
                <p className={styles.preconfiguracionPorcentaje}>CA: <span>{data.objetivo_carbohidrato}%</span></p>
                <p className={styles.preconfiguracionPorcentaje}>GS: <span>{data.objetivo_grasa_saturada}%</span></p>
                <p className={styles.preconfiguracionPorcentaje}>GI: <span>{data.objetivo_grasa_insaturada}%</span></p>
                <p className={styles.preconfiguracionPorcentaje}>GT: <span>{data.objetivo_grasa_trans}%</span></p>
            </div>
        </div>
    )
}