import styles from './FilterForm.module.css';

export default function FilterForm({filterOptions, setData, data}){
    return(
        <form className={styles.filterForm}>
            <div className={styles.filterInputs}>
                {filterOptions.map((filter) => (
                    <div key={filter.name} className={styles.filterField}>
                        {filter.type === "select" ? (
                            <select name={filter.name} value={data[filter.name]} onChange={e  => setData(filters => ({...filters, [e.target.name]: e.target.value}))}>
                                {filter.options.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        ) : (
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
            <button className={styles.formSubmit}><ion-icon name="search"></ion-icon></button>
        </form>
    )
}