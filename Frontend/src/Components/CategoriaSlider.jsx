import { Swiper, SwiperSlide } from 'swiper/react';
import styles from './CategoriaSlider.module.css';
import { Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

export default function CategoriaSlider({categorias, activeCategoria, setActiveCategoria}){
    return(
        <div className={styles.sliderContainer}>
            <div className={`${"swiper-button-prev"} ${styles.prevButton}`}></div>
            <div className={`${"swiper-button-next"} ${styles.nextButton}`}></div>
            <Swiper
                modules={[Navigation]}
                navigation={{
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                }}
                spaceBetween={30}
                slidesPerView={"auto"}
                onSlideChange={() => console.log('slide change')}
                onSwiper={(swiper) => console.log(swiper)}
                enabled={true}
                
            >
                { categorias.map(categoria => <SwiperSlide onClick={() => setActiveCategoria(categoria.id)} className={styles.swiperContainer} key={categoria.id}>
                    <div className={`${styles.cardContainer} ${activeCategoria == categoria.id ? styles.activeCard : ""}`}>
                        <img className={styles.categoriaImagen} src={categoria.imagen}/>
                        <h4 className={styles.categoriaNombre}>{categoria.nombre}</h4>
                    </div>
                </SwiperSlide>) }
            </Swiper>
        </div>
    )
}