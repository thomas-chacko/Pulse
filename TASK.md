# Personal MCP Server - Project Overview

## 🎯 Project Goal

Build a **Personal Model Context Protocol (MCP) Server** that allows AI assistants (Claude, ChatGPT, Cursor) to manage personal data through natural language conversations.

**Core Concept:** Instead of using multiple apps, interact with YOUR data through AI - "Hey Claude, add this to my todo list" or "What's my spending this month?"

---

## 📋 Requirements

### **Functional Requirements**

#### 1. Todo Management Tool ✅
- Create, read, update, delete todos
- Mark as complete/incomplete
- Filter by status, priority, tags
- Search by keyword
- Due date support
- Statistics (pending, completed)

#### 2. Finance Tool 🔜
- Track income and expenses
- Categorize transactions
- Monthly/yearly summaries
- Budget tracking
- Spending analytics

#### 3. Calendar Tool 🔜
- Sync with Google Calendar
- View upcoming events
- Create/update/delete events
- Event reminders
- Availability checking

#### 4. GitHub Tool 🔜
- View repositories
- Check issues and PRs
- Repository statistics
- Commit history
- Quick actions (star, fork)

### **Non-Functional Requirements**

- ✅ **Security:** Private data in personal MongoDB
- ✅ **Scalability:** Modular architecture, easy to add tools
- ✅ **Performance:** Fast response times (<500ms)
- ✅ **Reliability:** 99% uptime on production
- ✅ **Maintainability:** Clean code, feature-based structure
- ✅ **Compatibility:** Works with any MCP-compatible AI

---

## 🏗️ Architecture

### **Architecture Style**
**Feature-Based Microservices Architecture**
- Each tool is self-contained (controller, model, routes)
- Independent deployment capability
- Clear separation of concerns

### **Technology Stack**

```
Backend:     Node.js + Express.js
Database:    MongoDB Atlas (Cloud)
Deployment:  Render (PaaS)
CI/CD:       GitHub Actions
Containers:  Docker + Docker Compose
Protocol:    REST API (MCP-compatible)
```

### **System Architecture Diagram**

```
┌─────────────────────────────────────────────────┐
│         AI Assistants (Clients)                 │
│  Claude Desktop │ ChatGPT │ Cursor │ Others     │
└────────────┬────────────────────────────────────┘
             │ HTTP/REST API
             │
┌────────────▼────────────────────────────────────┐
│           MCP Server (Express.js)               │
│  ┌──────────────────────────────────────────┐   │
│  │         /health - Health Check           │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │  /api/tools/todo     - Todo Tool         │   │
│  │  /api/tools/finance  - Finance Tool      │   │
│  │  /api/tools/calendar - Calendar Tool     │   │
│  │  /api/tools/github   - GitHub Tool       │   │
│  └──────────────────────────────────────────┘   │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│         MongoDB Atlas (Cloud Database)          │
│  Collections: todos, transactions, events, etc  │
└─────────────────────────────────────────────────┘
```

### **Project Structure**

```
pulse/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD pipeline
├── config/
│   └── database.js             # MongoDB connection
├── tools/
│   ├── todo/                   # ✅ Todo Tool
│   │   ├── todoController.js   # Business logic
│   │   ├── todoModel.js        # Database operations
│   │   └── todoRoutes.js       # API endpoints
│   ├── finance/                # 🔜 Finance Tool
│   ├── calendar/               # 🔜 Calendar Tool
│   └── github/                 # 🔜 GitHub Tool
├── .env                        # Environment variables (secret)
├── .env.example                # Environment template
├── server.js                   # Application entry point
├── package.json                # Dependencies
├── Dockerfile                  # Docker image config
├── docker-compose.yml          # Docker orchestration
└── docker-compose.dev.yml      # Development overrides
```

---

## 🔄 Data Flow

### **Example: Add Todo**

```
1. User → Claude: "Add todo: Buy groceries"
2. Claude → MCP Server: POST /api/tools/todo
   Body: { "title": "Buy groceries" }
3. MCP Server → todoController: Validate input
4. todoController → todoModel: createTodo()
5. todoModel → MongoDB: insertOne()
6. MongoDB → todoModel: { _id, title, status, ... }
7. todoModel → todoController: Todo object
8. todoController → MCP Server: Response
9. MCP Server → Claude: { success: true, todo: {...} }
10. Claude → User: "✅ Added 'Buy groceries' to your todos"
```

---

## 🗂️ Database Schema

### **Todos Collection**
```javascript
{
  _id: ObjectId,
  title: String,              // Required, max 200 chars
  description: String,        // Optional
  status: String,             // "pending" | "completed"
  priority: String,           // "low" | "medium" | "high"
  tags: [String],             // Array of tags
  dueDate: Date,              // Optional
  createdAt: Date,            // Auto
  updatedAt: Date,            // Auto
  completedAt: Date           // Set when completed
}
```

### **Transactions Collection** (Future)
```javascript
{
  _id: ObjectId,
  amount: Number,
  type: String,               // "income" | "expense"
  category: String,
  description: String,
  date: Date,
  createdAt: Date
}
```

---

## 🔌 API Endpoints

### **System Endpoints**
```
GET  /health                    # Health check + DB status
```

### **Todo Tool Endpoints**
```
POST   /api/tools/todo          # Create todo
GET    /api/tools/todo          # List todos (with filters)
GET    /api/tools/todo/search   # Search todos
GET    /api/tools/todo/:id      # Get single todo
PUT    /api/tools/todo/:id      # Update todo
DELETE /api/tools/todo/:id      # Delete todo
PATCH  /api/tools/todo/:id/complete    # Mark complete
PATCH  /api/tools/todo/:id/uncomplete  # Mark pending
```

### **Future Endpoints**
```
/api/tools/finance/*
/api/tools/calendar/*
/api/tools/github/*
```

---

## 🚀 Deployment Architecture

### **Environments**

#### **Local Development**
```
Docker Compose
├── MCP Server (Node.js)
└── MongoDB (Container)
```

#### **Production (Render)**
```
Render Web Service
├── MCP Server (Node.js)
└── MongoDB Atlas (Cloud)
```

### **CI/CD Pipeline**

```
1. Push to GitHub (main branch)
2. GitHub Actions triggers
3. Run tests on Node 20.x
4. Security audit (npm audit)
5. Code quality checks
6. If all pass → Deploy to Render
7. Render pulls code
8. Builds Docker image
9. Deploys new version
10. Health check verification
```

---

## 🔐 Security

- ✅ Environment variables for secrets
- ✅ MongoDB authentication
- ✅ HTTPS in production (Render)
- ✅ Input validation on all endpoints
- ✅ Error handling (no sensitive data in errors)
- ✅ Rate limiting (future)
- ✅ API authentication (future)

---

## 📊 Development Status

### **Completed ✅**
- [x] Project setup (Node.js + Express)
- [x] MongoDB connection (local + cloud)
- [x] Docker setup (development + production)
- [x] CI/CD pipeline (GitHub Actions → Render)
- [x] Todo Tool (full CRUD + search)
- [x] Health check endpoint
- [x] Feature-based architecture
- [x] Production deployment

### **In Progress 🔄**
- [ ] MCP manifest file
- [ ] API documentation
- [ ] Error logging

### **Planned 🔜**
- [ ] Finance Tool
- [ ] Calendar Tool (Google Calendar integration)
- [ ] GitHub Tool (GitHub API integration)
- [ ] API authentication
- [ ] Rate limiting
- [ ] Unit tests
- [ ] Integration tests

---

## 🎯 Success Criteria

### **Phase 1: MVP (Current)** ✅
- [x] Basic server running
- [x] MongoDB connected
- [x] Todo tool working
- [x] Deployed to production
- [x] Accessible via REST API

### **Phase 2: Complete Tools**
- [ ] All 4 tools implemented
- [ ] MCP manifest created
- [ ] Tested with Claude Desktop
- [ ] Documentation complete

### **Phase 3: Production Ready**
- [ ] Authentication implemented
- [ ] Tests written (>80% coverage)
- [ ] Monitoring setup
- [ ] Error tracking (Sentry)
- [ ] Performance optimized

---

## 🛠️ Development Workflow

### **Local Development**
```bash
# Start with Docker (includes MongoDB)
dev.bat

# Or without Docker
npm start

# Run tests (future)
npm test
```

### **Adding a New Tool**
```bash
1. Create tools/{tool-name}/
2. Create {tool}Controller.js
3. Create {tool}Model.js
4. Create {tool}Routes.js
5. Import in server.js
6. Test endpoints
7. Push to GitHub
8. Auto-deploys to Render
```

---

## 📚 Key Technologies & Concepts

### **MCP (Model Context Protocol)**
- Protocol that lets AI assistants connect to external data sources
- Your server exposes REST APIs that AI can call
- AI translates natural language → API calls → Results

### **Feature-Based Architecture**
- Each tool is independent (controller, model, routes)
- Easy to add/remove features
- Clear ownership and responsibilities
- Modern approach (vs traditional layered)

### **Docker Containerization**
- Consistent development environment
- Easy deployment
- Matches production environment
- No "works on my machine" issues

---

## 🌐 URLs

- **Production:** https://pulse-1tdk.onrender.com
- **Health Check:** https://pulse-1tdk.onrender.com/health
- **Todo API:** https://pulse-1tdk.onrender.com/api/tools/todo
- **GitHub Repo:** [Your GitHub URL]
- **MongoDB Atlas:** MongoDB Cloud Dashboard

---

## 👨‍💻 Developer Notes

### **Adding New Features**
- Keep tools isolated in their own folders
- Follow existing patterns (controller → model → routes)
- Add validation in controllers
- Keep models pure (only DB operations)
- Update server.js to mount new routes

### **Best Practices Followed**
- ✅ Feature-based structure (modular)
- ✅ Separation of concerns (MVC pattern)
- ✅ Environment variables for config
- ✅ Error handling everywhere
- ✅ Consistent API response format
- ✅ RESTful endpoint design
- ✅ Meaningful variable names
- ✅ Comments where needed

---

**Last Updated:** October 3, 2026  
**Version:** 1.0.0  
**Status:** Phase 1 Complete ✅
