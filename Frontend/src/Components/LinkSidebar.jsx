import { Link } from "react-router-dom";
import styles from './LinkSidebar.module.css';
import { ReactSVG } from "react-svg";

export default function LinkSidebar({text, iconWhenActive, icon, linkActiveText, redirectTo}){
    return(
        <li className={`${styles.nav_el} ${location.pathname == linkActiveText && styles.active}`}>
            <Link to={redirectTo} className={styles.link_container} style={{textDecoration: "none"}}>
                <div className={styles.icon}><ReactSVG fill="currentColor" src={`/src/assets/Iconos/${location.pathname === linkActiveText ? iconWhenActive : icon}.svg`}/></div>
                <div className={styles.text}>{text}</div>
            </Link>
        </li>
    )
}