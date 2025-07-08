import React from "react";
import styles from "./FileGenerating.module.css";
import { FadeLoader } from "react-spinners";
import { ReactSVG } from "react-svg";

const FileGenerating = ({ svg_start, svg_end, text = 'Generando PDF', canShow }) => {
  return (
    <div className={`${styles.container} ${canShow ? styles.showComponent : ""}`}>
      {/* Content container */}
      <div className={styles.content}>
        <div className={styles.svgAnimation}>
            <div className={styles.svgStart}><ReactSVG src={`/src/assets/Iconos/${svg_start}.svg`}/></div>
            <div className={styles.svgMiddle}><ReactSVG src={`/src/assets/Iconos/arrow-forward-circle.svg`}/></div>
            <div className={styles.svgEnd}><ReactSVG src={`/src/assets/Iconos/${svg_end}.svg`}/></div>
        </div>
        <div className={styles.text}>{text}</div>
        <FadeLoader color='rgba(252,115,2,1)'/>
      </div>
      
      {/* Black overlay */}
      <div className={styles.overlay}></div>
    </div>
  );
};

export default FileGenerating;