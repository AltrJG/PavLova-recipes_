import { Link } from "react-router-dom"
import tempUserPic from "../assets/smile.png"
import styles from "./UserDetails.module.css"
import { userService } from "../api/user_api"
import { useEffect, useState } from "react";

export default function UserDetails(){

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const data = await userService.getUserInfo();
          setUserData(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchUserData();
    }, []);
  
    if (loading) {
      return <p>Cargando...</p>;
    }
  
    if (error) {
      return <p>Error: {error}</p>;
    }


    return(
        <div className={styles.userDetailsContainer}>
            <div className={styles.allUserData}>
                <div className={styles.userData}>
                    <img className={styles.userProfilePicture} src={tempUserPic}/>
                    <div className={styles.userDataText}>
                        <h5>{userData.username}</h5>
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