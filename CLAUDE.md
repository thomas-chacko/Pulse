# CLAUDE.md — Project Intelligence for Pulse MCP Server

This file provides Claude with the full context needed to work effectively in this codebase.

---

## Project Overview

**Pulse** is a personal Model Context Protocol (MCP) server that lets AI assistants (Claude Desktop, ChatGPT, Cursor) manage personal data through natural language. It exposes 24 MCP tools across three domains: **Todo**, **Finance**, and **GitHub**.

- **Runtime:** Node.js 20 (ES Modules)
- **Framework:** Express.js 5
- **Database:** MongoDB 7 (via native `mongodb` driver, no Mongoose)
- **MCP SDK:** `@modelcontextprotocol/sdk` (Streamable HTTP transport)
- **GitHub API:** `@octokit/rest`
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions → Render

**Production URL:** https://pulse-1tdk.onrender.com

---

## Project Structure

```
Pulse/
├── server.js                   # Express entry point, MCP endpoint, health check
├── config/
│   └── database.js             # MongoDB connection (singleton pattern, connection pooling)
├── middleware/
│   ├── auth.js                 # API key authentication (Bearer token + query param)
│   └── rateLimiter.js          # Rate limiting (general + strict for write ops)
├── mcp/
│   ├── mcpServer.js            # MCP server factory (creates new Server per request)
│   ├── mcpTools.js             # Tool schemas/definitions (24 tools, JSON Schema format)
│   └── mcpHandlers.js          # Tool execution dispatcher (switch-case → Model calls)
├── tools/
│   ├── todo/
│   │   ├── todoController.js   # HTTP request handlers + validation
│   │   ├── todoModel.js        # MongoDB CRUD operations (collection: "todos")
│   │   └── todoRoutes.js       # Express router definitions
│   ├── finance/
│   │   ├── financeController.js  # HTTP handlers + category validation
│   │   ├── financeModel.js     # MongoDB CRUD + aggregation (collection: "transactions")
│   │   └── financeRoutes.js    # Express router definitions
│   └── github/
│       ├── githubController.js # HTTP handlers, multi-account support
│       ├── githubModel.js      # Octokit API wrapper (personal + company accounts)
│       └── githubRoutes.js     # Express router definitions
├── Dockerfile                  # Multi-stage: base → production | development
├── docker-compose.yml          # Production stack (mcp-server + mongodb)
├── docker-compose.dev.yml      # Dev overrides (volume mounts, debug port 9229)
├── Makefile                    # Docker shortcuts (make up, make dev, make down, etc.)
├── .github/workflows/ci.yml   # CI pipeline (test, audit, lint, build)
├── .env                        # Environment variables (gitignored)
├── .env.example                # Env template for developers
├── .gitignore
├── .dockerignore
├── package.json
└── package-lock.json
```

---

## Architecture Pattern

### Feature-Based MVC

Each tool follows a strict **Controller → Model → Routes** pattern:

```
Routes (thin)  →  Controller (validation + business logic)  →  Model (DB operations only)
```

- **Routes:** Only define HTTP method + path → controller function mapping. No logic.
- **Controllers:** Handle request parsing, input validation, error formatting. Call model functions.
- **Models:** Pure data layer. All MongoDB operations live here. No HTTP concerns.

### MCP Layer (Separate from REST)

The MCP protocol has its own parallel layer:
- `mcpTools.js` — Declares tool schemas (name, description, inputSchema with JSON Schema)
- `mcpHandlers.js` — Dispatches tool calls directly to **Model** functions (bypasses Controllers)
- `mcpServer.js` — Factory that creates a new `Server` instance per HTTP request (stateless)

**Important:** MCP handlers call Models directly, NOT Controllers. When adding a new tool, you must wire it in both the REST layer (controller + routes) AND the MCP layer (tools + handlers).

### Dual Interface

Every tool is accessible through two interfaces:
1. **REST API** — `POST/GET/PUT/DELETE /api/tools/{tool}/*` (for direct HTTP clients)
2. **MCP Protocol** — `POST /mcp` (for AI assistants like Claude Desktop)

---

## Key Technical Details

### ES Modules

The project uses `"type": "module"` in package.json. All imports use ESM syntax:
```js
import express from 'express';
import { getDB } from '../../config/database.js';
```
**Always include the `.js` extension** in relative imports.

### MongoDB (No Mongoose)

- Uses the native `mongodb` driver directly (not Mongoose)
- No schemas/models — validation is done in Controllers
- Connection is a singleton via `config/database.js` (`connectDB()`, `getDB()`, `closeDB()`)
- Database name extracted from `MONGODB_URI` or defaults to `"pulse"`
- Collections: `todos`, `transactions`
- IDs are MongoDB `ObjectId` — always validate with `ObjectId.isValid(id)` before querying

### MCP Transport

- Uses `StreamableHTTPServerTransport` (not SSE or stdio)
- Stateless: `sessionIdGenerator: undefined` — each POST to `/mcp` creates a fresh server+transport
- Server and transport are closed when the HTTP response closes

### Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `MONGODB_URI` | ✅ Yes | — | MongoDB connection string |
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment |
| `API_KEY` | Recommended | — | API key for authentication (leave empty to disable) |
| `ALLOWED_ORIGINS` | No | Allow all | Comma-separated CORS origins (production only) |
| `GITHUB_PERSONAL_TOKEN` | For GitHub tool | — | Personal GitHub PAT |
| `GITHUB_PERSONAL_USERNAME` | For GitHub tool | — | Personal GitHub username |
| `GITHUB_COMPANY_TOKEN` | For GitHub tool | — | Company GitHub PAT |
| `GITHUB_COMPANY_USERNAME` | For GitHub tool | — | Company GitHub username |

### Docker Setup

- **`make up`** — Production mode (`docker compose up -d`)
- **`make dev`** — Development mode (mounts source as volume, hot-reload via `node --watch`, debug port 9229)
- **`make down`** — Stop containers
- **`make clean`** — Remove everything (containers + volumes + images)
- **`make rebuild`** — Fresh rebuild (down → build → up)
- **`make logs`** — Stream container logs
- **`make shell`** — Shell into MCP server container
- **`make mongo`** — Open mongosh in MongoDB container

The Dockerfile is multi-stage:
- `base` → installs production deps
- `production` → runs `node server.js`
- `development` → installs all deps, runs `npm run dev`

Docker Compose overrides `MONGODB_URI` to `mongodb://mongodb:27017/pulse` (internal service name).

---

## API Response Format

All REST endpoints return a consistent JSON format:

```json
// Success
{ "success": true, "todo": { ... } }
{ "success": true, "todos": [...], "count": 5, "stats": { "total": 10, "pending": 6, "completed": 4 } }

// Error
{ "success": false, "error": "Title is required" }
{ "success": false, "error": "Failed to add todo", "message": "..." }
```

MCP handlers return:
```json
// Success
{ "content": [{ "type": "text", "text": "{ ... JSON stringified ... }" }] }

// Error
{ "content": [{ "type": "text", "text": "{ \"error\": \"...\" }" }], "isError": true }
```

---

## Validation Rules

### Todo
- `title` — Required, max 200 chars, trimmed
- `priority` — Must be: `low`, `medium`, `high` (default: `medium`)
- `status` — Must be: `pending`, `completed` (default: `pending`)
- `tags` — Array of strings
- `dueDate` — Optional date string

### Finance
- `amount` — Required, must be > 0, parsed as float
- `type` — Required, must be: `income` or `expense`
- `category` — Required, validated against allowed lists:
  - **Income:** salary, freelance, investment, gift, refund, other
  - **Expense:** food, transport, utilities, entertainment, shopping, health, education, bills, rent, insurance, other
- `date` — Optional, defaults to now

### GitHub
- `account` — Must be: `personal` or `company` (default: `personal`)
- `owner`, `repo` — Required for repo-specific operations
- `state` — Must be: `open`, `closed`, `all`

---

## How to Add a New Tool

1. **Create the tool directory:**
   ```
   tools/{toolName}/
   ├── {toolName}Controller.js   # Validation + request handling
   ├── {toolName}Model.js        # Database / API operations
   └── {toolName}Routes.js       # Express router
   ```

2. **Mount routes in `server.js`:**
   ```js
   import toolRoutes from './tools/{toolName}/{toolName}Routes.js';
   app.use('/api/tools/{toolName}', toolRoutes);
   ```

3. **Register MCP tools in `mcp/mcpTools.js`:**
   Add tool objects to the `tools` array with `name`, `description`, and `inputSchema`.

4. **Add MCP handlers in `mcp/mcpHandlers.js`:**
   Import the model and add `case` blocks in the `switch` statement.
   MCP handlers call Model functions directly (not Controllers).

5. **Update `.env.example`** if the tool needs new environment variables.

---

## Common Patterns

### Adding a CRUD endpoint (follow existing tools)
```js
// Model: pure DB operations
export async function createItem(data) {
  const collection = getDB().collection('items');
  const item = { ...data, createdAt: new Date(), updatedAt: new Date() };
  const result = await collection.insertOne(item);
  return { _id: result.insertedId, ...item };
}

// Controller: validation + call model
export async function addItem(req, res) {
  try {
    // validate req.body
    const item = await ItemModel.createItem(validated);
    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed', message: error.message });
  }
}

// Routes: thin
router.post('/', ItemController.addItem);
```

### Error handling
- Controllers wrap everything in try/catch
- Log errors with `console.error('Error doing X:', error)`
- Return `{ success: false, error: '...' }` with appropriate HTTP status
- MCP handlers return `{ content: [...], isError: true }` on failure

### ID validation
Always check `ObjectId.isValid(id)` before using `new ObjectId(id)` in MongoDB queries.

---

## Running the Project

### Local (no Docker)
```bash
npm install
cp .env.example .env  # configure MONGODB_URI
npm run dev            # node --watch server.js
```

### Docker
```bash
make build             # build images
make up                # production mode
make dev               # development mode (hot-reload)
make logs              # view logs
make down              # stop
```

### Verify
```bash
curl http://localhost:3000/health
```

---

## Testing (Not Yet Implemented)

No test suite exists yet. When adding tests:
- Use a test framework like `vitest` or `jest` (with ES module support)
- Mock the MongoDB connection for unit tests
- Use a test database for integration tests
- The CI pipeline (`.github/workflows/ci.yml`) already has a test step with `continue-on-error: true`

---

## Security

### Authentication (API Key)

- Implemented via `middleware/auth.js`
- Reads `API_KEY` from `.env`
- Checks `Authorization: Bearer <key>` header or `?api_key=<key>` query parameter
- If `API_KEY` is not set in `.env`, **all requests are blocked with `503`** (secure by default)
- **`GET /health` is the only unauthenticated endpoint** — it's registered BEFORE the auth middleware

### Rate Limiting

- Implemented via `middleware/rateLimiter.js` using `express-rate-limit`
- **General limiter:** 100 requests per 15 minutes per IP (all routes)
- **Strict limiter:** 20 requests per 15 minutes per IP (POST, PUT, DELETE, PATCH only)
- Returns `429` with `{ success: false, error: "Too many requests..." }`

### Security Headers

- `helmet` middleware adds standard security headers:
  - XSS protection, clickjacking prevention, MIME sniffing, etc.

### CORS

- **Development:** All origins allowed
- **Production:** Reads `ALLOWED_ORIGINS` from `.env` (comma-separated). If not set, allows all origins.
- Requests with no `Origin` header (curl, server-to-server, MCP clients) are always allowed.

### Middleware Order in server.js

```
helmet → cors → json parser → general rate limiter → GET /health (public) → authenticate → strict rate limiter → all protected routes
```

This order ensures:
1. Security headers are always applied
2. Health check is always accessible
3. Auth is checked before any data endpoint
4. Write operations have stricter rate limits

---

## Things to Watch Out For

1. **MCP handlers bypass Controllers** — If you add validation in a Controller, the same validation must be duplicated in `mcpHandlers.js` or extracted into a shared validation utility.
2. **API_KEY required** — If `API_KEY` is not set in `.env`, all requests (except `/health`) are blocked with `503 Service Unavailable`. Always set it.
3. **GitHub tool needs tokens** — Will throw if `GITHUB_PERSONAL_TOKEN` is not set in `.env`.
4. **`findOneAndUpdate` return value** — MongoDB native driver returns the document directly (not `{ value: doc }`). This is already handled correctly in the models.
5. **Calendar tool** — No code exists yet. The route is commented out in `server.js`.
6. **New routes must go AFTER `app.use(authenticate)`** — Any route mounted before the auth middleware will be publicly accessible.
