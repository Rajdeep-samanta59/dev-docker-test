# 🐳 TaskBoard — Docker Demo Project

A **full-stack task manager** built to demonstrate Docker containerization concepts.

| Layer | Technology | Container |
|-------|-----------|-----------|
| Frontend | HTML/CSS/JS | Nginx Alpine |
| Backend | Node.js + Express | Node 20 Alpine |
| Database | PostgreSQL 16 | Postgres Alpine |

---

## 🚀 Quick Start

```bash
# Clone and navigate to the project
cd cal-poc

# Build and start all containers
docker compose up --build -d

# Open in browser
# http://localhost:8080
```

That's it! Three containers will spin up and the app will be running.

---

## 📁 Project Structure

```
├── docker-compose.yml          # Orchestrates all 3 services
├── .env                        # Database credentials
│
├── frontend/
│   ├── Dockerfile              # Nginx container
│   ├── nginx.conf              # Reverse proxy config
│   ├── index.html              # Main page
│   ├── style.css               # Dark theme styles
│   └── app.js                  # Frontend logic
│
├── backend/
│   ├── Dockerfile              # Node.js container
│   ├── .dockerignore           # Excludes node_modules
│   ├── package.json            # Dependencies
│   └── server.js               # REST API
│
└── db/
    └── init.sql                # Creates tasks table
```

---

## 🔧 Useful Docker Commands

```bash
# Build and start all containers (detached mode)
docker compose up --build -d

# View running containers
docker ps

# View logs (follow mode)
docker compose logs -f

# View logs for a specific service
docker compose logs -f backend

# Stop all containers
docker compose down

# Stop and remove volumes (resets database)
docker compose down -v

# Rebuild a specific service
docker compose build backend

# Enter a running container's shell
docker exec -it taskboard-backend sh

# Check container resource usage
docker stats
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Toggle task completion |
| DELETE | `/api/tasks/:id` | Delete a task |

---

## 🖥️ EC2 Deployment

### Prerequisites
- EC2 instance (Amazon Linux 2 / Ubuntu)
- Security group: open port **8080**

### Install Docker on EC2

```bash
# For Amazon Linux 2
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and log back in for group changes
exit
```

### Deploy

```bash
# Copy project to EC2 (from your local machine)
scp -i your-key.pem -r ./cal-poc ec2-user@<EC2-IP>:~/

# SSH into EC2
ssh -i your-key.pem ec2-user@<EC2-IP>

# Start the app
cd cal-poc
docker compose up --build -d

# Access at http://<EC2-IP>:8080
```

---

## 🐳 Docker Concepts Demonstrated

1. **Dockerfile** — Building custom images
2. **Base images** — `node:20-alpine`, `nginx:alpine`
3. **Layer caching** — `COPY package.json` before source
4. **`.dockerignore`** — Excluding files from build context
5. **Docker Compose** — Multi-container orchestration
6. **Services & Networking** — Container-to-container communication
7. **Named Volumes** — Data persistence for PostgreSQL
8. **Environment Variables** — Config injection via `.env`
9. **Port Mapping** — `8080:80`, `3000:3000`
10. **Health Checks** — Ensuring Postgres is ready
11. **`depends_on`** — Service startup ordering
12. **Reverse Proxy** — Nginx proxying to backend by service name
13. **Docker DNS** — Resolving service names to container IPs

---

## 📋 Presentation Demo Flow

| Time | Action | Concept |
|------|--------|---------|
| 0-3 min | Show project structure | Overview |
| 3-7 min | Walk through `backend/Dockerfile` | Dockerfile, layers |
| 7-9 min | Explain `nginx.conf` reverse proxy | Networking |
| 9-13 min | Explain `docker-compose.yml` | Compose, services |
| 13-15 min | Show `.env` file | Environment variables |
| 15-18 min | Run `docker compose up --build` | Live build |
| 18-20 min | Demo the app in browser | Working app |
| 20-23 min | Show `docker logs`, `docker ps` | Debugging |
| 23-25 min | Stop & restart — data persists! | Volumes |
