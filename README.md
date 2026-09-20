# 🎫 ResolveFlow

### Smart Support Ticket & SLA Management Platform

>ResolveFlow is a full-stack support platform that helps **customers, support agents, and administrators manage support tickets, SLA tracking, and customer communication** from one place.It brings ticket creation, assignment, conversations, escalation, SLA monitoring, and analytics into a single workflow.

<p>
  <a href="YOUR_LIVE_DEMO_URL">🚀 Live Demo</a> •
  <a href="https://github.com/Jhanwi/ResolveFlow">💻 GitHub</a>
</p>

---

## 💡 What Problem Does It Solve?

Support teams often need to track tickets, priorities, response times, and SLA deadlines across different tools.

ResolveFlow keeps these activities together:

| 👤 Customer      | 🎧 Agent                | 🛠️ Admin            |
| ---------------- | ----------------------- | -------------------- |
| Create tickets   | Manage assigned tickets | Assign tickets       |
| Reply to tickets | Reply & add notes       | Manage users         |
| Track SLA status | Update priority/status  | Monitor SLA breaches |
| Leave reviews    | Escalate tickets        | View analytics       |

---

## ✨ Key Features

<details>
<summary>👤 <b>Customer Portal</b></summary>

Customers can:

* Register and log in
* Create support tickets
* Select category and priority
* Attach files
* Reply to conversations
* Track ticket status and SLA
* Receive notifications
* View ticket history
* Submit reviews and ratings

</details>

<details>
<summary>🎧 <b>Agent Portal</b></summary>

Agents can:

* View assigned tickets
* Look up customer information
* Reply to customers
* Add internal notes
* Change ticket status and priority
* Escalate tickets
* Monitor SLA deadlines
* Manage notifications

</details>

<details>
<summary>🛠️ <b>Admin Portal</b></summary>

Administrators can:

* View all tickets
* Assign tickets to agents
* Manage customers and agents
* Configure SLA policies
* Monitor SLA breaches
* View support analytics

</details>

---

## ⏱️ SLA & Ticket Workflow

A ticket moves through a simple support process:

```text
Create Ticket
     ↓
Set Priority
     ↓
Assign Agent
     ↓
Agent Response
     ↓
SLA Monitoring
     ↓
Resolve Ticket
     ↓
Customer Review
```

### SLA Tracking

Tickets are monitored according to their priority and SLA deadline.

This helps agents identify tickets that need attention before they become SLA breaches.

---

## 📊 Analytics

ResolveFlow uses **Python and Pandas** to generate useful support reports.

The analytics module can show:

* 🎫 Ticket volume
* 🚦 Priority distribution
* 📂 Ticket categories
* 👥 Agent workload
* ⏱️ SLA status
* ⭐ Customer reviews
* 📈 Daily ticket trends

Instead of showing only raw ticket data, the analytics module turns it into reports and charts that help understand support activity.

---

## ⚡ Performance & Project Metrics

| Metric                               |     Result |
| ------------------------------------ | ---------: |
| REST API endpoints                   |     **35** |
| Ticket retrieval latency improvement |  **37.2%** |
| Median API response time             | **205 ms** |
| Concurrent connections tested        |     **50** |
| Requests tested                      |  **1,000** |
| Request success rate                 |   **100%** |

### What These Numbers Mean

**37.2% faster ticket retrieval**

> PostgreSQL indexing was used to improve ticket retrieval performance.

**205 ms median response time**

> The API benchmark measured a 205 ms median response time under the recorded test conditions.

**1,000 requests / 50 concurrent connections**

> The API was tested with 1,000 requests while handling 50 concurrent connections, with 100% of requests succeeding.

> 📌 Benchmark results depend on the machine, database, network, and environment used for testing.

---

## 🏗️ How the System Works

The application follows a simple full-stack structure:

```text
React Frontend
      ↓
Express REST API
      ↓
JWT Authentication
      ↓
Role-Based Access
      ↓
PostgreSQL
```

Each part has a specific responsibility:

* **React** → Customer, agent, and admin interfaces
* **Express** → API routes and business logic
* **JWT** → User authentication
* **Role-based access** → Controls customer, agent, and admin actions
* **PostgreSQL** → Stores tickets, users, messages, SLA data, and reviews
* **Python/Pandas** → Generates support analytics

---

## 🌐 API & Backend

ResolveFlow provides **35 REST API endpoints** covering areas such as:

* Authentication
* Customers
* Agents
* Tickets
* Ticket assignment
* Messages
* SLA management
* Notifications
* Reviews
* Analytics
* Administration

The backend uses role-based authorization so users only access operations allowed for their role.

---

## 🗄️ Database

PostgreSQL stores the main support data:

```text
Users
 ├── Customers
 ├── Agents
 └── Admins

Tickets
 ├── Messages
 ├── SLA Information
 ├── Assignments
 ├── Notifications
 └── Reviews
```

PostgreSQL indexing was used to improve ticket retrieval performance.

---

## 🔒 Security

ResolveFlow includes:

* JWT-based authentication
* Password hashing with bcrypt
* Role-based authorization
* Protected API routes
* File type and size validation
* Environment variables for secrets
* Role-scoped ticket access

This helps keep customer, agent, and admin workflows separated.

---

## 🛠️ Tech Stack

**Frontend**

`React.js` `JavaScript` `React Router` `Axios` `Recharts` `Lucide React`

**Backend**

`Node.js` `Express.js` `PostgreSQL` `JWT` `bcrypt` `Multer` `Nodemailer`

**Analytics**

`Python` `Pandas` `Matplotlib` `PostgreSQL`

**DevOps**

`Docker` `Docker Compose` `Nginx` `Git` `GitHub`

---

## 📁 Project Structure

<details>
<summary>Click to view</summary>

```text
ResolveFlow/
├── client/
├── server/
├── analytics/
├── database/
├── docker-compose.yml
└── README.md
```

</details>

---

## 🚀 Run Locally

<details>
<summary>Click to view setup</summary>

### Frontend

```bash
cd client
npm install
npm run dev
```

### Backend

```bash
cd server
npm install
npm start
```

### Analytics

```bash
cd analytics
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python analytics.py
```

</details>

---

## 🐳 Docker

Build and start the application:

```bash
docker compose build
docker compose up -d
```

Check running containers:

```bash
docker compose ps
```

The frontend is served through the Docker setup on port `5173`.

---

## 🎯 Project Purpose

ResolveFlow was built as a practical full-stack project to demonstrate how a support platform can combine:

* REST API development
* PostgreSQL database design
* Authentication and authorization
* Ticket and SLA management
* Customer-agent communication
* Data analytics
* API performance testing
* Docker-based development

The project focuses on a realistic support workflow rather than a simple CRUD application.

---

## 🔮 Future Improvements

* [ ] 🤖 AI-assisted ticket classification and routing
* [ ] 📧 Automated email notifications
* [ ] 🔔 Real-time ticket and SLA notifications
* [ ] 🔍 Advanced ticket search and filtering
* [ ] 📊 More detailed support analytics
* [ ] 👥 Automatic agent assignment based on workload
* [ ] 📱 Mobile-friendly support interface
* [ ] 🧪 Expanded automated API and integration tests
* [ ] ⚡ Redis-based caching for frequently accessed data
* [ ] 📈 Production monitoring and error tracking

---

## 🎯 What This Project Demonstrates

* Full-stack application development
* REST API development
* PostgreSQL database design
* JWT authentication
* Role-based authorization
* Ticket and SLA management
* File handling
* Python/Pandas analytics
* API performance testing
* PostgreSQL query optimization
* Docker-based development

---

## 👩‍💻 Author

**Jhanwi Kumari**

B.Tech — Computer Science & Engineering

[GitHub Repository](https://github.com/Jhanwi/ResolveFlow)

