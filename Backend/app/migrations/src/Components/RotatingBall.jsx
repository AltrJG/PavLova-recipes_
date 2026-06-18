import styles from './RotatingBall.module.css';

export default function RotatingBall(){
    return(
        <div className={styles.rotatingBallContainer}>
            <div className={styles.rotatingBall}></div>
        </div>
    )
}