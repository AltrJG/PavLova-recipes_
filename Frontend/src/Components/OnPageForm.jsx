import styles from './OnPageForm.module.css';
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

const thumbInner = {
    display: 'flex',
    minWidth: 0,
    borderRadius: 10,
    border: '.4rem solid orange',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
};

export default function OnPageForm({action, formOptions, setData, data, children}) {
    // Agrupamos campos que van en pareja
    const onSideInputs = formOptions.filter(f => f.onSide);
    const singleInputs = formOptions.filter(f => !f.onSide);

    return (
        <form onSubmit={e => action(e)} className={styles.rightSidebarForm}>
            <div className={styles.formInputs}>
                {/* Inputs individuales */}
                {singleInputs.map((formInput) => (
                    <div key={formInput.name} className={`${styles.inputField} ${data[formInput.name] != '' ? styles.activeData : ""}`}>
                        {renderInput(formInput, data, setData)}
                    </div>
                ))}

                {/* Inputs lado a lado */}
                <div className={styles.twoSideGroup}>
                    {onSideInputs.map((formInput) => (
                        <div key={formInput.name} className={`${styles.inputField} ${data[formInput.name] != '' ? styles.activeData : ""}`}>
                            {renderInput(formInput, data, setData)}
                        </div>
                    ))}
                </div>
            </div>
            {children}
        </form>
    );
}

// Función auxiliar para renderizar inputs
function renderInput(formInput, data, setData) {
    if (formInput.type === "select") {
        return (
            <>
                <label htmlFor={formInput.name}>{formInput.label}</label>
                <select
                    id={formInput.name}
                    name={formInput.name}
                    value={data[formInput.name]}
                    onChange={e => setData(formInputs => ({...formInputs, [e.target.name]: e.target.value}))}>
                    {formInput.options.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </>
        );
    }

    if (formInput.type === "textarea") {
        return (
            <>
                <label htmlFor={formInput.name}>{formInput.label}</label>
                <textarea
                    id={formInput.name}
                    name={formInput.name}
                    value={data[formInput.name]}
                    onChange={e => setData(formInputs => ({...formInputs, [e.target.name]: e.target.value}))} />
            </>
        );
    }

    if (formInput.type === "imageSingle") {
        return (
            <SubidaImagenes
                key={formInput.name}
                thumb={thumb}
                thumbInner={thumbInner}
                files={formInput.imageData}
                onWhiteBg={true}
                setFiles={formInput.setImageData}
            />
        );
    }

    return (
        <>
            <label htmlFor={formInput.name}>{formInput.label}</label>
            <input
                id={formInput.name}
                type={formInput.type}
                name={formInput.name}
                value={data[formInput.name]}
                onChange={e => setData(formInputs => ({...formInputs, [e.target.name]: e.target.value}))}
            />
        </>
    );
}