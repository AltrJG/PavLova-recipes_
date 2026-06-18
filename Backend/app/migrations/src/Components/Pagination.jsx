import { ReactSVG } from 'react-svg';
import styles from './Pagination.module.css';
import arrowBack from '/assets/Iconos/arrow-back.svg';
import arrowForward from '/assets/Iconos/arrow-forward.svg';
import { useCallback, useRef } from 'react';

export default function Pagination({ next = null, previous = null, count, currentPage, text, resultsPerPage = 12, loading, action, usePages = false }){

    const start = (currentPage - 1) * resultsPerPage + 1;
    const end = Math.min(start + resultsPerPage - 1, count);
    const observer = useRef();
    const fetchingRef = useRef(false);

    const watcher = useCallback(node => {
        if(usePages) return;
        if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver(async entries => {
            if (entries[0].isIntersecting && (currentPage * resultsPerPage) < count && !loading && !fetchingRef.current) {
                fetchingRef.current = true;
                try{
                    await action(null, next);    
                } finally{
                    fetchingRef.current = false;
                }
            }
        });
        
        if (node) observer.current.observe(node);
    })

    return(
        <div className={styles.paginationContainer} ref={watcher}>
            {previous != null && usePages && <button className={styles.buttonsPagination} onClick={() => action(previous, null)}><ReactSVG src={arrowBack}/></button>}
            <p>{text.replace("{start}", usePages ? start : 1).replace("{end}", end).replace("{count}", count)}</p>
            {next != null && usePages && <button className={styles.buttonsPagination} onClick={() => action(null, next)}><ReactSVG src={arrowForward}/></button>}
        </div>
    )
}