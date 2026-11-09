# Barber Shop

**[ Ver página del proyecto](https://sebast1023.github.io/Barber_shop/)**

Proyecto universitario para la gestión de citas, servicios y control de inventario de una barbería.

El sistema está desarrollado mediante una **arquitectura desacoplada**, que separa el Backend y el Frontend para facilitar su mantenimiento y desarrollo.

### Arquitectura del proyecto

![Diagrama de arquitectura](frontend/img/Diagram.png)

- **Backend:** API REST desarrollada con Django y Django REST Framework.
- **Frontend:** HTML, CSS y JavaScript nativo.
- **Base de datos:** PostgreSQL.

---

##  Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instaladas las siguientes herramientas:

| Herramienta | Versión / Requisito |
|---|---|
| Python | 3.10 o superior |
| PostgreSQL | Instalado y configurado |
| pgAdmin 4 | Para administrar la base de datos |
| Visual Studio Code | Con extensión Live Server |
| Git | Para clonar el repositorio |

---

## Paso 1. Configuración de la base de datos

1. Abre **pgAdmin 4** y crea una nueva base de datos. Por ejemplo:

   ```sql
   barber_shop
   ```

2. Selecciona la base de datos creada y abre la herramienta **Query Tool**.

3. Copia y ejecuta el script SQL incluido en el proyecto. Este contiene las instrucciones necesarias para crear:

   - Tablas (`CREATE TABLE`).
   - Vistas (`CREATE VIEW`).
   - Restricciones e integridad referencial.

Una vez ejecutado el script, la estructura de la base de datos estará lista.

---

##  Paso 2. Configuración del Backend (Django)

### 2.1. Acceder a la carpeta del Backend

Abre una terminal en la carpeta raíz del proyecto y ejecuta:

```bash
cd backend
```

### 2.2. Crear el entorno virtual

Para aislar las dependencias del proyecto, ejecuta:

```bash
python -m venv venv
```

### 2.3. Activar el entorno virtual

**Windows (CMD):**

```cmd
venv\Scripts\activate
```

**Windows (PowerShell):**

```powershell
.\venv\Scripts\Activate.ps1
```

**Linux / macOS:**

```bash
source venv/bin/activate
```

### 2.4. Instalar las dependencias

Con el entorno virtual activado, instala las librerías necesarias:

```bash
pip install django djangorestframework psycopg2-binary django-cors-headers
```

### 2.5. Configurar la conexión a PostgreSQL

Abre el archivo:

```text
backend/core/settings.py
```

Busca el bloque `DATABASES` y configura las credenciales correspondientes a tu instalación local de PostgreSQL:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'barber_shop',
        'USER': 'tu_usuario',
        'PASSWORD': 'tu_contraseña',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

**Importante:** Reemplaza `tu_usuario` y `tu_contraseña` por tus credenciales locales.

### 2.6. Sincronizar Django con la base de datos

Como las tablas ya fueron creadas mediante el script SQL, ejecuta:

```bash
python manage.py migrate --fake-initial
```

Este comando permite reconocer las tablas iniciales existentes cuando coinciden con las migraciones de Django, evitando intentar crearlas nuevamente.

### 2.7. Iniciar el servidor Backend

Finalmente, ejecuta:

```bash
python manage.py runserver
```

Si todo está configurado correctamente, podrás acceder a la API desde:

```text
http://127.0.0.1:8000/
```

---

##  Paso 3. Ejecutar el Frontend

1. Abre la carpeta raíz del proyecto en **Visual Studio Code**.
2. Ubica la carpeta `frontend`.
3. Abre el archivo principal `index.html` (o la página de inicio correspondiente).
4. Haz clic derecho y selecciona **Open with Live Server**.

El frontend se abrirá automáticamente en el navegador.

**Nota:** Asegúrate de que el servidor Backend de Django esté ejecutándose para que el frontend pueda comunicarse con la API REST.

---


