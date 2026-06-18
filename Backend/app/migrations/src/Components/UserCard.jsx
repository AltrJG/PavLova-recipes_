import styles from "./UserCard.module.css";
import tempUserPic from "../assets/smile.png"
import { useRightSidebar } from "../context/RightSidebarProvider";
import { Link } from "react-router-dom";

export default function UserCard({ changeUserPermissions, user }){

    const { openUpdatePermissions } = useRightSidebar();

    return(
        <div className={styles.cardContainer}>
            <Link to={`/user/${user.id}`} className={styles.userContainer}>
                <div className={styles.userCardImage}>
                    <img src={user.profile_picture}/>
                </div>
                <div className={styles.userCardData}>
                    <h2 className={styles.userCardDataName}>{user.name}</h2>
                    <p className={styles.userCardDataCountry}>{user.country}</p>
                    <p className={`${styles.userCardDataType} ${user.role == "Administrador" ? styles.typeAdmin : (user.role == "Moderador" ? styles.typeModerator : styles.typeUser)}`}>{user.role}</p>
                </div>
            </Link>
            {changeUserPermissions && <div className={styles.userCardActions}>
                <button onClick={() => openUpdatePermissions(user)} className={styles.userCardButton}>Cambiar Permisos</button>
            </div> }
        </div>
    )
}