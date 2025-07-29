import joblib
from app.storage_backends import ModelPrivateAzureStorage

def get_modelo(force_reload=False):
    if force_reload or not hasattr(get_modelo, "_modelo"):
        storage = ModelPrivateAzureStorage()
        with storage.open('modelo_randomforest.pkl', 'rb') as f:
            get_modelo._modelo = joblib.load(f)
    return get_modelo._modelo
