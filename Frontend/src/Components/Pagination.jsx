import styles from './Pagination.module.css';

export default function Pagination({ next = null, previous = null, count, currentPage, text, action }){

    const resultsPerPage = 10; // Change if needed
    const start = (currentPage - 1) * resultsPerPage + 1;
    const end = Math.min(start + resultsPerPage - 1, count);

    return(
        <div className={styles.paginationContainer}>
            {previous != null && <button className={styles.buttonsPagination} onClick={() => action(previous, null)}><ion-icon name="arrow-back"></ion-icon></button> }
            <p>{text.replace("{start}", start).replace("{end}", end).replace("{count}", count)}</p>
            { next != null && <button className={styles.buttonsPagination} onClick={() => action(null, next)}><ion-icon name="arrow-forward"></ion-icon></button> }
        </div>
    )
}