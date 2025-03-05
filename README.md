# **🚀 Real-Time Job Queue System**

## **📌 Overview**
This project is a **real-time job processing system** built using **Node.js, BullMQ, and React.js**.  
It provides a **scalable and efficient way** to manage background jobs with **automatic retries, failure tracking, and real-time UI updates** using **WebSockets**.

## **🛠️ Technologies Used**
### **1️⃣ Backend (Node.js + Express + BullMQ)**
| Tech | Purpose |
|------|---------|
| **Node.js** | JavaScript runtime for the backend |
| **Express.js** | Lightweight and fast web framework |
| **BullMQ** | Advanced job queue with Redis support |
| **Sequelize** | ORM for database operations |
| **SQLite** | Lightweight database for easy setup |
| **Redis** | In-memory database for fast job queue management |
| **Socket.io** | Real-time event-based communication |

### **2️⃣ Frontend (React + Material-UI)**
| Tech | Purpose |
|------|---------|
| **React.js** | Component-based frontend framework |
| **Material-UI** | Prebuilt, modern UI components |
| **Axios** | Handles API requests to backend |
| **React Router** | Enables navigation between pages |
| **Socket.io Client** | Listens for real-time updates from the backend |

### **3️⃣ DevOps (Docker + Deployment)**
| Tech | Purpose |
|------|---------|
| **Docker** | Containerized environment for easy deployment |
| **Docker Compose** | Manages Redis, backend, and frontend services |

## **⚙️ Project Architecture**
```
Frontend (React.js) <--> Backend (Express.js) <--> Redis (BullMQ) <--> Database (SQLite)
```

### **📜 Folder Structure**
```
📦 queue-manager/
 ┣ 📂 backend/                # Backend API
 ┃ ┣ 📂 models/               # Sequelize models
 ┃ ┣ 📂 routes/               # Express routes (Jobs & Transactions)
 ┃ ┣ 📜 queue.js              # Job processing logic (BullMQ)
 ┃ ┣ 📜 database.js           # Sequelize connection
 ┃ ┣ 📜 Dockerfile            # Docker build file
 ┃ ┣ 📜 app.js                # Express API entrypoint
 ┣ 📂 frontend/               # React.js UI
 ┃ ┣ 📂 src                   # Source Folder
 ┃ ┃ ┣ 📜 App.js              # Main React Component
 ┃ ┃ ┣ 📂 components/         # Reusable UI components
 ┃ ┃ ┣ 📂 middleware/         # Error Handling middleware file
 ┃ ┣ 📜 Dockerfile            # Docker build file
 ┣ 📜 docker-compose.yml      # Docker configuration
 ┣ 📜 README.md               # Documentation
```

## **🔹 Backend: Node.js + Express + BullMQ**
### **📌 Job Processing (queue.js)**
```javascript
const jobQueue = new Queue('jobQueue', {
    connection,
    defaultJobOptions: {
        attempts: 3,  
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: true, // ❌ Usually we keep failed jobs for debugging, but as per assignment requirement removing this.
    }
});
```

## **🚀 Running the Project**

### **🔹 Local Setup (Without Docker)**
#### **1️⃣ Start Redis Server**
Ensure Redis is running on port **6379**:
```bash
redis-server
```

#### **2️⃣ Start Backend**
Navigate to the `backend/` folder and start the server:
```bash
cd backend
npm install
npm start
```
The backend will run on `http://localhost:4315`.

#### **3️⃣ Start Frontend**
Navigate to the `frontend/` folder and start the frontend:
```bash
cd frontend
npm install
npm start
```
The frontend will run on `http://localhost:3000`.

---

### **🔹 Running with Docker Compose**
Run the following command to start everything using Docker:
```bash
docker-compose -f docker-compose.remote.yml up -d
```
This will:
✅ Start Redis on port **6379**
✅ Start Backend on port **4315**
✅ Start Frontend on port **3000**

To stop the services:
```bash
docker-compose down
```

## **🚀 Scalability Considerations**
### **1. Distributed Workers (Multiple Worker Instances)**
- BullMQ supports **running multiple workers** to process jobs in parallel.
- Example: Scaling workers across different servers:
  ```bash
  pm2 start queue.js --name worker-1
  pm2 start queue.js --name worker-2
  pm2 start queue.js --name worker-3
  ```

### **2. Redis-Based Scalability**
- Redis **allows multiple producers and consumers**.
- Use **Redis Cluster** or **Redis Sentinel** for **load balancing & failover**.

### **3. Separate Queues for Different Workloads**
- Separate Queues for Different Workloads
- Instead of one queue, create multiple queues for different types of jobs.
**Example:**
     ```
    const emailQueue = new Queue('emailQueue', { connection });
    const videoProcessingQueue = new Queue('videoProcessingQueue', { connection });
    ```
-    This prevents one type of job from blocking another.

### **4.️ Horizontal Scaling (Multiple Backend Services)**
- You can deploy multiple backend servers, all connected to the same Redis.
- This allows multiple services to add jobs and process them concurrently.
    ```
    docker-compose up --scale backend=3
    ```
### **5. Auto-Scaling with Kubernetes (K8s)**
```yaml
apiVersion: autoscaling/v1
kind: HorizontalPodAutoscaler
metadata:
  name: worker-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: worker
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Object
    object:
      metricName: job_queue_length
      targetValue: 50
```
- This **auto-scales workers** if job queue length exceeds **50**.

## **🎯 Conclusion**
✅ Real-time job processing with retries & failure tracking.  
✅ Scalable architecture with Redis queue management.  
✅ Beautiful UI with Material-UI & WebSockets for real-time updates.  
✅ Docker-based deployment for easy setup.  
✅ **Optimized for large-scale workloads with Redis Clustering & Kubernetes Auto-Scaling** 🚀
