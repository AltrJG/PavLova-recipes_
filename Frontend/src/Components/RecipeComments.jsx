import { ReactSVG } from 'react-svg';
import picTest from '../assets/smile.png';
import styles from './RecipeComments.module.css';
import Pagination from './Pagination';

export default function RecipeComments(){

    const comentarios = [{
        image: picTest,
        rating: 4.5,
        name: "Brandon Yahir Castañeda Godinez",
        date: "31/03/2025",
        comment: "Esta Pavlova es incomparable a otros postres que prepare!"
    },
    {
        image: picTest,
        rating: 5,
        name: "Brandon Castañeda",
        date: "31/03/2025",
        comment: "La mejor receta que he probado en mi vida"
    },
    {
        image: picTest,
        rating: 3.5,
        name: "Brandon Castañeda",
        date: "31/03/2025",
        comment: "Intente hacer mi pavlova y termino siendo una nieve >:("
    },
    {
        image: picTest,
        rating: .5,
        name: "Brandon Castañeda",
        date: "31/03/2025",
        comment: "Eres un hijo de puta! Intente hacer tu receta y se quemo mi casa!!!!!"
    },
    ];

    const getStarIcon = (index, value) => {
        if (value >= index + 1) {
          return "star";
        } else if (value >= index + 0.5) {
          return "star-half";
        }
        return "star-outline";
      };

    return(
        <div className={styles.recipeCommentsContainer}>
            <h3 className={styles.recipeCommentsTitle}>Comentarios de otros usuarios:</h3>
            {comentarios.map(comentario => <div key={comentario.name} className={styles.recipeComment}>
                <div className={styles.recipeCommentAvatar}>
                    <img src={comentario.image}/>
                </div>
                <div className={styles.recipeCommentData}>
                    <h5 className={styles.recipeCommentName}>{comentario.name}</h5>
                    <p className={styles.recipeCommentDate}>{comentario.date}</p>
                    <div className={styles.recipeCommentsStars}>
                        {[...Array(5)].map((_, index) => (
                            <div key={index} className={styles.recipeCommentStar}>
                                <ReactSVG
                                src={`/src/assets/Iconos/${getStarIcon(index, comentario.rating)}.svg`}
                                className="star-icon"
                                />
                            </div>
                        ))}
                    </div>
                    <p className={styles.recipeCommentText}>{comentario.comment}</p>
                </div>
            </div>)}
            <div className={styles.recipeCommentPagination}>
                <Pagination
                    next={'tgwgfw'} 
                    previous={'wrw'} 
                    count={15} 
                    currentPage={5} 
                    text="Mostrando Comentarios {start}-{end} de {count}"
                />
            </div>
        </div>
    )
}