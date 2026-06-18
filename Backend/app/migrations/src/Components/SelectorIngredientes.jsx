import Select, { components } from 'react-select';
import styles from './SelectorIngredientes.module.css';
import { useEffect, useState } from 'react';
import icon from '/assets/Iconos/trash.svg'
import { ReactSVG } from 'react-svg';
import { useRightSidebar } from '../context/RightSidebarProvider';

export default function SelectorIngredientes({ingredientes, porciones, setPorciones, handleChange, handleFormChange, activeIngredients, removeIngredient}){

    const { openIngredientModify } = useRightSidebar();

    const customStyles = {
        noOptionsMessage: (base) => ({
          ...base,
          fontSize: '1.6rem',
          color: '#888',
          padding: '1rem',
          textAlign: 'center',
          fontFamily: 'Lato, sans-serif',
          opacity: 0,
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
                unidad: ingrediente.unidad ?? 'numerica',
                ingrediente: {
                    calorias: ingrediente.calorias,
                    carbohidratos: ingrediente.carbohidratos,
                    grasas_insaturadas: ingrediente.grasas_insaturadas,
                    grasas_saturadas: ingrediente.grasas_saturadas,
                    grasas_trans: ingrediente.grasas_trans,
                    proteinas: ingrediente.proteinas,
                    sodio: ingrediente.sodio,
                    escala_agua: ingrediente.escala_agua,
                    opciones: ingrediente.opciones,
                }
            }
        });
        setIngredientesDisponibles(options);
    }, [ingredientes]);

    return(
        <div className={styles.selectorIngredientesContainer}>
            <p className={styles.createIngredientContainer}>No encuentras un ingrediente? <button onClick={() => openIngredientModify(null)} className={styles.createIngredientButton}>Crear Ingrediente</button></p>
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
                    ? activeIngredients.map(activeIngredient => <div key={`${activeIngredient.id}-active`} className={styles.activeIngredientPicker}>
                        <div className={styles.ingredientImage}><img src={activeIngredient.image}/></div>
                        <div className={styles.ingredientSettings}>
                            <p className={styles.ingredientName}>{activeIngredient.label}<span><button type='button' onClick={() => removeIngredient(activeIngredient.id)}><ReactSVG src={`${icon}`}/></button></span></p>
                            <div className={styles.ingredientInputs}>
                                <input value={activeIngredient.cantidad} placeholder='Cantidad:' onChange={el => handleFormChange(activeIngredient.id, 'cantidad', el.target.value)} type='number' className={styles.ingredientInput}/>
                                <select defaultValue={activeIngredient.unidad ?? 'numerica'} onChange={el => handleFormChange(activeIngredient.id, 'unidad', el.target.value)} className={styles.ingredientUnitSelect}>
                                    <option value="numerica">
                                        {activeIngredient.consistencia === "liquido" ? "Mililitros (ml.)" : "Gramos (g.)"}
                                    </option>
                                    <option value="taza">Taza</option>
                                    <option value="cucharada">Cucharada (cda.)</option>
                                    <option value="cucharadita">Cucharadita (cdta.)</option>
                                    { activeIngredient?.ingrediente?.opciones?.length > 0 && activeIngredient.ingrediente.opciones.map(option => <option value={`${option.cantidad} ${option.nombre}`}>{option.nombre}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>)
                    : <p className={styles.textStart}>Empieza seleccionando ingredientes...</p>}
            </div>
        </div>
    )
}