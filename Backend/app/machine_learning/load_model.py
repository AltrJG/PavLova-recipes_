from pathlib import Path
import joblib

def get_modelo(force_reload=False):
    if force_reload or not hasattr(get_modelo, "_modelo"):
        MODEL_DIR = Path(__file__).resolve().parent.parent.parent # Ajustar según la estructura del proyecto, compatible entre sistemas operativos
        modelo_path = MODEL_DIR / 'modelo_randomforest.pkl'
        get_modelo._modelo = joblib.load(modelo_path)
    return get_modelo._modelo
