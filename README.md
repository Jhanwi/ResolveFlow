# ResolveFlow

ResolveFlow is a full-stack support ticket and SLA management platform designed to help customers, support agents, and administrators manage support requests from one place.

## Features

### Customer Portal

* Customer registration and login
* Create support tickets
* Ticket categories and priorities
* File attachments
* Ticket conversation
* SLA tracking
* Notifications
* Customer reviews and ratings
* Ticket history

### Agent Portal

* Agent dashboard
* Assigned ticket management
* Customer lookup
* Ticket replies
* Internal notes
* Priority and status management
* Ticket escalation
* SLA monitoring
* Notifications

### Admin Portal

* Admin dashboard
* All ticket management
* Agent and customer management
* Ticket assignment
* SLA policy management
* SLA breach monitoring
* Analytics

### Analytics

Python and Pandas are used to generate:

* Ticket summaries
* Priority reports
* Category reports
* Daily ticket volume
* Agent workload reports
* SLA reports
* Customer review reports
* Ticket volume charts

## Tech Stack

### Frontend

* React.js
* JavaScript
* React Router
* Axios
* Recharts
* Lucide React

### Backend

* Node.js
* Express.js
* PostgreSQL
* JWT authentication
* bcrypt
* Multer
* Nodemailer

### Analytics

* Python
* Pandas
* Matplotlib
* PostgreSQL

### DevOps

* Docker
* Docker Compose
* Nginx
* Git
* GitHub

## Project Structure

```text
resolveflow/
├── client/
├── server/
├── analytics/
├── database/
├── docker-compose.yml
└── README.md
```

## Running Locally

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

## Docker

Build and start the complete application:

```bash
docker compose build
docker compose up -d
```

Check containers:

```bash
docker compose ps
```

The application is available through the frontend container on port `5173`.

## Main Workflow

```text
Customer
   ↓
Create Ticket
   ↓
Admin Assignment
   ↓
Agent
   ↓
Reply / Internal Note / Status / Priority
   ↓
SLA Monitoring
   ↓
Resolution
   ↓
Customer Review
   ↓
Analytics
```

## Security

* JWT-based authentication
* Password hashing with bcrypt
* Role-based authorization
* Protected API routes
* File type and size validation
* Environment variables for application secrets

## Purpose

ResolveFlow was built as a portfolio project to demonstrate practical full-stack development, REST API development, PostgreSQL database design, authentication, file handling, SLA workflows, analytics, and Docker-based deployment.

