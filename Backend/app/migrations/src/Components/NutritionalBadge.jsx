import styles from "./NutritionalBadge.module.css";

const NutritionalBadge = ({ title, unit, value, isNumber }) => {
  return (
    <div className={styles.badgeContainer}>
      <div className={styles.badgeTop}>
        <p className={styles.badgeTitle}>{title}</p>
        <p className={styles.badgeUnit}>{unit}</p>
        { isNumber && <p className={styles.badgeNumericValue}>{value}</p> }
      </div>
      {!isNumber && <div className={styles.badgeValueContainer}>
        <p className={styles.badgeValue}>{value != 'NaN' ? value : 0}%</p>
      </div>}
    </div>
  );
};

export default NutritionalBadge;