# 🚀 Backend — Django REST Framework

API REST construida con **Django** y **Django REST Framework**, con autenticación JWT y base de datos PostgreSQL.

---

## 📋 Requisitos previos

Asegúrate de tener instalado lo siguiente antes de comenzar:

- Python 3.14+
- PostgreSQL
- `pip` y `venv`
- `openssl` (para generar claves seguras)
- Docker y Docker Compose (para entorno containerizado)

---

## ⚙️ Configuración del entorno

### 1. Crear el entorno virtual

```bash
python -m venv venv
```

### 2. Activar el entorno virtual

**Linux / macOS:**
```bash
source venv/bin/activate
```

**Windows (CMD):**
```cmd
venv\Scripts\activate
```

**Windows (PowerShell):**
```powershell
venv\Scripts\Activate.ps1
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

---

## 🔐 Variables de entorno

Crea el archivo `.env` en la raíz del directorio `/Backend` tomando como base el archivo `.env.example`:

```dotenv
# Comando para generar las key: openssl rand -hex 32
DJANGO_SECRET_KEY=cambiar_por_cadena_segura_generada_con_openssl
JWT_SIGNING_KEY=cambiar_por_cadena_segura_generada_con_openssl

# --- Base de Datos ---
# Nombre de la base de datos a conectar
POSTGRESQL_DATABASE=nombre_de_tu_bd
# Usuario de la base de datos (usualmente 'postgres' en local)
POSTGRESQL_USER=postgres
# Contraseña del usuario
# Nota: Si usas caracteres especiales, asegúrate de que sean compatibles con la URL de conexión.
POSTGRESQL_PASSWORD=cambiar_por_contraseña_segura
# Dirección del host ('localhost' en local, 'db' si se usa Docker)
POSTGRESQL_HOST=localhost
# Puerto de conexión (5432 es el default de PostgreSQL)
POSTGRESQL_PORT=5432

# --- Configuración de Celery & Redis ---
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
CELERY_TIMEZONE=America/Mexico_City

# --- Django Settings Env ---
DJANGO_SETTINGS_MODULE=config.dev
```

> ⚠️ **Nunca subas tu archivo `.env` al repositorio.** Asegúrate de que esté listado en `.gitignore`.

Para generar claves seguras, ejecuta:

```bash
openssl rand -hex 32
```

---

## 🗃️ Base de datos

### 4. Aplicar migraciones

```bash
python manage.py migrate
```

---

## ✅ Verificación del proyecto

### 5. Verificar configuración

```bash
python manage.py check
```

---

## ▶️ Ejecutar el servidor

### 6. Iniciar el servidor de desarrollo

```bash
python manage.py runserver
```

El servidor estará disponible en: [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## 🐳 Docker

> ⚠️ Todos los comandos de Docker deben ejecutarse desde la **raíz del proyecto** (donde se encuentra `docker-compose.yml`), no desde `/Backend`.
> El flag `--env-file ./Backend/.env` es obligatorio porque el `.env` vive dentro del subdirectorio `Backend/`.

### Levantar el proyecto

```bash
docker compose --env-file ./Backend/.env up -d
```

### Levantar el proyecto (reconstruyendo imágenes)

Úsalo cuando cambies dependencias en `requirements.txt` o el `Dockerfile`:

```bash
docker compose --env-file ./Backend/.env build --no-cache
docker compose --env-file ./Backend/.env up -d
```

### Bajar el proyecto

```bash
docker compose --env-file ./Backend/.env down
```

### Bajar el proyecto y eliminar volúmenes (reset completo de DB y media)

> ⚠️ Esto elimina todos los datos almacenados en PostgreSQL y los archivos de media. El código no se ve afectado.

```bash
docker compose --env-file ./Backend/.env down -v
```

---

### Migraciones y base de datos

```bash
# Generar migraciones
docker compose --env-file ./Backend/.env exec api python manage.py makemigrations

# Aplicar migraciones
docker compose --env-file ./Backend/.env exec api python manage.py migrate

# Verificar configuración del proyecto
docker compose --env-file ./Backend/.env exec api python manage.py check
```

### Superusuario

```bash
docker compose --env-file ./Backend/.env exec api python manage.py createsuperuser
```

### Shell interactivo

```bash
docker compose --env-file ./Backend/.env exec api python manage.py shell
```

### Datos de prueba

Genera usuarios mock para pruebas de rendimiento del índice GIN (ver sección de búsqueda):

```bash
# 50,000 usuarios (default)
docker compose --env-file ./Backend/.env exec api python manage.py seed_users

# Número personalizado
docker compose --env-file ./Backend/.env exec api python manage.py seed_users --count 100000 --batch 10000
```

### Grupos y permisos base

```bash
docker compose --env-file ./Backend/.env exec api python manage.py setup_groups
```

### Logs

```bash
# Todos los servicios
docker compose --env-file ./Backend/.env logs -f

# Solo la API
docker compose --env-file ./Backend/.env logs -f api

# Solo los workers de Celery
docker compose --env-file ./Backend/.env logs -f celery_worker
docker compose --env-file ./Backend/.env logs -f celery_beat
```

---

## 📁 Estructura del proyecto

```
Backend/
├── .env                  # Variables de entorno (no incluir en git)
├── .env.example          # Plantilla de variables de entorno
├── manage.py
├── requirements.txt
├── requirements_dev.txt
└── ...
```

---

## 🛠️ Comandos útiles

### Local

| Comando | Descripción |
|---|---|
| `python manage.py makemigrations` | Genera nuevas migraciones |
| `python manage.py migrate` | Aplica migraciones pendientes |
| `python manage.py createsuperuser` | Crea un superusuario |
| `python manage.py check` | Verifica la configuración del proyecto |
| `python manage.py shell` | Abre el shell interactivo de Django |
| `python manage.py runserver` | Inicia el servidor de desarrollo |
| `python manage.py seed_users --count 50000` | Genera usuarios mock para pruebas |
| `python manage.py setup_groups` | Crea grupos y permisos base |

### Docker

| Comando | Descripción |
|---|---|
| `docker compose --env-file ./Backend/.env up -d` | Levanta todos los servicios en segundo plano |
| `docker compose --env-file ./Backend/.env down` | Detiene y elimina los contenedores |
| `docker compose --env-file ./Backend/.env down -v` | Reset completo (elimina contenedores y volúmenes) |
| `docker compose --env-file ./Backend/.env build --no-cache` | Reconstruye las imágenes desde cero |
| `docker compose --env-file ./Backend/.env exec api python manage.py migrate` | Aplica migraciones dentro del contenedor |
| `docker compose --env-file ./Backend/.env exec api python manage.py createsuperuser` | Crea superusuario dentro del contenedor |
| `docker compose --env-file ./Backend/.env exec api python manage.py setup_groups` | Crea grupos y permisos base |
| `docker compose --env-file ./Backend/.env logs -f api` | Muestra logs en tiempo real de la API |

---

## 📄 Licencia

Este proyecto es de uso privado. Todos los derechos reservados.