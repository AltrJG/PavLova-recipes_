import styles from './OptionButton.module.css';

export default function OptionButton({isBackgroundBlack, option, setData, active}){
    return(
        <button
            key={option.type}
            onClick={() => setData(option.type)}
            type="button"
            className={`${isBackgroundBlack ? styles.button_search_white : ""} ${styles.button_search_type} ${active === option.type && styles.selected}`}
            aria-label={`Buscar por ${option.label}`}
        >
            <ion-icon name={active === option.type ? option.icon : `${option.icon}-outline`}></ion-icon>
            {option.label}
        </button>
    )
}