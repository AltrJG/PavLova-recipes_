import joblib
#from app.storage_backends import ModelPrivateAzureStorage
from pathlib import Path

def get_modelo(force_reload=False):
    if force_reload or not hasattr(get_modelo, "_modelo"):
        MODEL_DIR = Path(__file__).resolve().parent.parent.parent # Ajustar según la estructura del proyecto, compatible entre sistemas operativos
        modelo_path = MODEL_DIR / 'modelo_randomforest.pkl'
        get_modelo._modelo = joblib.load(modelo_path)
        #storage = ModelPrivateAzureStorage()
        #with storage.open('modelo_randomforest.pkl', 'rb') as f:
        #    get_modelo._modelo = joblib.load(f)
    return get_modelo._modelo
