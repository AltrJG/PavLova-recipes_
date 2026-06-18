import styles from './FilterForm.module.css';
import search from '/assets/Iconos/search.svg';
import { ReactSVG } from 'react-svg';

export default function FilterForm({setCurrentPage, filterOptions, setData, data, action}){
    return(
        <form onSubmit={e => {e.preventDefault(); setCurrentPage(1); action();}} className={styles.filterForm}>
            <div className={styles.filterInputs}>
                {filterOptions.map((filter) => (
                    <div key={filter.name} className={styles.filterField}>
                        {filter.type === "select" ? (
                            <select name={filter.name} value={data[filter.name]} onChange={e  => setData(filters => ({...filters, [e.target.name]: e.target.value}))}>
                                {filter.options.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        ) : filter.type == 'number' ? ((
                            <input
                                type={filter.type}
                                name={filter.name}
                                placeholder={filter.placeholder}
                                value={data[filter.name]}
                                onChange={e => setData(filters => ({...filters, [e.target.name]: e.target.value}))}
                                min={filter.minNumber}
                                max={filter.maxNumber}
                            />
                        )) : (
                            <input
                                type={filter.type}
                                name={filter.name}
                                placeholder={filter.placeholder}
                                value={data[filter.name]}
                                onChange={e => setData(filters => ({...filters, [e.target.name]: e.target.value}))}
                            />
                        )}
                    </div>
                ))}
            </div>
            <button className={styles.formSubmit}><ReactSVG src={search}/></button>
        </form>
    )
}