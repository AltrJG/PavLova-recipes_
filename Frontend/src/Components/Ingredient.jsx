import styles from './Ingredient.module.css';
import tempImage from '../assets/manzana_test.png';
import { useState } from 'react';
import CardButton from './CardButton';

export default function Ingredient(){
    const [flipped, setFlipped] = useState(false);

    return(
        <div className={styles.ingredientContainer}>
            <div className={styles.ingredientInner} style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
                <div className={styles.ingredientFrontFace}>
                    <CardButton 
                        text="Info. Nutricional"
                        hoverWidth="14rem"
                        top={1}
                        left={.5}
                        icon="nutrition"
                        onClick={() => setFlipped(!flipped)}
                    />     
                    <CardButton 
                        text="Editar"
                        hoverWidth="8rem"
                        top={6}
                        left={.5}
                        icon="create"
                        onClick={() => setFlipped(!flipped)}
                    />
                    <CardButton 
                        text="Eliminar"
                        hoverWidth="10rem"
                        top={11}
                        left={.5}
                        icon="trash"
                        onClick={() => setFlipped(!flipped)}
                    />                  
                    <div className={styles.ingredientImage}>
                        <img src={tempImage} alt="Ingredient" />
                    </div>
                    <h4 className={styles.ingredientName}>Manzana explosiva</h4>
                    <div className={styles.ingredientTypeContainer}>
                        <div className={styles.ingredientType}>
                            <ion-icon name="eye"></ion-icon>
                            <p className={styles.ingredientSimpleData}>Universal</p>
                        </div>
                        <div className={styles.ingredientType}>
                            <ion-icon name="nutrition"></ion-icon>
                            <p className={styles.ingredientSimpleData}>Liquido</p>
                        </div>
                    </div>
                </div>
                <div className={styles.ingredientBackFace}>
                    <CardButton 
                        text="Volver"
                        hoverWidth="8rem"
                        top={.5}
                        left={1}
                        icon="arrow-back-circle"
                        onClick={() => setFlipped(!flipped)}
                    />
                    <div className={styles.ingredientNutritionalInformation}>
                        {["Calorias", "Carbohidratos", "Proteinas", "Grasas Saturadas", "Grasas Insaturadas", "Grasas Trans", "Sodio"].map((item, index) => (
                            <div key={index} className={styles.ingredientNutritionalFact}>
                                <h5 className={styles.ingredientFact}>{item}:</h5>
                                <h5 className={styles.ingredientValue}>50 g</h5>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}