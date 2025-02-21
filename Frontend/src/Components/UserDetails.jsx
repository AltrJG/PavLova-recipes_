import { Link } from "react-router-dom"
import tempUserPic from "../assets/smile.png"
import styles from "./UserDetails.module.css"
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";

export default function UserDetails(){

    const { user } = useAuth();

    return(
        <div className={styles.userDetailsContainer}>
            <div className={styles.allUserData}>
                <div className={styles.userData}>
                    <img className={styles.userProfilePicture} src={tempUserPic}/>
                    <div className={styles.userDataText}>
                        <h5>{user?.nombre}</h5>
                        <p>{user?.pais}</p>
                    </div>
                </div>
                <div className={styles.userStats}>
                    <div className={styles.userSingleStat}>
                        <ion-icon name="book"></ion-icon>
                        <h5 className={styles.userAmountStat}>50</h5>
                        <p className={styles.userStatDescription}>Recetas creadas</p>
                    </div>
                    <div className={`${styles.userSingleStat} ${styles.userSecondStat}`}>
                        <ion-icon name="heart"></ion-icon>
                        <h5 className={styles.userAmountStat}>50</h5>
                        <p className={styles.userStatDescription}>Recetas Favoritas</p>
                    </div>
                </div>
                <div className={styles.userBio}>
                    <div className={styles.userSingleBio}>
                        <h6 className={styles.userBioSubtitle}>Sobre Mi</h6>
                        <p className={styles.userBioText}>{user?.sobreMi == "" ? '- Aun no has agregado una descripcion, puedes agregarla cambiando tu informacion personal - ' : user?.sobreMi}</p>
                    </div>
                </div>
                <div className={styles.userSocialMedia}>
                    {user?.redFacebook != "" && <Link className={styles.socialMediaLink} target="_blank" to={user?.redFacebook}><ion-icon name="logo-facebook"></ion-icon></Link> }
                    {user?.redTwitter != "" && <Link className={styles.socialMediaLink} target="_blank" to={user?.redTwitter}><ion-icon name="logo-twitter"></ion-icon></Link> }
                    {user?.redYoutube != "" && <Link className={styles.socialMediaLink} target="_blank" to={user?.redYoutube}><ion-icon name="logo-youtube"></ion-icon></Link> }
                </div>
            </div>
        </div>
    )
}