import { Link } from "react-router-dom";
import styles from './LinkSidebar.module.css';
import { ReactSVG } from "react-svg";

export default function LinkSidebar({text, extraMenuRight = false, iconWhenActive, icon, linkActiveText, redirectTo, position = 1, action = null}){
    return(
        <li className={`${extraMenuRight ? styles.nav_el_right : ""} ${styles.nav_el} ${linkActiveText.includes('/' + location.pathname.split('/')[position]) && styles.active}`}>
            <Link onClick={e => {if(action != null){ e.preventDefault(); action()}}} to={redirectTo} className={styles.link_container} style={{textDecoration: "none"}}>
                <div className={styles.icon}><ReactSVG fill="currentColor" src={`/src/assets/Iconos/${linkActiveText.includes('/' + location.pathname.split('/')[position]) ? iconWhenActive : icon}.svg`}/></div>
                <div className={styles.text}>{text}</div>
            </Link>
        </li>
    )
}