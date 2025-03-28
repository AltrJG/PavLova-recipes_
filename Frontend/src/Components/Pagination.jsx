import { ReactSVG } from 'react-svg';
import styles from './Pagination.module.css';
import arrowBack from '../assets/Iconos/arrow-back.svg';
import arrowForward from '../assets/Iconos/arrow-forward.svg';

export default function Pagination({ next = null, previous = null, count, currentPage, text, action }){

    const resultsPerPage = 10; // Change if needed
    const start = (currentPage - 1) * resultsPerPage + 1;
    const end = Math.min(start + resultsPerPage - 1, count);

    return(
        <div className={styles.paginationContainer}>
            {previous != null && <button className={styles.buttonsPagination} onClick={() => action(previous, null)}><ReactSVG src={arrowBack}/></button> }
            <p>{text.replace("{start}", start).replace("{end}", end).replace("{count}", count)}</p>
            { next != null && <button className={styles.buttonsPagination} onClick={() => action(null, next)}><ReactSVG src={arrowForward}/></button> }
        </div>
    )
}