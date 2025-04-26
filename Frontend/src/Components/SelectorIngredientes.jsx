import Select, { components } from 'react-select';
import styles from './SelectorIngredientes.module.css';
import { useEffect, useState } from 'react';
import icon from '../assets/Iconos/trash.svg'
import { ReactSVG } from 'react-svg';

export default function SelectorIngredientes({ingredientes, porciones, setPorciones, handleChange, handleFormChange, activeIngredients, removeIngredient}){

    const customStyles = {
        noOptionsMessage: (base) => ({
          ...base,
          fontSize: '1.6rem',
          color: '#888',
          padding: '1rem',
          textAlign: 'center',
          fontFamily: 'Lato, sans-serif',
        }),
    };

    const CustomOption = (props) => (
        <components.Option {...props}>
          <div style={{ display: 'flex', fontSize: '2rem', alignItems: 'center', gap: '1rem' }}>
            <img
              src={props.data.image}
              alt={props.data.label}
              style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', objectFit: 'cover' }}
            />
            <span>{props.data.label}</span>
          </div>
        </components.Option>
    );

    const [ ingredientesDisponibles, setIngredientesDisponibles ] = useState([]);
    useEffect(() => {
        const options = ingredientes.map(ingrediente => {
            return {
                value: ingrediente.nombre,
                label: ingrediente.nombre,
                image: ingrediente.foto_ingrediente,
                consistencia: ingrediente.consistencia,
                id: ingrediente.id,
                cantidad: 0,
                tipoMetrica: 'numerica'
            }
        });
        setIngredientesDisponibles(options);
    }, [ingredientes]);

    return(
        <div className={styles.selectorIngredientesContainer}>
            <Select placeholder={"Elige los ingredientes..."} value={activeIngredients} onChange={handleChange} components={{ Option: CustomOption }} styles={customStyles} noOptionsMessage={() => "No hay ingredientes disponibles"} classNamePrefix="selectorMulti" unstyled isMulti className={'selectorMulti'} options={ingredientesDisponibles}/>
            <div className={styles.portionSliderContainer}>
                <p className={styles.portionSliderText}>Porciones: <span className={styles.portionSliderValue}>{porciones}</span></p>
                <input
                type="range"
                min="1"
                max="20"
                value={porciones}
                onChange={(e) => setPorciones(Number(e.target.value))}
                className={styles.portionSlider}
                />
            </div>
            <div className={styles.recipeIngredientSetup}>
                { activeIngredients?.length != 0 
                    ? activeIngredients.map(activeIngredient => <div key={activeIngredient.id} className={styles.activeIngredientPicker}>
                        <div className={styles.ingredientImage}><img src={activeIngredient.image}/></div>
                        <div className={styles.ingredientSettings}>
                            <p className={styles.ingredientName}>{activeIngredient.label}<span><button type='button' onClick={() => removeIngredient(activeIngredient.id)}><ReactSVG src={`${icon}`}/></button></span></p>
                            <div className={styles.ingredientInputs}>
                                <input placeholder='Cantidad:' onChange={el => handleFormChange(activeIngredient.id, 'cantidad', el.target.value)} type='number' className={styles.ingredientInput}/>
                                <select onChange={el => handleFormChange(activeIngredient.id, 'tipoMetrica', el.target.value)} className={styles.ingredientUnitSelect}>
                                    <option value="taza">Taza</option>
                                    <option value="cucharada">Cucharada (cda.)</option>
                                    <option value="cucharadita">Cucharadita (cdta.)</option>
                                    <option value="numerica">
                                        {activeIngredient.consistencia === "liquido" ? "Mililitros (ml.)" : "Gramos (g.)"}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>)
                    : <p className={styles.textStart}>Empieza seleccionando ingredientes...</p>}
            </div>
        </div>
    )
}