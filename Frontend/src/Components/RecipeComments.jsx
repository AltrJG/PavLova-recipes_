import { ReactSVG } from 'react-svg';
import picTest from '../assets/smile.png';
import styles from './RecipeComments.module.css';
import Pagination from './Pagination';
import { useEffect, useState } from 'react';
import backendAPI from '../api/axiosConfig';
import { FadeLoader } from 'react-spinners';

export default function RecipeComments({recipeId}){
    
    const [comentarios, setComentarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ nextPage, setNextPage ] = useState(null);
    const [ previousPage, setPreviousPage ] = useState(null);
    const [ count, setCount ] = useState(0);
    const [ currentPage, setCurrentPage ] = useState(1);

    const getComments = async (previous = null, next = null) => {
        try{
            let url = previous 
            ? previous.split('app')[1] 
            : next 
            ? next.split('app')[1] 
            : `/comentarios/`;
            const params = new URLSearchParams();
            params.append("page_size", 3);
            params.append("receta", recipeId);
            url += `?${params.toString()}`;
            const response = await backendAPI.get(url);
            setComentarios(response.data.results);

            previous != null && setCurrentPage(currentPage-1);
            next != null && setCurrentPage(currentPage+1);
            setCount(response.data.count);
            setNextPage(response.data.next);
            setPreviousPage(response.data.previous);
        } catch(error){

        } finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        setLoading(true);
        getComments();
    }, []);

    const getStarIcon = (index, value) => {
        if (value >= index + 1) {
          return "star";
        } else if (value >= index + 0.5) {
          return "star-half";
        }
        return "star-outline";
      };

    if (loading) return <div className={styles.recipeCommentsContainer}><div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div></div>

    return(
    <div className={styles.recipeCommentsContainer}>
        <h3 className={styles.recipeCommentsTitle}>Comentarios de otros usuarios:</h3>
        {comentarios.length !== 0 ? (
            <>
                {comentarios.map(comentario => (
                    <div key={comentario.id} className={styles.recipeComment}>
                        <div className={styles.recipeCommentAvatar}>
                            <img src={comentario.profile_picture} />
                        </div>
                        <div className={styles.recipeCommentData}>
                            <h5 className={styles.recipeCommentName}>{comentario.usuario_nombre}</h5>
                            <p className={styles.recipeCommentDate}>
                                {new Date(comentario?.fecha_creacion).toLocaleDateString('es-MX', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                            <div className={styles.recipeCommentsStars}>
                                {[...Array(5)].map((_, index) => (
                                    <div key={index} className={styles.recipeCommentStar}>
                                        <ReactSVG
                                            src={`/src/assets/Iconos/${getStarIcon(index, comentario.puntuacion)}.svg`}
                                            className="star-icon"
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className={styles.recipeCommentText}>{comentario.contenido}</p>
                        </div>
                    </div>
                ))}
                <div className={styles.recipeCommentPagination}>
                    <Pagination
                        action={getComments}
                        next={nextPage}
                        previous={previousPage}
                        count={count}
                        currentPage={currentPage}
                        resultsPerPage={3}
                        text={`Mostrando Comentarios {start}-{end} de {count}`}
                    />
                </div>
            </>
        ) : (
            <p className={styles.noComments}>Esta receta no tiene comentarios, ¡sé el primero en comentar!</p>
        )}
    </div>
);
}