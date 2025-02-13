import { Link } from "react-router-dom";
import styles from './LinkSidebar.module.css';

export default function LinkSidebar({text, iconWhenActive, icon, linkActiveText, redirectTo}){
    return(
        <li className={`${styles.nav_el} ${location.pathname == linkActiveText && styles.active}`}>
            <Link to={redirectTo} className={styles.link_container} style={{textDecoration: "none"}}>
                <div className={styles.icon}><ion-icon name={location.pathname == linkActiveText ? iconWhenActive : icon}></ion-icon></div>
                <div className={styles.text}>{text}</div>
            </Link>
        </li>
    )
}