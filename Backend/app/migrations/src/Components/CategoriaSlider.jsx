import { Swiper, SwiperSlide } from 'swiper/react';
import styles from './CategoriaSlider.module.css';
import { Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

export default function CategoriaSlider({categorias, activeCategoria, setActiveCategoria, isFilter = false}){
    return(
        <div className={`${styles.sliderContainer} ${isFilter ? styles.filterSlider : ""}`}>
            <div className={`${"swiper-button-prev"} ${styles.prevButton}`}></div>
            <div className={`${"swiper-button-next"} ${styles.nextButton}`}></div>
            <Swiper
                modules={[Navigation]}
                navigation={{
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                }}
                spaceBetween={isFilter ? 15 : 30}
                slidesPerView={"auto"}
                enabled={true}
                
            >
                { categorias.map(categoria => <SwiperSlide onClick={() => {categoria.id == activeCategoria ? setActiveCategoria('') : setActiveCategoria(categoria.id)}} className={styles.swiperContainer} key={categoria.id}>
                    <div className={`${styles.cardContainer} ${isFilter ? styles.filterContainer : ""} ${activeCategoria == categoria.id ? styles.activeCard : ""}`}>
                        <img className={styles.categoriaImagen} src={categoria.foto_categoria}/>
                        <h4 className={styles.categoriaNombre}>{categoria.nombre}</h4>
                    </div>
                </SwiperSlide>) }
            </Swiper>
        </div>
    )
}