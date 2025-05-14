import styles from './RightSidebarForms.module.css';
import SubidaImagenes from './SubidaImagenes';

const thumb = {
    display: 'inline-flex',
    borderRadius: 0,
    marginBottom: 8,
    marginRight: 8,
    width: "20rem",
    height: "15rem",
    padding: 4,
    boxSizing: 'border-box',
};

const thumbCategoria = {
    display: 'inline-flex',
    borderRadius: '50%',
    marginBottom: 8,
    marginRight: 8,
    width: "20rem",
    height: "20rem",
    padding: 4,
    boxSizing: 'border-box',
};

const thumbInner = {
    display: 'flex',
    minWidth: 0,
    borderRadius: 10,
    border: '.4rem solid orange',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
};

const thumbInnerCategoria = {
    display: 'flex',
    minWidth: 0,
    borderRadius: '100%',
    border: '.4rem solid orange',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
};

export default function RightSidebarForms({twoOnOne = false, action, formOptions, setData, data, children}){
    return(
        <form onSubmit={e => action(e)} className={styles.rightSidebarForm}>
            <div className={`${styles.formInputs} ${twoOnOne ? styles.twoInputs : ""}`}>
                {formOptions.map((formInput) => (
                    <div key={formInput.name} className={`${styles.inputField} ${formInput.type == "imageSingle" ? styles.inputImage : ""}`}>
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
                            :( formInput.type === 'imageSingle' 
                                ? <SubidaImagenes key={formInput.name} thumb={formInput.name == 'imagenCategoria' ? thumbCategoria : thumb} thumbInner={formInput.name == 'imagenCategoria' ? thumbInnerCategoria : thumbInner} files={formInput.imageData} setFiles={formInput.setImageData}/> 
                                : (formInput.type == 'slider' 
                                ? <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: "100%" }}>
                                    <input
                                        id={formInput.name}
                                        style={{width: '100%'}}
                                        type="range"
                                        step={formInput.step}
                                        name={formInput.name}
                                        min={formInput.min}
                                        max={formInput.max}
                                        value={data[formInput.name] ?? formInput.defaultValue}
                                        onChange={e =>
                                            setData(formInputs => ({
                                                ...formInputs,
                                                [e.target.name]: Number(e.target.value)
                                            }))
                                        }
                                    />
                                    {formInput.showInput && (
                                        <input
                                            type="number"
                                            min={formInput.min}
                                            max={formInput.max}
                                            step={formInput.step}
                                            value={data[formInput.name] ?? formInput.defaultValue}
                                            onChange={e =>
                                                setData(formInputs => ({
                                                    ...formInputs,
                                                    [formInput.name]: Number(e.target.value)
                                                }))
                                            }
                                        />
                                    )}
                                </div> 
                                : <input
                                id={formInput.name}
                                type={formInput.type}
                                name={formInput.name}
                                value={data[formInput.name]}
                                onChange={e => setData(formInputs => ({...formInputs, [e.target.name]: e.target.value}))}
                            />
                        )))}
                    </div>
                ))}
            </div>
            {children}
        </form>
    )
}