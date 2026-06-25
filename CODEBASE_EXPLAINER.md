# 📖 The Ultimate Docker & Codebase Explainer (For Absolute Beginners)

Welcome! If you are new to web development, databases, or Docker, this document is designed for you. It explains **what** this project does, **how** every file works line-by-line, and **why** we use Docker to run it.

---

## 🗺️ Part 1: High-Level Architecture (The 3-Tier Stack)

This project is a **Task Manager** (TaskBoard). In software engineering, this is built using a **3-Tier Architecture**. 

Here is how the three parts work together:

```
[ Client Browser ]
        │ (HTTP requests on port 8080)
        ▼
┌─────────────────────────────────────────────────────────┐
│ 1. FRONTEND (Nginx Web Server)                          │
│    - Serves index.html, style.css, app.js               │
│    - Listens on Port 8080                               │
│    - Proxies '/api/*' requests to the Backend           │
└──────────────────────────┬──────────────────────────────┘
                           │ (Internal Docker Network)
                           ▼
┌─────────────────────────────────────────────────────────┐
│ 2. BACKEND (Node.js & Express API Server)                │
│    - Receives tasks from Frontend                       │
│    - Processes data and runs SQL queries                │
│    - Listens on Port 3000                               │
└──────────────────────────┬──────────────────────────────┘
                           │ (Internal Docker Network)
                           ▼
┌─────────────────────────────────────────────────────────┐
│ 3. DATABASE (PostgreSQL)                                │
│    - Stores all tasks permanently in a table            │
│    - Listens on Port 5432                               │
└─────────────────────────────────────────────────────────┘
```

### 1. The Frontend (Client-Side)
This is what the user sees in the browser. It consists of:
*   **HTML (`index.html`)**: The skeleton of the page (buttons, input fields, tables).
*   **CSS (`style.css`)**: The styling (colors, layout, dark theme, hover animations).
*   **JavaScript (`app.js`)**: The "brain" of the UI. When you click "Add Task", this script catches the click and sends a message to the backend asking to save it.

### 2. The Backend (Server-Side API)
The backend runs in the background. It is built using:
*   **Node.js**: A tool that allows us to run JavaScript code outside of a web browser (directly on a server).
*   **Express**: A popular Node.js framework that makes it easy to handle HTTP requests (like GET, POST, PUT, DELETE).
The backend receives messages from the Frontend and talks to the Database to store or fetch information.

### 3. The Database (Storage)
The database is **PostgreSQL** (often called Postgres). 
*   Unlike variables in our code which vanish when the app is restarted, a database writes the data to the hard disk.
*   We use **SQL (Structured Query Language)** to tell Postgres how to create tables and insert, update, or delete data.

---

## 🐳 Part 2: What is Docker & Why Do We Need It?

### The Problem without Docker
Normally, to run this app, you would have to:
1.  Install **Node.js** on your machine (making sure the version matches).
2.  Install **PostgreSQL** (which requires setting up a background system service, configuring users, passwords, and ports).
3.  Install **Nginx** and learn how to write Nginx configurations.
4.  Run them all manually. If your database configuration is slightly different, the app crashes.

### The Docker Solution
Docker packages each software component into an **Image**, which runs inside a **Container**.
*   **Image**: A read-only template containing the OS, software, dependencies, and code. Think of it as a zipped setup package.
*   **Container**: A running instance of an image. Think of it as a mini virtual computer running inside your actual computer.
*   **Docker Compose**: A tool that starts all three containers at the same time and links them together automatically.

---

## 📁 Part 3: Line-by-Line File Breakdown

Let's look at every single file in the project and see exactly what each line does.

---

### 🗄️ Database Layer

#### File: `db/init.sql`
This script runs automatically the very first time the database container starts up.

```sql
-- Create a table named 'tasks' if it does not already exist
CREATE TABLE IF NOT EXISTS tasks (
    id          SERIAL PRIMARY KEY,          -- An auto-incrementing unique number (1, 2, 3...)
    title       VARCHAR(255) NOT NULL,       -- The text of the task (up to 255 characters)
    completed   BOOLEAN DEFAULT FALSE,       -- Yes/No field. Defaults to false (not completed)
    created_at  TIMESTAMP DEFAULT NOW()      -- Records the exact date and time the task was added
);

-- Seed (pre-populate) the table with 3 starting tasks
INSERT INTO tasks (title) VALUES ('task 1');
INSERT INTO tasks (title) VALUES ('task 2');
INSERT INTO tasks (title) VALUES ('task 3');
```

---

### 💻 Backend Layer

#### File: `backend/package.json`
This is a metadata file for Node.js. It lists the dependencies our backend needs to run.

```json
{
  "name": "taskboard-backend",    // The name of our backend app
  "version": "1.0.0",             // Version number
  "dependencies": {
    "express": "^4.18.2",         // The framework we use to handle web routing
    "pg": "^8.12.0"               // The driver that lets Node.js talk to PostgreSQL
  }
}
```

#### File: `backend/server.js`
This is the actual backend server application.

```javascript
const express = require('express');  // Import the Express framework
const { Pool } = require('pg');      // Import the PostgreSQL library

const app = express();
app.use(express.json());             // Tell Express to automatically parse JSON data sent to us

// Connect to PostgreSQL using environment variables injected by Docker
const db = new Pool({
  host:     process.env.DB_HOST,      // 'db' (resolves to the database container IP)
  user:     process.env.DB_USER,      // 'user'
  password: process.env.DB_PASSWORD,  // 'password'
  database: process.env.DB_NAME,      // 'taskboard'
});

// ROUTE 1: GET all tasks (Read operation)
// When the frontend asks for '/api/tasks', we query the DB and send them back
app.get('/api/tasks', async (req, res) => {
  const result = await db.query('SELECT * FROM tasks ORDER BY id DESC');
  res.json(result.rows); // Send the rows back as a JSON list
});

// ROUTE 2: POST a new task (Create operation)
// Receives a task title and inserts it into the database
app.post('/api/tasks', async (req, res) => {
  const { title } = req.body;
  const result = await db.query(
    'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
    [title]
  );
  res.json(result.rows[0]); // Send the newly created task back to the frontend
});

// ROUTE 3: PUT toggle status (Update operation)
// Finds the task by its ID and switches 'completed' from true->false or false->true
app.put('/api/tasks/:id', async (req, res) => {
  const result = await db.query(
    'UPDATE tasks SET completed = NOT completed WHERE id = $1 RETURNING *',
    [req.params.id]
  );
  res.json(result.rows[0]);
});

// ROUTE 4: DELETE a task (Delete operation)
// Removes a task completely from the database using its ID
app.delete('/api/tasks/:id', async (req, res) => {
  await db.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
  res.json({ message: 'Deleted' });
});

// Start listening for web requests on port 3000
app.listen(3000, () => console.log('Backend running on port 3000'));
```

#### File: `backend/Dockerfile`
The script that tells Docker how to build the backend image.

```dockerfile
# Step 1: Use official Node.js image running on Alpine Linux as the base OS
FROM node:20-alpine

# Step 2: Create and enter '/app' folder inside the container
WORKDIR /app

# Step 3: Copy package.json to the '/app' folder
COPY package.json .

# Step 4: Run npm install inside the container to download Express and Postgres driver
RUN npm install

# Step 5: Copy all remaining files from our local backend directory into the container
COPY . .

# Step 6: Start the backend server
CMD ["node", "server.js"]
```

#### File: `backend/.dockerignore`
Tells Docker to ignore local `node_modules` during copying. We want to install fresh dependencies inside the container instead of copying them from Windows.

```
node_modules
```

---

### 🎨 Frontend Layer

#### File: `frontend/index.html`
The user interface structure.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TaskBoard 🐳</title>
  <!-- Link to the custom styling file -->
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <div class="container">
    <header>
      <h1>🐳 TaskBoard</h1>
      <p class="subtitle">Running on Docker · Nginx · Node.js · PostgreSQL</p>
    </header>

    <!-- Add Task Row -->
    <div class="add-task">
      <input type="text" id="taskInput" placeholder="Enter a task..." />
      <button onclick="addTask()">Add</button>
    </div>

    <!-- The list element where JavaScript will insert the tasks -->
    <ul id="taskList"></ul>
  </div>

  <!-- Link to the frontend JavaScript brain -->
  <script src="app.js"></script>
</body>
</html>
```

#### File: `frontend/app.js`
Listens to user events (like typing, clicking) and sends HTTP network requests to the Nginx server (which proxies them to the backend).

```javascript
// Function to load all tasks from the backend and show them in the HTML
async function loadTasks() {
  const res = await fetch('/api/tasks'); // Fetch data from Nginx proxy
  const tasks = await res.json();        // Convert response to JavaScript list

  const list = document.getElementById('taskList');
  list.innerHTML = ''; // Clear the current list in HTML

  // Loop through each task and add it to the list
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' done' : '');
    li.innerHTML = `
      <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
      <span>${task.title}</span>
      <button onclick="deleteTask(${task.id})">✕</button>
    `;
    list.appendChild(li);
  });
}

// Function to add a task
async function addTask() {
  const input = document.getElementById('taskInput');
  const title = input.value.trim();
  if (!title) return; // Stop if the input is empty

  // Send a POST request containing the new task title to the backend
  await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });

  input.value = ''; // Clear input field
  loadTasks();      // Refresh list to show new task
}

// Function to check/uncheck a task
async function toggleTask(id) {
  await fetch(`/api/tasks/${id}`, { method: 'PUT' });
  loadTasks(); // Refresh list
}

// Function to delete a task
async function deleteTask(id) {
  await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  loadTasks(); // Refresh list
}

// Watch if the user hits the 'Enter' key inside the input box
document.getElementById('taskInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});

// Run loadTasks immediately when the webpage loads
loadTasks();
```

#### File: `frontend/nginx.conf`
The Nginx configuration. It routes web traffic.

```nginx
server {
    listen 80; # Nginx listens inside its container on port 80

    # Rule 1: For any regular request (like '/index.html' or '/style.css'),
    # serve the static files from the '/usr/share/nginx/html' directory.
    location / {
        root /usr/share/nginx/html;
        index index.html;
    }

    # Rule 2: For any request starting with '/api/', do not search the filesystem.
    # Instead, forward the request to 'http://backend:3000' (our Node.js container).
    location /api/ {
        proxy_pass http://backend:3000;
    }
}
```

#### File: `frontend/Dockerfile`
Tells Docker how to construct the frontend image.

```dockerfile
# Step 1: Use Nginx web server running on Alpine Linux as the base OS
FROM nginx:alpine

# Step 2: Copy our index.html, style.css, and app.js into Nginx's default folder
COPY . /usr/share/nginx/html

# Step 3: Overwrite Nginx's default config with our custom reverse proxy config
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

---

### 🌐 Docker Compose Orchestration

#### File: `docker-compose.yml`
This is the master orchestrator file. Instead of booting containers manually, we run `docker-compose up` to run everything defined here.

```yaml
version: "3.8"

services:

  # ----------------------------------------------------
  # Service 1: The Database
  # ----------------------------------------------------
  db:
    image: postgres:16-alpine # Downloads official Postgres 16 run on Alpine Linux
    environment:
      # Inject configuration settings directly inside the database
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: taskboard
    volumes:
      # Map 'db-data' volume to database directory inside Postgres so data persists
      - db-data:/var/lib/postgresql/data
      # Map the setup SQL file to container's initialization folder
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      # A healthcheck tests if Postgres is ready to receive connections.
      # If it is, the container state switches to "healthy".
      test: ["CMD-SHELL", "pg_isready -U user -d taskboard"]
      interval: 5s
      retries: 5

  # ----------------------------------------------------
  # Service 2: The Backend API
  # ----------------------------------------------------
  backend:
    build: ./backend # Looks inside the '/backend' folder and runs its Dockerfile
    environment:
      # Tells Node.js how to reach the database container.
      # We use 'db' as the host. Docker resolves this to the DB container's IP.
      DB_HOST: db
      DB_USER: user
      DB_PASSWORD: password
      DB_NAME: taskboard
    depends_on:
      db:
        # Do not start the backend until the database container is fully healthy
        condition: service_healthy

  # ----------------------------------------------------
  # Service 3: The Frontend Web Server
  # ----------------------------------------------------
  frontend:
    build: ./frontend # Looks inside the '/frontend' folder and runs its Dockerfile
    ports:
      # Maps port 8080 on your host machine (EC2 / Laptop) to port 80 inside the container.
      # This allows you to type http://localhost:8080 to visit the website.
      - "8080:80"
    depends_on:
      # Wait for the backend container to start up first
      - backend

# Named volume definition
volumes:
  db-data:
```

---l

## 🛠️ Part 4: How Everything Interconnects (The Magic)

Let's walk through what happens when you type a task name and click **"Add"** in your browser:

1.  **Frontend Action**: You type a task and click **Add**.
2.  **JavaScript Request**: `app.js` runs `addTask()`, which initiates `fetch('/api/tasks')`.
3.  **Nginx Receives It**: The request goes to the Frontend container listening on Port `8080`.
4.  **Reverse Proxy**: Nginx sees `/api/` in the URL, checks `nginx.conf`, and forwards the request internally to `http://backend:3000/api/tasks`.
5.  **Express Backend Handler**: The Node.js container receives the forwarded request at `server.js`.
6.  **Database SQL Query**: Node.js constructs a database query (`INSERT INTO tasks ...`) and sends it over the internal network to the PostgreSQL container (`db:5432`).
7.  **Data Saved**: Postgres writes the new task record to the hard disk in the location `/var/lib/postgresql/data` (which is linked to the Docker Volume `db-data`).
8.  **Confirmation Flow**: Postgres confirms to Node.js → Node.js sends success back to Nginx → Nginx sends it back to your browser's JavaScript → `app.js` updates the screen with your new task!
