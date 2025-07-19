# Archivo para ejecutar el entrenamiento del modelo de machine learning, solo para uso sin necesidad de servidor web
# Este script se ejecuta directamente y no depende de Django REST Framework ni de las vistas de la API.
# No se debe usar en producción, solo para desarrollo y pruebas locales.

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_api.settings')
django.setup()

from app.machine_learning.entrenamiento import entrenar_modelo

def main():
    print("Iniciando entrenamiento del modelo")
    resultado = entrenar_modelo()
    print("Resultado del entrenamiento:")
    for key, value in resultado.items():
        print(f"{key}: {value}")

if __name__ == '__main__':
    main()
