import BurbujaCanvas from '../Components/BurbujaCanvas';
import styles from './CrearReceta.module.css';

export default function CrearReceta() {
  return (
    <div className={styles.container}>
      <BurbujaCanvas />
      <div className={styles.formContainer}>
        <h1>Crear Receta</h1>
        <form>
          <label>Nombre de la receta:</label>
          <input type="text" />
          <label>Ingredientes:</label>
          <textarea />
          <button type="submit">Guardar receta</button>
        </form>
      </div>
    </div>
  );
}