# IntelliHR – Enterprise HR Management System

IntelliHR is a full-stack Enterprise Human Resource Management System developed to streamline HR operations and improve employee management through a centralized platform. It provides dedicated functionalities for administrators, HR professionals, employees, and job candidates, along with AI-powered assistance.

The application integrates a React frontend, Spring Boot backend, MySQL database, and Spring AI to deliver a comprehensive HR management solution.

## Project Objectives

- Centralize HR operations and employee information.
- Simplify HR workflows and administrative activities.
- Implement secure authentication and role-based authorization.
- Improve recruitment and candidate application management.
- Provide employee self-service functionalities.
- Manage attendance, leaves, payroll, onboarding, and performance.
- Integrate AI-powered assistance into HR operations.

## Key Features

### 1. Dashboard
- Role-based dashboards for Admin, HR, and Employees.
- Display relevant HR information and activities.
- Provide quick access to application modules.

### 2. Employee Management
- Create and manage employee records.
- View employee details and profiles.
- Search, filter, and paginate employee records.
- Manage employee status.
- Organize employees by department and designation.

### 3. Department Management
- Create and manage departments.
- Update department information.
- Organize employees based on departments.

### 4. Attendance Management
- Manage employee attendance information.
- Monitor attendance records.
- Access attendance-related functionalities.

### 5. Leave Management
- Manage employee leave requests.
- Handle leave-related workflows.
- Access leave management functionalities.

### 6. Payroll Management
- Manage payroll-related employee information.
- Organize payroll management activities.

### 7. Recruitment Management
- Create and manage job postings.
- Manage candidate applications.
- Review candidate profiles and resumes.
- Manage recruitment workflows.
- Organize interview-related activities.

### 8. Candidate Portal
- Candidate registration and login.
- Manage candidate profiles.
- Upload resumes.
- Browse available job opportunities.
- Apply for job postings.
- Track candidate application workflows.

### 9. Onboarding
- Manage employee onboarding activities.
- Organize onboarding processes.

### 10. Performance Management
- Manage performance-related employee activities.
- Organize employee performance information.

### 11. Document Management
- Manage employee-related documents.
- Access document management functionalities.

### 12. Audit Logs
- Track application-related activities.
- Access audit log records.

### 13. AI Assistant
- AI-powered assistance integrated into IntelliHR.
- Leverage Spring AI for AI-related application functionality.

### 14. Settings
- Manage account-related settings.
- Customize application appearance.
- Access application preferences.

## Technologies Used

| Technology | Purpose |
|---|---|
| React | Frontend user interface development |
| JavaScript | Frontend application functionality |
| HTML5 | Web page structure |
| CSS3 | Styling and responsive design |
| Vite | Frontend development and build tool |
| Java 21 | Backend development |
| Spring Boot | Backend application framework |
| Spring MVC | REST API development |
| Spring Security | Application security and authorization |
| JWT | Authentication |
| Spring Data JPA | Database access and persistence |
| Hibernate | ORM |
| MySQL | Relational database |
| Spring AI | AI integration |
| Maven | Backend build and dependency management |
| Postman | API testing |
| MySQL Workbench | Database management |
| Git | Version control |
| GitHub | Source code hosting |

## Repository Structure

```text
IntelliHR/
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── mvnw.cmd
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── images/
└── README.md
```

## User Roles

| Role | Description |
|---|---|
| ADMIN | Administrative access to system management functionalities. |
| HR | Access to HR operations, employee management, recruitment, and related modules. |
| EMPLOYEE | Access to employee-related features and permitted self-service functionalities. |
| CANDIDATE | Access to the candidate portal, profile management, and job application functionalities. |

## Requirements

- Java 21
- MySQL 8
- Node.js
- npm
- Git
- MySQL Workbench (recommended)

## Installation and Setup

Follow these steps to run IntelliHR locally.

### Step 1 – Clone the Repository

```bash
git clone https://github.com/bhavani5555/IntelliHR.git
```

### Step 2 – Navigate to the Project

```bash
cd IntelliHR
```

### Step 3 – Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Configure your MySQL database and the required environment variables according to the backend configuration.

Run the backend application on Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

### Step 4 – Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd IntelliHR/frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

Open the local URL provided by Vite in the terminal to access the frontend.

## Project Screenshots

Application screenshots are organized in the [`images`](./images) folder.

The screenshots showcase IntelliHR dashboards, application modules, and user interfaces.

## Project Highlights

- Developed a full-stack HR Management System using React and Spring Boot.
- Implemented REST APIs for backend application functionalities.
- Integrated JWT-based authentication and role-based access control.
- Used MySQL for relational data persistence.
- Developed dedicated modules for employee management and HR operations.
- Implemented a dedicated Candidate Portal and recruitment workflow.
- Integrated AI capabilities using Spring AI.
- Organized the application into separate frontend and backend modules.

## Future Enhancements

- Expand AI-powered HR assistance.
- Enhance HR analytics and reporting.
- Introduce additional HR workflow automation.
- Improve reporting and dashboard insights.
- Extend employee self-service capabilities.

## Developer

Developed as a full-stack portfolio project to demonstrate application development using React, Java, Spring Boot, MySQL, Spring Security, and Spring AI.

**IntelliHR – Enterprise HR Management System**
