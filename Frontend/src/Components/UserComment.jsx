import React from 'react';
import { ReactSVG } from 'react-svg';
import styles from './UserComment.module.css'; // Adjust the path based on your structure
import icon from '../assets/Iconos/trash.svg'

const UserComment = ({
  comentario,
  user,
  recipeCreator,
  isSuperUser,
  isStaff,
  askDeleteComment,
  showDelete
}) => {
    const getStarIcon = (index, value) => {
        if (value >= index + 1) {
          return "star";
        } else if (value >= index + 0.5) {
          return "star-half";
        }
        return "star-outline";
    };
    return (
        <div className={styles.recipeComment}>
            <div className={styles.recipeCommentAvatar}>
                <img src={comentario.profile_picture} alt="Avatar" />
            </div>
            <div className={styles.recipeCommentData}>
                <div className={styles.recipeNameDelete}>
                <h5 className={styles.recipeCommentName}>{comentario.usuario_nombre}</h5>
                {(user?.id === recipeCreator || isSuperUser || isStaff) && showDelete && (
                    <ReactSVG
                    onClick={() => askDeleteComment(comentario.usuario_nombre, comentario.id)}
                    src={icon}
                    />
                )}
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
    );
};

export default UserComment;