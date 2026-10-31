# Miniblog API

API REST de un miniblog construida con Node.js, Express y PostgreSQL.

## Requisitos

- Node.js y npm
- PostgreSQL

## Instalación local

1. Instalar dependencias:

   ```powershell
   npm.cmd install
   ```

2. Crear la base de datos `miniblog` en PostgreSQL.
3. Crear las tablas ejecutando `setup.sql` una sola vez:

   ```powershell
   psql -U postgres -d miniblog -f .\setup.sql
   ```

4. Si todavía no hay datos de prueba, cargarlos una sola vez:

   ```powershell
   psql -U postgres -d miniblog -f .\seed.sql
   ```

5. Crear `.env` en la carpeta principal a partir de `.env.example` y completar los datos locales de conexión. No compartir ni subir `.env`.
6. Comprobar la conexión:

   ```powershell
   npm.cmd run db:check
   ```

7. Iniciar la API:

   ```powershell
   npm.cmd start
   ```

La API estará disponible en `http://localhost:3000`. Para detenerla, presionar `Ctrl+C` en PowerShell.

## Endpoints

La especificación OpenAPI completa está en [`openapi.yaml`](./openapi.yaml). Podés abrirla con Swagger Editor para explorar las rutas y probar ejemplos.

### Autores

| Método | Ruta | Acción |
|---|---|---|
| GET | `/authors` | Listar autores |
| GET | `/authors/:id` | Consultar un autor |
| POST | `/authors` | Crear un autor |
| PUT | `/authors/:id` | Actualizar un autor |
| DELETE | `/authors/:id` | Eliminar un autor |

Ejemplo de cuerpo JSON para crear o actualizar un autor:

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
| GET | `/posts` | Listar publicaciones |
| GET | `/posts/:id` | Consultar una publicación |
| GET | `/posts/author/:authorId` | Listar publicaciones de un autor con sus datos |
| POST | `/posts` | Crear una publicación |
| PUT | `/posts/:id` | Actualizar una publicación |
| DELETE | `/posts/:id` | Eliminar una publicación |

Ejemplo de cuerpo JSON para crear o actualizar una publicación:

```json
{
  "title": "Mi publicación",
  "content": "Contenido de ejemplo",
  "author_id": 1,
  "published": false
}
```

### Comentarios

La tabla de comentarios se crea automáticamente con `setup.sql` en una base nueva. Si ya ejecutaste el esquema, aplicá la migración una sola vez:

```powershell
psql -U postgres -d miniblog -f .\db\comments.sql
```

| Método | Ruta | Acción |
|---|---|---|
| GET | `/posts/:postId/comments` | Listar comentarios de una publicación |
| POST | `/posts/:postId/comments` | Crear un comentario para una publicación |

Ejemplo de cuerpo JSON para crear un comentario:

```json
{
  "author_id": 1,
  "content": "¡Muy buen artículo!"
}
```

Si se elimina una publicación, se eliminan sus comentarios. Si se elimina un autor, también se eliminan sus comentarios.

### Salud

| Método | Ruta | Acción |
|---|---|---|
| GET | `/health` | Comprobar que la API responde y que PostgreSQL está conectado |

## Pruebas

Ejecutar las pruebas automatizadas:

```powershell
npm.cmd test
```

Las pruebas usan Supertest y simulan las consultas a la base de datos; no borran ni modifican los datos locales.

## Despliegue en Railway

Configurar las variables de conexión de PostgreSQL en el entorno del servicio, sin subir `.env`. Railway debe ejecutar `npm start`. Aplicar el esquema inicial en una base nueva o la migración de comentarios en una base existente antes de probar las rutas de comentarios.
