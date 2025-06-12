import { useEffect } from 'react';
import FondoPavlova from '../Components/FondoPavlova';
import RecipeHeader from '../Components/RecipeHeader';
import { useBackground } from '../context/BackgroundProvider';
import styles from './RecipeDetails.module.css';

export default function RecipeDetails(){
    const { disableBackground } = useBackground();

    useEffect(() => {
        disableBackground();
    }, [])

    return(
        <div className={styles.recipeDetailsContainer}>
            <RecipeHeader/>
        </div>
    )
}