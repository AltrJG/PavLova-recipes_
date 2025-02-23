import styles from "./UserCard.module.css";
import tempUserPic from "../assets/smile.png"
import { useRightSidebar } from "../context/RightSidebarProvider";

export default function UserCard({ changeUserPermissions }){

    const { openUpdatePermissions } = useRightSidebar();

    return(
        <div className={styles.cardContainer}>
            <div className={styles.userContainer}>
                <div className={styles.userCardImage}>
                    <img src={tempUserPic}/>
                </div>
                <div className={styles.userCardData}>
                    <h2 className={styles.userCardDataName}>Brandon Yahir Castañeda Godinez</h2>
                    <p className={styles.userCardDataCountry}>Mexico</p>
                    <p className={`${styles.userCardDataType} ${styles.typeUser}`}>Usuario</p>
                </div>
            </div>
            {changeUserPermissions && <div className={styles.userCardActions}>
                <button onClick={openUpdatePermissions} className={styles.userCardButton}>Cambiar Informacion</button>
            </div> }
        </div>
    )
}