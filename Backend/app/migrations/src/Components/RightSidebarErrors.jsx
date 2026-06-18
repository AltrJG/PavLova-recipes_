import styles from './RightSidebarErrors.module.css';

export default function RightSidebarErrors({ centered, errors }) {
    if (Object.keys(errors).length === 0) return null; // Don't render anything if no errors

    return (
        <div className={`${styles.errorRightSidebarContainer} ${centered ? styles.errorRightSidebarContainerCentered : ""}`}>
            {Object.values(errors).map((error, index) => (
                <p key={index} className={styles.errorRightSidebar}>{error}</p>
            ))}
        </div>
    );
}