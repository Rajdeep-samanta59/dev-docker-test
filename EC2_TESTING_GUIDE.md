# ☁️ EC2 End-to-End Testing Guide

This guide walks you through launching an EC2 instance, setting up Docker, deploying your TaskBoard application, and verifying it works end-to-end.

---

## Step 1: Launch an EC2 Instance

1. Open the **AWS EC2 Console**.
2. Click **Launch Instance**.
3. Choose **Ubuntu 24.04 LTS** (or Amazon Linux 2023) as the OS.
4. Select instance type **t2.micro** (Free Tier eligible).
5. Create or select a **Key Pair** (e.g., `my-key.pem`) and download it.
6. Under **Network settings**, configure the Security Group:
   * Allow **SSH** (Port 22) from your IP.
   * Allow **Custom TCP** (Port 8080) from Anywhere (0.0.0.0/0) — this is where the frontend is served.
7. Click **Launch Instance**.

---

## Step 2: Install Docker and Docker Compose on EC2

Connect to your EC2 instance via SSH:

```bash
# Update permissions of your key file
chmod 400 my-key.pem

# SSH into the Ubuntu instance
ssh -i my-key.pem ubuntu@<YOUR-EC2-PUBLIC-IP>
```

Once inside the EC2 terminal, run the following commands to install Docker:

```bash
# Update packages
sudo apt-get update -y
sudo apt-get upgrade -y

# Install Docker
sudo apt-get install -y docker.io

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to the docker group (so you don't need to type 'sudo' for docker commands)
sudo usermod -aG docker $USER

# Log out and log back in for group settings to apply
exit
```

Reconnect to your EC2 instance:
```bash
ssh -i my-key.pem ubuntu@<YOUR-EC2-PUBLIC-IP>

# Verify docker works without sudo
docker --version
```

---

## Step 3: Copy Your Code to EC2

On your **local Windows machine**, open command prompt or powershell in the parent folder of `cal-poc`, and copy the folder to EC2 using `scp`:

```powershell
# Copy the entire directory to EC2 home folder
scp -i C:\path\to\my-key.pem -r "C:\Users\saman\Desktop\cal -poc" ubuntu@<YOUR-EC2-PUBLIC-IP>:~/cal-poc
```

---

## Step 4: Run the Application on EC2

Go back to your **EC2 SSH terminal** and start the application:

```bash
# Navigate to the folder
cd ~/cal-poc

# Run Docker Compose
docker compose up --build -d
```

---

## Step 5: Verify the Deployment (End-to-End Checklist)

### 1. Check if containers are running
```bash
docker ps
```
You should see 3 containers running:
- `taskboard-frontend` on port `8080->80`
- `taskboard-backend` on port `3000`
- `taskboard-db` on port `5432`

### 2. Verify Frontend in Browser
Open your browser and navigate to:
`http://<YOUR-EC2-PUBLIC-IP>:8080`

* You should see the modern TaskBoard UI.
* The 3 default sample tasks loaded from `db/init.sql` should be visible (proving frontend → backend → database connectivity).

### 3. Verify Interactive CRUD Functions
* **Create**: Add a task (e.g., "Deploy to AWS EC2"). Check if it immediately appears in the list.
* **Update**: Click the checkbox on a task to mark it done. Refresh the page to verify it stays checked.
* **Delete**: Click `✕` to delete a task. Ensure it disappears from the list.

### 4. Verify Database Persistence (The Ultimate Test)
1. Stop the containers:
   ```bash
   docker compose down
   ```
2. Check your browser at `http://<YOUR-EC2-PUBLIC-IP>:8080` to verify the site is down.
3. Start the containers again:
   ```bash
   docker compose up -d
   ```
4. Refresh your browser. All of your added/updated tasks should **still be there** because they were saved in the Docker Volume (`db-data`).
