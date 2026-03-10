# Kaizen Onboarding System

This is a full-stack onboarding application featuring a .NET Web API backend and a React frontend.

## Project Structure

* **Backend/**: ASP.NET Core Web API
* **Frontend/**: React.js application

## Prerequisites

Before running this project, ensure you have the following installed:
* [.NET 8.0 SDK](https://dotnet.microsoft.com/download)
* [Node.js & npm](https://nodejs.org/)
* [PostgreSQL](https://www.postgresql.org/download/) (Database)
* [pgAdmin 4](https://www.pgadmin.org/) (Database Management Interface)

---

## Getting Started

### 1. Backend Setup (.NET)

1.  Navigate to the backend folder:
    ```bash
    cd Backend
    ```
2.  **Configure Database:**
    * Open `appsettings.json`.
    * Update the `DefaultConnection` string to match your PostgreSQL credentials.
    * Example format:
      `"Server=localhost;Port=5432;Database=kaizen_db;User Id=postgres;Password=your_password;"`
3.  Apply database migrations:
    ```bash
    dotnet ef database update
    ```
4.  Run the API:
    ```bash
    dotnet run
    ```
    *The backend runs on `https://localhost:7152` or `http://localhost:5052`.*

### 2. Frontend Setup (React)

1.  Open a new terminal and navigate to the frontend folder:
    ```bash
    cd Frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm start
    ```
    *The application will open at `http://localhost:3000`.*

---

## Features
* Employee Registration & Onboarding
* Admin Dashboard
* Resume & Document Uploads
* JWT Authentication
