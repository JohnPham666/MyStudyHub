<div align="center">
  <h1>🚀 Study Flow</h1>
  <p>A comprehensive full-stack application designed to streamline and manage your learning journey.</p>
  
  [![Frontend: React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-blue?logo=react&logoColor=white)](https://react.dev)
  [![Backend: Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot-brightgreen?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
  [![Database: SQL Server](https://img.shields.io/badge/Database-SQL%20Server-red?logo=microsoftsqlserver&logoColor=white)](https://www.microsoft.com/en-us/sql-server)
</div>

<hr>

## 📖 Overview

**Study Flow** is a full-stack platform consisting of a high-performance React/Vite frontend and a robust Spring Boot backend. The project is organized in a single repository for seamless development, testing, and deployment.

---

## ✨ Features

- ⚡ **Fast & Responsive UI**: Powered by React 19, Vite, and Tailwind CSS.
- 🔒 **Secure Backend**: Built with Java 21 and Spring Boot.
- 💾 **Reliable Data Storage**: Integrated with Microsoft SQL Server.
- 🛠️ **Easy Setup**: Simplified startup process using `concurrently` to run both the frontend and backend with a single command.

---

## 🛠️ Technology Stack

| Area | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS, TanStack Router & Query |
| **Backend** | Java 21, Spring Boot, Maven |
| **Database** | Microsoft SQL Server |
| **Tooling** | Node.js, npm, Concurrently |

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v18 or higher)
- **Java Development Kit (JDK)** (v21)
- **Maven**
- **SQL Server** (running locally on port 1433)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/study-flow-fullstack.git
   cd study-flow-fullstack
   ```

2. **Install all dependencies:**
   This command will install the root dependencies and the frontend dependencies automatically.
   ```bash
   npm install
   npm run install:all
   ```

### Running the Application

**Method 1: One-Click Start (Recommended)**

We use `concurrently` to run both the frontend and backend servers together with a single command. From the root directory, run:

```bash
npm start
```

**Method 2: Manual Start**

If you prefer to run the services in separate terminal windows:

*Terminal 1 (Frontend):*
```bash
cd frontend
npm run dev
```

*Terminal 2 (Backend):*
```bash
cd backend
./mvnw spring-boot:run
```

*(Note: On Windows, use `.\mvnw spring-boot:run`)*

### Accessing the App

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:8080/api](http://localhost:8080/api)

---

## 🗄️ Database Configuration

The backend is configured to use Microsoft SQL Server. 

**Default Credentials:**
- **URL**: `jdbc:sqlserver://localhost:1433;databaseName=studyhub;encrypt=true;trustServerCertificate=true`
- **Username**: `sa`
- **Password**: `12345678`

If your local setup differs, please update the application properties file located at:
`backend/src/main/resources/application.yml` (or `.properties`).

---

## 📂 Project Structure

```text
study-flow-fullstack/
├── backend/               # Spring Boot Java Application
│   ├── src/               # Backend source code
│   └── pom.xml            # Maven configuration
├── frontend/              # React + Vite Application
│   ├── src/               # Frontend source code
│   └── package.json       # Frontend dependencies
├── package.json           # Root configuration for concurrently
└── README.md              # Project documentation
```

---

<div align="center">
  <i>Built with ❤️ for better learning experiences.</i>
</div>
