import { Link } from "react-router-dom"
import tempUserPic from "../assets/smile.png"
import styles from "./UserDetails.module.css"

export default function UserDetails(){
    return(
        <div className={styles.userDetailsContainer}>
            <div className={styles.allUserData}>
                <div className={styles.userData}>
                    <img className={styles.userProfilePicture} src={tempUserPic}/>
                    <div className={styles.userDataText}>
                        <h5>Brandon Yahir Castañeda Godinez</h5>
                        <p>Mexico</p>
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
                        <p className={styles.userBioText}>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Incidunt quod consequuntur fugit tempore, dolore quasi vitae. Cum ducimus tempore ipsum numquam qui laudantium sapiente delectus minima perferendis ad, pariatur exercitationem.</p>
                    </div>
                </div>
                <div className={styles.userSocialMedia}>
                    <Link className={styles.socialMediaLink} target="_blank" to={"https://www.youtube.com"}><ion-icon name="logo-facebook"></ion-icon></Link>
                    <Link className={styles.socialMediaLink} target="_blank" to={"https://www.youtube.com"}><ion-icon name="logo-twitter"></ion-icon></Link>
                    <Link className={styles.socialMediaLink} target="_blank" to={"https://www.youtube.com"}><ion-icon name="logo-youtube"></ion-icon></Link>

                </div>
            </div>
        </div>
    )
}