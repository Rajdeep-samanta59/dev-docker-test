# 🐳 25-Minute Docker Presentation Guide & Script

This guide provides a structured, minute-by-minute blueprint for your presentation. It covers what to say, what code to show, and when to run commands.

---

## ⏱️ Overview of the 25 Minutes

| Section | Time | Focus |
|---|---|---|
| **1. The Hook & The Problem** | 0:00 - 0:03 (3 mins) | Why Docker? The "works on my machine" problem. |
| **2. Architecture Overview** | 0:03 - 0:05 (2 mins) | Explain the 3-tier setup (Frontend, Backend, DB). |
| **3. The Dockerfiles (Building Blocks)** | 0:05 - 0:11 (6 mins) | Explain `frontend/Dockerfile` & `backend/Dockerfile`. |
| **4. Orchestration with Compose** | 0:11 - 0:16 (5 mins) | Explain `docker-compose.yml` (Networking & Volumes). |
| **5. Live Demo & Verification** | 0:16 - 0:21 (5 mins) | Run `docker-compose up`, show the website, and test persistence. |
| **6. Summary & Conclusion** | 0:21 - 0:25 (4 mins) | Recap key terms. Open floor for Q&A. |

---

## 🎙️ Step-by-Step Script & Actions

### 1. The Hook & The Problem (0:00 - 0:03)
* **What to say:**
  > "Hello everyone. Today I'll be presenting Docker. Before diving in, let's address a common developer headache: *'It works on my machine!'*
  > When we build applications with databases, backend servers, and web proxies, setting them up on another developer's laptop or an EC2 server requires installing Node.js, setting up PostgreSQL, configuring environment variables, and matching versions. If even one version mismatch occurs, the app fails.
  > Docker solves this by packaging the application and its environment into self-contained units called **Containers**."

---

### 2. Architecture Overview (0:03 - 0:05)
* **What to do:** Open the folder structure in your editor (e.g., VS Code). Show the `frontend/`, `backend/`, and `db/` folders.
* **What to say:**
  > "To demonstrate this, I have built a minimal full-stack task application called **TaskBoard**.
  > It has three distinct parts:
  > 1. **Frontend**: A minimal HTML/CSS/JS page served by Nginx.
  > 2. **Backend**: A Node.js and Express REST API.
  > 3. **Database**: A PostgreSQL database to persist tasks.
  > Instead of installing all three on our host machine, we containerize them individually and orchestrate them together."

---

### 3. The Dockerfiles (0:05 - 0:11)
* **What to do:** Open [backend/Dockerfile](file:///c:/Users/saman/Desktop/cal%20-poc/backend/Dockerfile) first.
* **What to say:**
  > "Let's inspect how we build a container image. Here is the Dockerfile for our backend. It's a simple step-by-step recipe:
  > - `FROM node:20-alpine`: We start from a lightweight official Node.js base image (Alpine Linux is optimized for small size).
  > - `WORKDIR /app`: We establish a working directory inside the container's virtual file system.
  > - `COPY package.json .` and `RUN npm install`: We copy dependencies and install them inside the container.
  > - `COPY . .`: We copy the actual source code.
  > - `CMD ["node", "server.js"]`: The starting command when the container boots."
* **What to do:** Open [frontend/Dockerfile](file:///c:/Users/saman/Desktop/cal%20-poc/frontend/Dockerfile) and [frontend/nginx.conf](file:///c:/Users/saman/Desktop/cal%20-poc/frontend/nginx.conf).
* **What to say:**
  > "For the frontend, we use Nginx to serve static files. Nginx is extremely fast and acts as a web server.
  > Look at `nginx.conf`: It serves our index.html, but also acts as a **Reverse Proxy**. Any request sent to `/api/` is automatically routed to `http://backend:3000`. This brings us to Docker's built-in networking."

---

### 4. Orchestration with Compose (0:11 - 0:16)
* **What to do:** Open [docker-compose.yml](file:///c:/Users/saman/Desktop/cal%20-poc/docker-compose.yml).
* **What to say:**
  > "Instead of building and running three Dockerfiles manually using separate terminal commands, we use **Docker Compose**.
  > Compose lets us declare our entire multi-container architecture in a single YAML file.
  > - Under `services`, we define `db`, `backend`, and `frontend`.
  > - **Networking**: Notice that we don't hardcode IP addresses. Under the backend service, `DB_HOST` is set to `db`. Docker Compose automatically sets up a shared network, and resolves the name `db` to the database container's internal IP address using a built-in DNS.
  > - **Data Persistence**: Containers are stateless by default. If a container stops, its data is deleted. To persist our database files, we define a shared `volume` named `db-data` mapped to `/var/lib/postgresql/data`.
  > - **Startup Order**: The backend depends on the database. Using `depends_on` with a `service_healthy` condition ensures our backend doesn't start until PostgreSQL is fully initialized and ready."

---

### 5. Live Demo & Verification (0:16 - 0:21)
* **What to do:** Open the terminal in your EC2 instance.
* **Command 1 (Start the app):**
  ```bash
  docker-compose up --build -d
  ```
  *Explain:* `--build` compiles the images, `-d` runs them in detached (background) mode.
* **Command 2 (Verify they are running):**
  ```bash
  docker ps
  ```
  *Explain:* Show the running status, container names, and port mappings (e.g. port 8080 exposed).
* **Action (Show the browser):**
  * Open `http://<EC2-IP>:8080` (or `localhost:8080`).
  * Add a task, toggle it as completed, and delete a task. Show that it works instantly.
* **Command 3 (Demonstrate logs):**
  ```bash
  docker-compose logs -f backend
  ```
  *Explain:* Show the logs outputting requests in real-time as you click buttons in the browser.
* **Command 4 (Demonstrate Persistence):**
  ```bash
  docker-compose down
  ```
  *Explain:* "Now I have stopped and deleted the containers." (Show browser is offline).
  ```bash
  docker-compose up -d
  ```
  *Explain:* "I started them back up." (Refresh browser). "Notice my newly added tasks are still here! That is because the volume `db-data` was preserved."

---

### 6. Summary & Conclusion (0:21 - 0:25)
* **What to say:**
  > "To recap, we containerized three different systems: a frontend, a backend, and a database.
  > Docker guarantees that this entire stack will run exactly the same way on my machine, on yours, and on a production AWS EC2 instance.
  > Thank you! I am now open to any questions you may have."

---

## 💡 Quick Tips for the Q&A Session

Here are common questions teachers or peers might ask:

1. **Q: What is the difference between an Image and a Container?**
   * *A:* An Image is the blueprint/template (like a class in programming). A Container is a running instance of that image (like an object).

2. **Q: Why did you use `alpine` images?**
   * *A:* Alpine is a minimal security-focused Linux distribution. Using Alpine base images reduces the container size from hundreds of megabytes to under 50MB, speeding up deployments.

3. **Q: How do the containers communicate?**
   * *A:* Docker Compose automatically creates a single default network. Every container on that network can reach any other container simply by using their service names (`db` or `backend`) as hostnames.

---

## 🛠️ Extra Live Commands (Bonus Discussion Points)

You can run these additional simple commands to show command-line proficiency:

1. **Show all local images:**
   ```bash
   docker images
   ```

2. **Show active volumes (where DB data lives):**
   ```bash
   docker volume ls
   ```

3. **Show active networks (how containers talk):**
   ```bash
   docker network ls
   ```

4. **Show running processes inside the backend container:**
   ```bash
   docker top dev-docker-test_backend_1
   ```

5. **Show container port mappings:**
   ```bash
   docker port dev-docker-test_frontend_1
   ```

6. **Show modified files in the backend container's filesystem:**
   ```bash
   docker diff dev-docker-test_backend_1
   ```

7. **Clean up unused Docker resources:**
   ```bash
   docker system prune
   ```