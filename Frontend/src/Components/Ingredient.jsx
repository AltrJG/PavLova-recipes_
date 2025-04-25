import styles from './Ingredient.module.css';
import tempImage from '../assets/manzana_test.png';
import { useState } from 'react';
import CardButton from './CardButton';
import { ReactSVG } from 'react-svg';
import eye from '../assets/Iconos/eye.svg'
import nutrition from '../assets/Iconos/nutrition.svg'
import NutritionalTable from './NutritionalTable';

export default function Ingredient({askDelete, user_id, isStaff, isSuperUser, actionModify, ingredient}){
    const [flipped, setFlipped] = useState(false);
    const nutritionalData = {
        Calorias: `${ingredient?.calorias} Kcal`,
        Carbohidratos: `${ingredient?.carbohidratos}g`,
        Proteinas: `${ingredient?.proteinas}g`,
        'Grasas Saturadas': `${ingredient?.grasas_saturadas}g`,
        'Grasas Insaturadas': `${ingredient?.grasas_insaturadas}g`,
        'Grasas Trans': `${ingredient?.grasas_trans}g`,
        Sodio: `${ingredient?.sodio}mg`
    }

    return(
        <div className={styles.ingredientContainer}>
            <div className={styles.ingredientInner} style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
                <div className={styles.ingredientFrontFace}>
                    <CardButton 
                        text="Info. Nutricional"
                        hoverWidth="14rem"
                        top={1}
                        left={1.5}
                        icon="nutrition"
                        onClick={() => setFlipped(!flipped)}
                    />     
                    {(user_id == ingredient?.creador || (isStaff || isSuperUser)) && <CardButton 
                        text="Editar"
                        hoverWidth="8rem"
                        top={6}
                        left={1.5}
                        icon="create"
                        onClick={() => actionModify(ingredient)}
                    />}
                    {(user_id == ingredient?.creador || (isStaff || isSuperUser)) && <CardButton 
                        text="Eliminar"
                        hoverWidth="10rem"
                        top={11}
                        left={1.5}
                        icon="trash"
                        onClick={() => askDelete(ingredient)}
                    />}                  
                    <div className={styles.ingredientImage}>
                        <img src={ingredient?.foto_ingrediente} alt="Ingredient" />
                    </div>
                    <h4 className={styles.ingredientName}>{ingredient?.nombre}</h4>
                    <div className={styles.ingredientTypeContainer}>
                        <div className={styles.ingredientType}>
                            <ReactSVG src={eye}/>
                            <p className={styles.ingredientSimpleData}>{ingredient?.tipo.replace(/^./, char => char.toUpperCase())}</p>
                        </div>
                        <div className={styles.ingredientType}>
                            <ReactSVG src={nutrition}/>
                            <p className={styles.ingredientSimpleData}>{ingredient?.consistencia.replace(/^./, char => char.toUpperCase())}</p>
                        </div>
                    </div>
                </div>
                <div className={styles.ingredientBackFace}>
                    <CardButton 
                        text="Volver"
                        hoverWidth="8rem"
                        top={.5}
                        left={1.5}
                        icon="arrow-back-circle"
                        onClick={() => setFlipped(!flipped)}
                    />
                    <h4 className={styles.ingredientAmount}>{`Por cada 100 ${ingredient.consistencia == 'liquido' ? "mL" : "g"}`}</h4>
                    <NutritionalTable nutritionalData={nutritionalData}/>
                </div>
            </div>
        </div>
    );
}