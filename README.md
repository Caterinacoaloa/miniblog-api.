# Miniblog API

API REST desarrollada como proyecto de práctica para administrar autores, publicaciones y comentarios. Está construida con Node.js, Express y PostgreSQL, y permite trabajar con operaciones CRUD, validaciones de datos y pruebas automatizadas.

## Objetivos del proyecto

- Conectar una aplicación Express con una base de datos PostgreSQL.
- Implementar operaciones CRUD mediante consultas SQL parametrizadas.
- Validar los datos recibidos y responder con códigos HTTP adecuados.
- Probar las rutas con Node.js, `node:test` y Supertest.
- Documentar la API con OpenAPI.

## Tecnologías

- Node.js y Express
- PostgreSQL y `pg`
- Supertest y `node:test`
- OpenAPI 3.0

## Estructura del proyecto

```text
.
├── data/             # Datos de ejemplo usados por el proyecto
├── db/               # Conexión a PostgreSQL y scripts SQL adicionales
├── routes/           # Rutas y validaciones HTTP
├── services/         # Consultas SQL y lógica de acceso a datos
├── test/             # Pruebas automatizadas de las rutas
├── openapi.yaml      # Documentación de la API
├── setup.sql         # Creación de tablas y relaciones
├── seed.sql          # Datos iniciales de ejemplo
└── server.js         # Configuración e inicio de Express
```

## Modelo de datos

- Un **autor** puede tener muchas publicaciones.
- Cada **publicación** pertenece a un autor.
- Los **comentarios** pertenecen a una publicación y a un autor.
- Al eliminar un autor o una publicación, PostgreSQL elimina en cascada sus registros relacionados.

Las tablas y sus relaciones están definidas en [`setup.sql`](./setup.sql). El esquema incluye claves foráneas con borrado en cascada e índices para las columnas de relación. El email de autor es único sin distinguir entre mayúsculas y minúsculas.

## Requisitos

- Node.js y npm
- PostgreSQL

## Instalación y ejecución local

Los siguientes comandos están escritos para PowerShell en Windows.

1. Instalar las dependencias del proyecto:

   ```powershell
   npm.cmd install
   ```

2. Crear la base de datos local:

   ```powershell
   createdb -U postgres miniblog
   ```

   Si el comando `createdb` no está disponible, se puede crear la base desde pgAdmin o con `psql`.

3. Crear las tablas en la base `miniblog`:

   ```powershell
   psql -U postgres -d miniblog -f .\setup.sql
   ```

   Ejecutá el esquema una sola vez por base de datos: el script crea las tablas y no está pensado para ejecutarse repetidamente sobre una base que ya las tiene.

   Si ya tenés una base creada con una versión anterior del esquema, aplicá la migración del email una sola vez:

   ```powershell
   psql -U postgres -d miniblog -f .\db\email-case-insensitive.sql
   ```

4. Opcionalmente, cargar los datos de ejemplo:

   ```powershell
   psql -U postgres -d miniblog -f .\seed.sql
   ```

   Ejecutá este paso solo si todavía no cargaste los datos de ejemplo.

5. Crear un archivo `.env` en la raíz del proyecto, tomando como referencia [`.env.example`](./.env.example). Completá las credenciales de tu PostgreSQL local. No compartas ni subas `.env`.

6. Comprobar la conexión con PostgreSQL:

   ```powershell
   npm.cmd run db:check
   ```

7. Iniciar el servidor:

   ```powershell
   npm.cmd start
   ```

La API queda disponible en `http://localhost:3000`. Para detener el servidor, presioná `Ctrl+C` en la terminal.

## Variables de entorno

La aplicación requiere estas variables:

| Variable | Descripción |
|---|---|
| `PGHOST` | Dirección del servidor PostgreSQL |
| `PGPORT` | Puerto de PostgreSQL |
| `PGDATABASE` | Nombre de la base de datos |
| `PGUSER` | Usuario de PostgreSQL |
| `PGPASSWORD` | Contraseña de PostgreSQL |

El archivo `.env.example` contiene valores de ejemplo, no credenciales reales.

## Endpoints

La especificación completa está en [`openapi.yaml`](./openapi.yaml). Para verla con Swagger Editor:

1. Abrí [Swagger Editor](https://editor.swagger.io/).
2. Elegí **File > Import File** y seleccioná `openapi.yaml` de este proyecto.
3. La documentación interactiva mostrará las rutas, parámetros y respuestas.

La API todavía no está desplegada, por lo que Swagger Editor documenta las rutas pero no puede enviar pedidos a una URL pública hasta completar el despliegue.

### Autores

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/authors` | Listar autores |
| `GET` | `/authors/:id` | Consultar un autor |
| `POST` | `/authors` | Crear un autor |
| `PUT` | `/authors/:id` | Actualizar un autor |
| `DELETE` | `/authors/:id` | Eliminar un autor |

Ejemplo para crear o actualizar un autor:

```json
{
  "name": "Ana",
  "email": "ana@example.com",
  "bio": "Autora del miniblog"
}
```

El nombre y el email son obligatorios; el email debe ser único sin importar las mayúsculas o minúsculas.

### Publicaciones

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/posts` | Listar publicaciones |
| `GET` | `/posts/:id` | Consultar una publicación |
| `GET` | `/posts/author/:authorId` | Listar publicaciones de un autor junto con sus datos |
| `POST` | `/posts` | Crear una publicación |
| `PUT` | `/posts/:id` | Actualizar una publicación |
| `DELETE` | `/posts/:id` | Eliminar una publicación |

Ejemplo para crear o actualizar una publicación:

```json
{
  "title": "Mi publicación",
  "content": "Contenido de ejemplo",
  "author_id": 1,
  "published": false
}
```

El título, el contenido y el identificador de un autor existente son obligatorios.

### Comentarios

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/posts/:postId/comments` | Listar comentarios de una publicación |
| `POST` | `/posts/:postId/comments` | Crear un comentario |

Ejemplo para crear un comentario:

```json
{
  "author_id": 1,
  "content": "¡Muy buen artículo!"
}
```

En una base nueva, la tabla de comentarios se crea con `setup.sql`. Si ya tenías una base creada antes de agregar comentarios, aplicá la migración una sola vez:

```powershell
psql -U postgres -d miniblog -f .\db\comments.sql
```

Para agregar los índices de las claves foráneas a una base existente, ejecutá también este script idempotente:

```powershell
psql -U postgres -d miniblog -f .\db\indexes.sql
```

### Estado del servicio

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Comprueba que la API responde y que PostgreSQL está conectado |

## Respuestas HTTP

- `200`: consulta o actualización exitosa.
- `201`: recurso creado.
- `204`: recurso eliminado.
- `400`: datos inválidos o referencia inexistente.
- `404`: recurso no encontrado.
- `409`: email de autor duplicado.
- `500`: error interno del servidor.
- `503`: la API no puede conectarse a PostgreSQL (`/health`).

## Pruebas

Ejecutar la suite automatizada:

```powershell
npm.cmd test
```

Las pruebas usan Supertest y reemplazan las consultas a la base de datos por simulaciones; no eliminan ni modifican los datos locales.

## Despliegue en Railway

El despliegue está pendiente hasta tener acceso a Railway. Cuando la cuenta esté habilitada:

1. En Railway, creá un proyecto nuevo con **Deploy from GitHub repo** y seleccioná este repositorio.
2. Agregá un servicio PostgreSQL al proyecto.
3. En las variables del servicio de la API, configurá `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER` y `PGPASSWORD` con referencias a las variables del servicio PostgreSQL. Por ejemplo: `${{Postgres.PGHOST}}`. Reemplazá `Postgres` por el nombre real de tu servicio de base de datos.
4. Railway inicia la API con `npm start` y asigna el puerto. Para comprobarla desde internet, en el servicio de la API abrí **Settings > Networking > Generate Domain**. Railway mostrará la URL pública de la API, con un formato similar a `https://nombre-de-tu-app.up.railway.app`. Probá esa dirección agregando `/health`.
5. La conexión **interna** a PostgreSQL se configura con las variables del servicio de base de datos, como `PGHOST`; Railway las proporciona para la comunicación privada entre servicios. No uses la dirección interna de la base como URL pública de la API.
6. Creá las tablas en PostgreSQL ejecutando `setup.sql` contra la base de Railway. Para ejecutarlo desde tu computadora necesitás `psql` y una URL de conexión pública de PostgreSQL, si Railway la ofrece o habilitás el acceso público. Por ejemplo:

   ```powershell
   $env:DATABASE_URL = "URL_PUBLICA_DE_POSTGRES_DE_RAILWAY"
   psql $env:DATABASE_URL -f .\setup.sql
   Remove-Item Env:DATABASE_URL
   ```

   Si Railway no ofrece una URL pública o preferís no habilitarla, ejecutá el SQL desde un entorno conectado a la red privada de Railway. Mantené cualquier URL de conexión como un secreto: no la escribas en archivos del proyecto ni la subas a GitHub. Ejecutá `setup.sql` una sola vez en la base remota.

## Uso de herramientas de IA

Para realizar este proyecto usé GitHub Copilot como apoyo para resolver dudas y entender algunos pasos de Express, PostgreSQL, Git y Railway. También me ayudó a mejorar la documentación y a revisar algunas partes del código. Usé sus respuestas como orientación mientras trabajaba en el proyecto.

## Repositorio

El código fuente y el historial de cambios están disponibles en [GitHub](https://github.com/Caterinacoaloa/miniblog-api.).
