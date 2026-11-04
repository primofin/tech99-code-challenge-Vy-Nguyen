# Crude Server

A backend CRUD service built with **Express**, **TypeScript** and **SQLite** (via `better-sqlite3`).
Request validation is done with **zod**. The managed resource is a `Product`.

## Requirements

- Node.js 18 or newer
- npm

## Setup

```bash
npm install
cp .env.example .env     # optional, defaults are shown below
```

### Configuration (environment variables)

| Variable        | Default          | Description                          |
| --------------- | ---------------- | ------------------------------------ |
| `PORT`          | `3000`           | HTTP port                            |
| `DATABASE_FILE` | `./data/app.db`  | SQLite file path (created on start)  |

The database file, directory and tables are created automatically on first start. No migration step is needed.

## Run

```bash
npm run dev          # development, auto-reload (tsx)
npm run build        # compile to ./dist
npm start            # run compiled build
npm run typecheck    # type-check only
```

Server starts at `http://localhost:3000`. Health check: `GET /health`.

## Project structure

```
src/
  index.ts              entry point, graceful shutdown
  app.ts                Express app factory
  config.ts             env configuration
  db.ts                 SQLite connection + schema
  product.ts            types and zod schemas
  productRepository.ts  all SQL (parameterised queries)
  productRoutes.ts      CRUD routes
  errors.ts             HttpError, 404 + error middleware
```

## Resource: Product

| Field         | Type                      | Notes                         |
| ------------- | ------------------------- | ----------------------------- |
| `id`          | integer                   | auto-generated                |
| `name`        | string (1-200)            | required                      |
| `description` | string (max 2000)         | default `""`                  |
| `price`       | number >= 0               | required                      |
| `category`    | string (1-100)            | required                      |
| `status`      | `active` \| `archived`    | default `active`              |
| `createdAt`   | ISO timestamp             | auto                          |
| `updatedAt`   | ISO timestamp             | auto                          |

## API

Base path: `/api/products`

| Method | Path        | Description                | Success |
| ------ | ----------- | -------------------------- | ------- |
| POST   | `/`         | Create a product           | 201     |
| GET    | `/`         | List products with filters | 200     |
| GET    | `/:id`      | Get product details        | 200     |
| PATCH  | `/:id`      | Update (partial) a product | 200     |
| DELETE | `/:id`      | Delete a product           | 204     |

### List query parameters

| Param      | Description                                          |
| ---------- | ---------------------------------------------------- |
| `q`        | text search in name/description                      |
| `category` | exact category match                                 |
| `status`   | `active` or `archived`                               |
| `minPrice` / `maxPrice` | price range                             |
| `page`     | page number, default `1`                             |
| `limit`    | page size, default `10`, max `100`                   |
| `sortBy`   | `createdAt` (default), `price`, `name`               |
| `order`    | `asc` or `desc` (default)                            |

Response shape: `{ "data": [...], "meta": { "total", "page", "limit", "totalPages" } }`

### Errors

Errors are JSON: `{ "error": "message" }`. Validation errors return `400` with
`details: [{ path, message }]`. Unknown ids return `404`.

## Example requests

```bash
# Create
curl -X POST localhost:3000/api/products \
  -H 'Content-Type: application/json' \
  -d '{"name":"Mechanical Keyboard","description":"75% layout","price":89.9,"category":"accessories"}'

# List with filters
curl 'localhost:3000/api/products?category=accessories&minPrice=50&sortBy=price&order=asc&page=1&limit=5'

# Search
curl 'localhost:3000/api/products?q=keyboard'

# Get one
curl localhost:3000/api/products/1

# Update
curl -X PATCH localhost:3000/api/products/1 \
  -H 'Content-Type: application/json' \
  -d '{"price":79.9,"status":"archived"}'

# Delete
curl -X DELETE localhost:3000/api/products/1
```