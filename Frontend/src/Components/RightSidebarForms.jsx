import styles from './RightSidebarForms.module.css';

export default function RightSidebarForms({action, formOptions, setData, data, children}){
    return(
        <form onSubmit={e => action(e)} className={styles.rightSidebarForm}>
            <div className={styles.formInputs}>
                {formOptions.map((formInput) => (
                    <div key={formInput.name} className={styles.inputField}>
                        <label htmlFor={formInput.name}>{formInput.label}</label>
                        {formInput.type === "select" ? (
                            <select id={formInput.name} name={formInput.name} value={data[formInput.name]} onChange={e  => setData(formInputs => ({...formInputs, [e.target.name]: e.target.value}))}>
                                {formInput.options.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        ) : (formInput.type === 'textarea' ? 
                            <textarea
                                id={formInput.name}
                                name={formInput.name}
                                value={data[formInput.name]}
                                onChange={e => setData(formInputs => ({...formInputs, [e.target.name]: e.target.value}))}>
                            </textarea>
                            :( <input
                                id={formInput.name}
                                type={formInput.type}
                                name={formInput.name}
                                value={data[formInput.name]}
                                onChange={e => setData(formInputs => ({...formInputs, [e.target.name]: e.target.value}))}
                            />
                        ))}
                    </div>
                ))}
            </div>
            {children}
        </form>
    )
}