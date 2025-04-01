import styles from './NutritionalTable.module.css';

export default function NutritionalTable({nutritionalData}){
    return(
    <div className={styles.ingredientNutritionalInformation}>
        {Object.entries(nutritionalData).map(entry => (
            <div key={entry[0]} className={styles.ingredientNutritionalFact}>
                <h5 className={styles.ingredientFact}>{entry[0]}:</h5>
                <h5 className={styles.ingredientValue}>{entry[1]}</h5>
            </div>
        ))}
    </div>
    )
}