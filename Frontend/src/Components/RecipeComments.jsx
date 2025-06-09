import { ReactSVG } from 'react-svg';
import picTest from '../assets/smile.png';
import styles from './RecipeComments.module.css';
import Pagination from './Pagination';
import { useEffect, useState } from 'react';
import backendAPI from '../api/axiosConfig';
import { FadeLoader } from 'react-spinners';
import icon from '../assets/Iconos/trash.svg'
import Swal from 'sweetalert2';

export default function RecipeComments({recipeId, isSuperUser, isStaff, user, recipeCreator}){
    
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
    };

    
    const deleteComment = async (nombre, id) => {
        try{
            await backendAPI.delete(`/comentarios/${id}/`);
            Swal.fire({
                icon: "success",
                title: "Comentario eliminado",
                text: `Se elimino el comentario con exito de ${nombre}`,
                showConfirmButton: true,
                customClass: {
                    title: "swal_title",
                    icon: "swal_icon",
                    htmlContainer: "swal_text",
                    confirmButton: "swal_confirm"
                }
            });
            setLoading(true);
            await getComments();
        } catch(error){
            console.log(error);
        }
    }

    const askDeleteComment = (nombre, id) => {
        Swal.fire({
            title: `Eliminar comentario?`,
            icon: "question",
            text: `Estas seguro de eliminar el comentario de '${nombre}'`,
            customClass: {
                title: "swal_title",
                icon: "swal_icon",
                htmlContainer: "swal_text",
                confirmButton: "swal_confirm"
            },
            showCancelButton: true,
            cancelButtonText: "Cancelar",
            confirmButtonText: "Eliminar",
            allowOutsideClick: () => !Swal.isLoading()
            }).then((result) => {
            if (result.isConfirmed) {
                deleteComment(nombre, id);
            }
        });
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
                            <div className={styles.recipeNameDelete}>
                                <h5 className={styles.recipeCommentName}>{comentario.usuario_nombre}</h5>
                                { (user?.id == recipeCreator || isSuperUser || isStaff) && <ReactSVG onClick={() => askDeleteComment(comentario.usuario_nombre, comentario.id)} src={icon}/>}
                            </div>
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