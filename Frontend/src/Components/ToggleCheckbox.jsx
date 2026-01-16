import style from './ToggleCheckbox.module.css'

export default function ToggleCheckbox({trueOption, falseOption, name, value, setData}){
    return(
        <div className={style.checkbox_content}>
            <div className={style.checkbox_btn}>
                <input name={name} checked={value === trueOption} type={'checkbox'} onChange={e => setData(formInputs => ({...formInputs, [e.target.name]: e.target.checked ? trueOption : falseOption}))}/>
                <div className={style.checkbox_container}><span className={style.slide}></span><div className={style.manotruco}></div></div>
            </div>
            <p className={style.checkbox_message}>{value === trueOption ? trueOption : falseOption}</p>
        </div>
    )
}