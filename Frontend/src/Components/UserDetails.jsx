import { Link } from "react-router-dom"
import tempUserPic from "../assets/smile.png"
import styles from "./UserDetails.module.css"
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import CircleButton from "./CircleButton";

export default function UserDetails({ usuario = null }){

    const { user } = useAuth();
    const userData = (usuario != null ? usuario : user);

    return(
        <div className={styles.userDetailsContainer}>
            <div className={styles.allUserData}>
                <div className={styles.userData}>
                    <img className={styles.userProfilePicture} src={userData?.fotoPerfil}/>
                    <div className={styles.userDataText}>
                        <h5>{userData?.nombre}</h5>
                        <p>{userData?.pais}</p>
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
                        <p className={styles.userBioText}>{userData?.sobreMi == "" ? '- Aun no se ha agregado una descripcion - ' : userData?.sobreMi}</p>
                    </div>
                </div>
                <div className={styles.userBio}>
                    <div className={styles.userSingleBio}>
                        <h6 className={styles.userBioSubtitle}>Mi Correo</h6>
                        <p className={styles.userBioText}>{userData?.email}</p>
                    </div>
                </div>
                <div className={styles.userSocialMedia}>
                    {userData?.redFacebook != "" && <Link target="_blank" to={userData?.redFacebook}><CircleButton iconSize="3rem" text="Perfil de Facebook" iconName="logo-facebook"/></Link> }
                    {userData?.redTwitter != "" && <Link  target="_blank" to={userData?.redTwitter}><CircleButton iconSize="3rem" text="Perfil de X" iconName="logo-twitter"/></Link> }
                    {userData?.redYoutube != "" && <Link  target="_blank" to={userData?.redYoutube}><CircleButton iconSize="3rem" text="Perfil de Youtube" iconName="logo-youtube"/></Link> }
                </div>
            </div>
        </div>
    )
}