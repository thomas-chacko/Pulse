# Pulse – Personal MCP Server

A **Model Context Protocol (MCP)** server that lets AI assistants (Claude, ChatGPT, Cursor) manage your personal data through natural language conversations.

> _"Hey Claude, add this to my todo list"_ · _"What's my spending this month?"_ · _"Show my GitHub repos"_

---

## ✨ Features

| Tool | Status | Capabilities |
|------|--------|-------------|
| **Todo** | ✅ Active | Create, update, delete, complete, search, filter by status/priority/tags |
| **Finance** | ✅ Active | Track income & expenses, categorize transactions, monthly summaries, spending analytics |
| **GitHub** | ✅ Active | View profile, repos, issues, PRs, commits across personal & company accounts |
| **Calendar** | 🔜 Coming | Google Calendar sync, events, reminders |

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 20
- [Docker](https://docs.docker.com/engine/install/) & Docker Compose
- MongoDB (provided via Docker, or use [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone & configure

```bash
git clone <your-repo-url>
cd Pulse
cp .env.example .env
# Edit .env with your MongoDB URI, GitHub tokens, etc.
```

### 2. Start with Docker (recommended)

```bash
make up          # Production mode (detached)
make dev         # Development mode (hot-reload + debug port)
```

### 3. Start without Docker

```bash
npm install
npm run dev      # Development (auto-restart on changes)
npm start        # Production
```

### 4. Verify

```bash
curl http://localhost:3000/health
```

---

## 🐳 Docker Commands (Makefile)

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make build` | Build Docker images |
| `make up` | Start containers (detached) |
| `make dev` | Start in dev mode (hot-reload) |
| `make down` | Stop containers |
| `make logs` | Stream container logs |
| `make shell` | Open shell in MCP server container |
| `make mongo` | Open MongoDB shell |
| `make status` | Show container status |
| `make clean` | Remove containers, volumes, and images |
| `make rebuild` | Fresh rebuild (down → build → up) |

---

## 🏗️ Project Structure

```
Pulse/
├── config/
│   └── database.js             # MongoDB connection
├── mcp/
│   ├── mcpServer.js            # MCP server factory
│   ├── mcpTools.js             # Tool schemas (24 tools)
│   └── mcpHandlers.js          # Tool execution logic
├── tools/
│   ├── todo/                   # Todo tool (controller, model, routes)
│   ├── finance/                # Finance tool
│   └── github/                 # GitHub tool
├── docs/
│   └── TASK.md                 # Project spec & planning
├── .github/workflows/
│   └── ci.yml                  # CI/CD pipeline
├── server.js                   # Express entry point
├── Dockerfile                  # Multi-stage Docker image
├── docker-compose.yml          # Production stack
├── docker-compose.dev.yml      # Dev overrides
├── Makefile                    # Docker shortcuts
└── package.json                # Dependencies & scripts
```

---

## 🔌 API Endpoints

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check + DB status |
| `POST` | `/mcp` | MCP protocol endpoint |

### Todo Tool

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tools/todo` | Create todo |
| `GET` | `/api/tools/todo` | List todos (with filters) |
| `GET` | `/api/tools/todo/search` | Search todos |
| `GET` | `/api/tools/todo/:id` | Get single todo |
| `PUT` | `/api/tools/todo/:id` | Update todo |
| `DELETE` | `/api/tools/todo/:id` | Delete todo |
| `PATCH` | `/api/tools/todo/:id/complete` | Mark complete |
| `PATCH` | `/api/tools/todo/:id/uncomplete` | Mark pending |

### Finance Tool

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tools/finance` | Create transaction |
| `GET` | `/api/tools/finance` | List transactions |
| `GET` | `/api/tools/finance/categories` | Available categories |
| `GET` | `/api/tools/finance/summary` | Financial summary |
| `GET` | `/api/tools/finance/spending` | Spending by category |
| `GET` | `/api/tools/finance/:id` | Get transaction |
| `PUT` | `/api/tools/finance/:id` | Update transaction |
| `DELETE` | `/api/tools/finance/:id` | Delete transaction |

### GitHub Tool

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tools/github` | GitHub routes |

---

## ⚙️ Environment Variables

```bash
# Application
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/pulse

# GitHub (personal account)
GITHUB_PERSONAL_TOKEN=ghp_xxx
GITHUB_PERSONAL_USERNAME=your_username

# GitHub (company account)
GITHUB_COMPANY_TOKEN=ghp_xxx
GITHUB_COMPANY_USERNAME=your_company_username

# Google Calendar (coming soon)
# GOOGLE_CLIENT_ID=xxx
# GOOGLE_CLIENT_SECRET=xxx
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 (Alpine) |
| Framework | Express.js 5 |
| Database | MongoDB 7 |
| Protocol | MCP (Model Context Protocol) |
| Containers | Docker + Docker Compose |
| CI/CD | GitHub Actions → Render |

---

## 📦 Adding a New Tool

1. Create `tools/{tool-name}/` with three files:
   - `{tool}Controller.js` — Business logic & validation
   - `{tool}Model.js` — Database operations
   - `{tool}Routes.js` — Express routes
2. Import and mount routes in `server.js`
3. Add MCP tool schemas in `mcp/mcpTools.js`
4. Add MCP handlers in `mcp/mcpHandlers.js`

---

## 🌐 Production

- **URL:** https://pulse-1tdk.onrender.com
- **Health:** https://pulse-1tdk.onrender.com/health
