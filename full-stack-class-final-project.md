# TaskFlow - Collaborative Task Management App

## **Full Stack Web Development Final Project**

## Project Title

**TaskFlow** - A Modern Collaborative Task & Project Management Application

---

## Project Description

TaskFlow is a full-featured web application inspired by **Trello + Notion**. It allows individuals and teams to create workspaces, manage boards, and track tasks efficiently using a Kanban-style interface.

This project is designed to showcase all essential Full Stack development skills including authentication, CRUD operations, real-time features, responsive design, database relationships, and deployment.

---

## Key Features

### 1. Authentication & User Management

- User Registration & Login
- Protected routes & middleware
- Profile management (avatar upload, name, bio)
- Forgot password (optional)
- Role-based access control (Admin / Member)

### 2. Workspaces

- Create multiple workspaces (Personal, Marketing Team, etc.)
- Invite members via email
- Manage workspace members

### 3. Kanban Boards

- Create multiple boards inside each workspace
- Drag & Drop tasks between columns (`To Do`, `In Progress`, `Review`, `Done`)
- Rich Task Modal featuring:
  - Title, description, due date
  - Priority & custom labels
  - Multiple assignees
  - Comments system
  - File attachments

### 4. Additional Views

- List View
- Calendar View

### 5. Advanced Features

- Global search and advanced filters
- In-app notifications
- Real-time updates (Socket.io)
- Analytics Dashboard
- Dark mode
- Fully responsive design

---

## Recommended Tech Stack

| Layer           | Technology                                   |
| --------------- | -------------------------------------------- |
| **Frontend**    | React.js + Vite, Tailwind CSS                |
| **State Mgmt**  | Zustand + TanStack Query                     |
| **Drag & Drop** | @dnd-kit                                     |
| **Backend**     | Node.js + Express.js                         |
| **Database**    | MongoDB + Mongoose                           |
| **Auth**        | JWT + HttpOnly Cookies                       |
| **Real-time**   | Socket.io                                    |
| **File Upload** | Cloudinary / Multer                          |
| **Deployment**  | Vercel (Frontend) + Render/Railway (Backend) |

---

## Implementation Roadmap

### Phase 1: Setup & Authentication (Week 1)

- Project initialization (Frontend + Backend)
- MongoDB Atlas setup
- Complete Authentication system
- User context on frontend

### Phase 2: Workspaces & Boards (Week 2)

- Workspace CRUD operations
- Board CRUD operations
- Basic Task CRUD

### Phase 3: Kanban & Task Management (Week 3)

- Drag & Drop implementation
- Rich Task Modal
- Comments system

### Phase 4: Advanced Features (Week 4)

- Real-time updates
- File attachments
- Member invites & notifications
- Search, filters & Calendar view

### Phase 5: Polish & Optimization (Week 5)

- Responsive UI + Dark mode
- Loading states & error handling
- Analytics dashboard
- Input validation (Zod)

### Phase 6: Testing & Deployment (Final Week)

- Full testing
- Deploy application
- Documentation & README

---

## Database Schema (MongoDB)

```js
// User Schema
{
  name: String,
  email: String,
  password: String,
  avatar: String,
  role: { type: String, enum: ['admin', 'member'] }
}

// Workspace Schema
{
  name: String,
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  members: [{ user: ObjectId, role: String }]
}

// Board Schema
{
  title: String,
  workspaceId: { type: ObjectId, ref: 'Workspace' }
}

// Task Schema
{
  title: String,
  description: String,
  status: String,
  dueDate: Date,
  priority: String,
  labels: [String],
  assignees: [{ type: ObjectId, ref: 'User' }],
  attachments: [{ url: String, filename: String }],
  comments: [{
    user: ObjectId,
    text: String,
    createdAt: Date
  }],
  boardId: ObjectId,
  order: Number
}
```
