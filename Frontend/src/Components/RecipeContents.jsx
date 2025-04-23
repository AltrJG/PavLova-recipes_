import styles from './RecipeContents.module.css';
import ShowImage from './ShowImage';
import imgTest from '../assets/manzana_test.png';
import { useState } from 'react';

export default function RecipeContents(){

    const [portion, setPortion] = useState(5);

    const ingredients = [{
        text: '200 g de Manzana',
        image: imgTest
    },{
        text: '150 g de Azucar Glass',
        image: imgTest
    },{
        text: '15 g de Maicena',
        image: null
    }]

    return(
        <div className={styles.recipeContentsContainer}>
            <h4 className={styles.recipeContentsText}>Ingredientes:</h4>
            <div className={styles.portionSliderContainer}>
                <p className={styles.portionSliderText}>Porciones: <span className={styles.portionSliderValue}>{portion}</span></p>
                <input
                type="range"
                min="1"
                max="20"
                value={portion}
                onChange={(e) => setPortion(Number(e.target.value))}
                className={styles.portionSlider}
                />
            </div>
            <div className={styles.recipeContentsUsefulData}>
                { ingredients.map(ingredient => <ShowImage key={ingredient.text} text={ingredient.text} position={ingredient.text.length > 20 ? 'Top' : 'Right'} width={'17'} height={'12'} hasImage={ingredient.image != null} image={imgTest}/>)}
            </div>
        </div>
    )
}