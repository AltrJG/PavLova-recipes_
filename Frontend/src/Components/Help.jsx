import styles from "./Help.module.css"


export default function Help({title, description, children}){
    return(
        <div className={styles.helpContainers}>
            <div className={styles.help}>
                <h1 className={styles.title}>{title}</h1>
                <h4 className={styles.description}>{description}</h4>
            </div>
            <div className={styles.changeUserData}>
                {children}
            </div>
        </div>
    )
}