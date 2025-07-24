import { ReactSVG } from 'react-svg';
import picTest from '../assets/smile.png';
import styles from './RecipeComments.module.css';
import Pagination from './Pagination';
import { useEffect, useState } from 'react';
import backendAPI from '../api/axiosConfig';
import { FadeLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import UserComment from './UserComment';
import { useAuth } from '../context/AuthProvider';

export default function RecipeComments({recipeId, isSuperUser, isStaff, user, recipeCreator}){
    
    const [comentarios, setComentarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ nextPage, setNextPage ] = useState(null);
    const [ previousPage, setPreviousPage ] = useState(null);
    const [ count, setCount ] = useState(0);
    const [ currentPage, setCurrentPage ] = useState(1);
    const { refreshAccessToken } = useAuth();

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
            if(error.response?.status == 401){
                await refreshAccessToken(deleteComment, nombre, id);
            }
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

    if (loading) return <div className={styles.recipeCommentsContainer}><div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div></div>

    return(
    <div className={styles.recipeCommentsContainer}>
        <h3 className={styles.recipeCommentsTitle}>Comentarios de otros usuarios:</h3>
        {comentarios.length !== 0 ? (
            <>
                {comentarios.map(comentario => (
                    <UserComment key={comentario.id} comentario={comentario} showDelete={true} user={user} recipeCreator={recipeCreator} isSuperUser={isSuperUser} isStaff={isStaff} askDeleteComment={askDeleteComment}/>
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