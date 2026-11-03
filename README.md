# Miniblog API

API REST de práctica para administrar autores, publicaciones y comentarios. Está desarrollada con Node.js, Express y PostgreSQL.

## Funcionalidades

- CRUD de autores y publicaciones.
- Listado de publicaciones por autor.
- Creación y listado de comentarios por publicación.
- Validación de datos y respuestas HTTP consistentes.
- Consultas SQL parametrizadas.
- Migraciones de base de datos ejecutadas al iniciar el servidor.
- Pruebas automatizadas con Supertest y `node:test`.
- Documentación OpenAPI en [`openapi.yaml`](./openapi.yaml).

## Tecnologías utilizadas

- Node.js y Express
- PostgreSQL y `pg`
- Supertest y `node:test`
- OpenAPI 3.0

## Estructura

```text
.
├── database/
│   ├── migrations/       # Esquema y cambios versionados de la base
│   └── seeds/            # Datos de ejemplo opcionales
├── scripts/              # Herramientas para revisar la conexión
├── src/
│   ├── config/           # Pool de PostgreSQL
│   ├── db/               # Ejecutor de migraciones
│   ├── middlewares/      # Manejo global de errores
│   ├── modules/
│   │   ├── authors/      # Rutas, controladores y servicios de autores
│   │   ├── posts/        # Rutas, controladores y servicios de publicaciones
│   │   └── comments/     # Rutas, controladores y servicios de comentarios
│   ├── utils/            # Funciones compartidas
│   ├── app.js            # Configuración de Express
│   └── server.js         # Migraciones e inicio del servidor
├── test/                 # Pruebas automatizadas
├── openapi.yaml          # Especificación de la API
└── package.json
```

En cada módulo, `routes` conecta URLs con `controllers`; los controladores validan la solicitud y responden, mientras que los `services` contienen las consultas SQL.

## Modelo de datos

- Un autor puede tener muchas publicaciones.
- Cada publicación pertenece a un autor.
- Cada comentario pertenece a una publicación y a un autor.
- Las claves foráneas eliminan en cascada publicaciones y comentarios relacionados.
- El email de autor es único sin distinguir mayúsculas y minúsculas.

## Requisitos

- Node.js y npm
- PostgreSQL

## Ejecución local en Windows

Los siguientes comandos están pensados para PowerShell.

1. Instalá las dependencias:

   ```powershell
   npm.cmd install
   ```

2. Creá una base PostgreSQL vacía:

   ```powershell
   createdb -U postgres miniblog
   ```

   También podés crearla desde pgAdmin.

3. Creá `.env` en la raíz tomando como referencia [`.env.example`](./.env.example) y completá los datos de tu PostgreSQL local. No compartas ni subas `.env`.

4. Aplicá las migraciones:

   ```powershell
   npm.cmd run db:migrate
   ```

   El sistema registra las migraciones aplicadas en `schema_migrations`, por lo que no las repite al reiniciar.

5. Opcionalmente, cargá datos de ejemplo una sola vez:

   ```powershell
   psql -U postgres -d miniblog -f .\database\seeds\001_seed.sql
   ```

6. Comprobá la conexión e iniciá la API:

   ```powershell
   npm.cmd run db:check
   npm.cmd start
   ```

La API local queda disponible en `http://localhost:3000`. Para detenerla, presioná `Ctrl+C`.

## Variables de entorno

La API requiere estas variables tanto localmente como en Render:

| Variable | Descripción |
|---|---|
| `PGHOST` | Host de PostgreSQL |
| `PGPORT` | Puerto, normalmente `5432` |
| `PGDATABASE` | Nombre de la base |
| `PGUSER` | Usuario de PostgreSQL |
| `PGPASSWORD` | Contraseña de PostgreSQL |

`.env.example` contiene valores de ejemplo. Las credenciales reales van en `.env` local o en el panel de variables de Render, nunca en GitHub.

## Endpoints

La especificación completa está en [`openapi.yaml`](./openapi.yaml). Para verla de forma interactiva, abrí [Swagger Editor](https://editor.swagger.io/) e importá el archivo. La API debe estar desplegada para poder enviar solicitudes a una URL pública.

### Autores

| Método | Ruta | Acción |
|---|---|---|
| `GET` | `/authors` | Listar autores |
| `GET` | `/authors/:id` | Consultar un autor |
| `POST` | `/authors` | Crear un autor |
| `PUT` | `/authors/:id` | Actualizar un autor |
| `DELETE` | `/authors/:id` | Eliminar un autor |

Ejemplo de autor:

```json
{
  "name": "Ana",
  "email": "ana@example.com",
  "bio": "Autora del miniblog"
}
```

### Publicaciones

| Método | Ruta | Acción |
|---|---|---|
| `GET` | `/posts` | Listar publicaciones |
| `GET` | `/posts/:id` | Consultar una publicación |
| `GET` | `/posts/author/:authorId` | Listar publicaciones con datos del autor |
| `POST` | `/posts` | Crear una publicación |
| `PUT` | `/posts/:id` | Actualizar una publicación |
| `DELETE` | `/posts/:id` | Eliminar una publicación |

Ejemplo de publicación:

```json
{
  "title": "Mi publicación",
  "content": "Contenido de ejemplo",
  "author_id": 1,
  "published": false
}
```

### Comentarios y salud

| Método | Ruta | Acción |
|---|---|---|
| `GET` | `/posts/:postId/comments` | Listar comentarios de una publicación |
| `POST` | `/posts/:postId/comments` | Crear un comentario |
| `GET` | `/health` | Comprobar la API y su conexión con PostgreSQL |

Ejemplo de comentario:

```json
{
  "author_id": 1,
  "content": "¡Muy buen artículo!"
}
```

## Códigos HTTP

- `200`: consulta o actualización correcta.
- `201`: recurso creado.
- `204`: recurso eliminado.
- `400`: datos inválidos o referencia inexistente.
- `404`: recurso o ruta no encontrados.
- `409`: email duplicado.
- `500`: error interno.
- `503`: base de datos no disponible en `/health`.

## Pruebas

Ejecutá todas las pruebas con:

```powershell
npm.cmd test
```

Las pruebas usan Supertest y simulan las consultas a PostgreSQL para no modificar datos reales.

## Despliegue en Render

1. Creá una base PostgreSQL en Render.
2. Creá un **Web Service** conectado a este repositorio y a la rama `main`.
3. Configurá el comando de build `npm install` y el comando de inicio `npm start`.
4. En **Environment** del Web Service, agregá `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER` y `PGPASSWORD` con los datos internos de la base PostgreSQL. Elegí la misma región para ambos servicios.
5. Al iniciar, `npm start` aplica las migraciones pendientes y luego levanta Express. No hace falta ejecutar los archivos de migración manualmente.
6. Render proporciona la URL pública del Web Service. Probala agregando `/health`.
7. Para cargar datos de ejemplo en la base remota, ejecutá el seed una sola vez usando `psql` y la URL externa de PostgreSQL. Mantené esa URL como secreto.

Las instancias gratuitas de Render pueden suspenderse por inactividad y tener límites de uso. Revisá las condiciones vigentes de Render antes de elegir un plan.

## Uso de herramientas de IA

Usé GitHub Copilot como apoyo para resolver dudas y entender partes de Express, PostgreSQL, Git y Render, además de revisar la documentación y la organización del proyecto.

## Repositorio

El código y su historial de cambios están en [GitHub](https://github.com/Caterinacoaloa/miniblog-api.).
