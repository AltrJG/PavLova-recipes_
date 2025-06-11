import styles from "./RecipeHeader.module.css";
import tempImg from '../assets/receta_test.jpg';
import CircleButton from "./CircleButton";
import RecipeRating from "./RecipeRating";
import RecipeContents from "./RecipeContents";
import RecipeNutritionalFacts from "./RecipeNutritionalFacts";
import RecipePreparation from "./RecipePreparation";
import { ReactSVG } from "react-svg";
import RecipeComments from "./RecipeComments";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import flameIcon from '../assets/Iconos/flame.svg';
import timeIcon from '../assets/Iconos/timer.svg';
import backendAPI from "../api/axiosConfig";
import { FadeLoader } from "react-spinners";
import { useAuth } from "../context/AuthProvider";
import { generarRecetaPDF } from "./utils/PDFDataGenerator";
import NotFound404 from "../pages/NotFound404";

export default function RecipeHeader(){

    let { recipe_id } = useParams();
    const { refreshAccessToken, isSuperUser, isStaff, user, isAuthenticated } = useAuth();
    const [ receta, setReceta ] = useState({});
    const [ updateRecipe, setUpdateRecipe ] = useState(false);
    const [ loadingFavorite, setLoadingFavorite ] = useState(false);
    const [ loading, setLoading ] = useState(true);
    const [ commentCount, setCommentCount ] = useState(0);
    const [ favorito, setFavorito ] = useState(-1);
    const [ userComentario, setUserComentario ] = useState({});
    const navigate = useNavigate();

    const navigateLogIn = () => {
        navigate('/auth/iniciar-sesion');
    }

    const getReceta = async () => {
        try{
            const receta = await backendAPI(`recetas/${recipe_id}/`);
            const response = await backendAPI.get(`comentarios/?receta=${recipe_id}`);
            setCommentCount(response.data.count);
            setReceta(receta.data);
        } catch(error){
            if(error.response?.status == 401){
                await refreshAccessToken(getReceta);
            } else{
                console.log(error);
            }
        } finally{
            setLoading(false);
        }
    };

    const esFavorito = async () => {
        try{
            const response = await backendAPI.get(`favoritos/favorito-usuario/?receta=${recipe_id}`);
            setFavorito(response.data.id);
        } catch(error){
            console.log(error);
            if(error.response?.status == 404){ // No hay comentario
                setFavorito(-1);
            } else if(error.response?.status == 401){
                await refreshAccessToken(esFavorito);
            }
        }
    };

    const fueComentado = async () => {
        try{
            const response = await backendAPI.get(`comentarios/mi-comentario/?receta=${recipe_id}`);
            setUserComentario(response.data);
        } catch(error){
            console.log(error);
            if(error.response?.status == 404){
                setUserComentario({});
            } else if(error.response?.status == 401){
                await refreshAccessToken(fueComentado);
            }
        }
    }

    const toggleFavorito = async () => {
        if(isAuthenticated){
            setLoadingFavorite(true);
            try{
                if(favorito != -1){
                    await backendAPI.delete(`favoritos/${favorito}/`);
                    setFavorito(-1);
                } else{
                    const response = await backendAPI.post(`favoritos/`, {receta: recipe_id});
                    setFavorito(response.data.id);
                }
            } catch(error){
                if(error.response?.status == 401){
                    await refreshAccessToken(toggleFavorito);
                }
            } finally{
                setLoadingFavorite(false);
            }
        }
    }

    useEffect(() => {
        const obtainData = async () => {
            await esFavorito();
            await fueComentado();
            await getReceta();
        };
        setLoading(true);
        obtainData();
    }, []);

    useEffect(() => {
        if(updateRecipe){
            setLoading(true);
            fueComentado();
            getReceta();
            setUpdateRecipe(false);
        }
    }, [updateRecipe]);

    const getStarIcon = (index, value) => {
        if (value >= index + 1) {
          return "star";
        } else if (value >= index + 0.5) {
          return "star-half";
        }
        return "star-outline";
      };

    if (loading) return <div className='spinnerLoader'><FadeLoader color='rgba(252,115,2,1)'/></div>
    if (Object.keys(receta).length == 0) return <NotFound404 text={"No se encontro la receta."}/>

    return(
        <div className={styles.recipeHeaderContainer}>
            <div className={styles.recipeHeaderDataContainer}>
                <div className={styles.recipeHeaderData}>
                    <h3 className={styles.recipeHeaderName}>{receta.nombre}</h3>
                    { receta.categoria_info?.nombre != null 
                    ? <p className={styles.recipeHeaderType}>{receta.categoria_info?.nombre}</p>
                    : isSuperUser && isStaff && <p className={styles.recipeHeaderTypeNoData}>Sin categoria</p> }
                    <div className={styles.recipeHeaderRating}>
                        {receta?.rating_promedio > 0 
                        ? <><div className={styles.recipeHeaderStars}>
                            {[...Array(5)].map((_, index) => (
                                <div key={index}>
                                    <ReactSVG
                                    src={`/src/assets/Iconos/${getStarIcon(index, receta?.rating_promedio)}.svg`}
                                    className="star-icon"
                                    />
                                </div>
                            ))}
                            </div>
                            <p className={styles.recipeRatingText}>Promedio: {receta?.rating_promedio.toFixed(2)} ({commentCount})</p></>
                        : <p className={styles.recipeRatingText}>Esta receta no tiene reseñas</p>
                        }
                    </div>
                    <Link to={`/user/${receta?.creador_info?.id}`} className={styles.recipeHeaderCreator}>
                        <img src={receta.creador_info?.profile_picture}/>
                        <p className={styles.recipeHeaderCreatorName}>{receta.creador_info?.name}</p>
                    </Link>
                    <div className={styles.timesContainer}>
                        <div className={styles.timePreparation}><ReactSVG src={timeIcon}/> {`${receta.tiempo_preparacion} Minutos`}</div>
                        <div className={styles.timePreparation}><ReactSVG src={flameIcon}/> {`${receta.tiempo_coccion} Minutos`}</div>
                    </div>
                    <p className={styles.recipeHeaderQuote}>{receta.frase}</p>
                    <div className={styles.recipeHeaderActions}>
                        {receta?.creador_info?.id != user?.id && isAuthenticated && <CircleButton text={favorito != -1 ? 'Eliminar de favoritos?' : 'Agregar a favoritos'} action={toggleFavorito} args={[]} iconName={favorito != -1 ? 'heart' : "heart-outline"} iconSize="3.5rem"/>}
                        <CircleButton action={(Object.keys(user).length != 0) ? generarRecetaPDF : navigateLogIn} args={[receta]} text="Descargar PDF" iconName={"document-attach"} iconSize="3.5rem"/>
                        { (isSuperUser || isStaff || receta?.creador_info?.id === user?.id) && <CircleButton action={navigate} args={[`/crear-receta?recetaEditar=${receta.id}`]} text="Editar Receta" iconName={"create"} iconSize="3.5rem"/> }
                    </div>
                </div>
                <RecipeContents recipe={receta}/>
                <RecipeNutritionalFacts/>
                <div className={`${styles.recipeHeaderShowTwo} ${user?.id == receta?.creador_info?.id ? styles.recipeHeaderNoComments : ''}`}>
                    {user?.id != receta?.creador_info?.id && <RecipeRating userComentario={userComentario} recipe_id={receta?.id} setUpdateRecipe={setUpdateRecipe}/>}
                    <RecipeComments recipeCreator={receta?.creador_info?.id} isSuperUser={isSuperUser} isStaff={isStaff} user={user} recipeId={receta?.id}/>
                </div>
            </div>
            <div className={styles.recipeImageTagsContainer}>
                <img className={styles.recipeHeaderImage} src={receta.foto_receta}/>
                <div className={styles.recipeTags}>
                    {receta.etiquetas_info.map(etiqueta => <p key={etiqueta.id} className={styles.recipeTag}>{etiqueta.nombre}</p>)}
                </div>
                <div className='mobileSpaceProcess'>
                    <RecipePreparation procedimiento={JSON.parse(receta.procedimiento)}/>
                </div>
            </div>
        </div>
    )
}