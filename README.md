# EMS

Simple Employee Management System built with React, Express, and MongoDB.

## What it does

- Admin and employee login
- Department and employee management
- Leave request management
- Salary records and payslip view
- Profile and dashboard pages

## Tech stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB

## Project structure

```text
frontend/   React app
backend/    Express API and database logic
render.yaml Render deployment config
```

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Create `backend/.env`:

```env
MONGODB_URL=your_mongodb_connection_string
JWT_KEY=your_secret_key
FRONTEND_URL=http://localhost:3002
PORT=3000
```

3. Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

## Run locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

App URLs:

- Frontend: `http://localhost:3002`
- Backend: `http://localhost:3000`

## Optional seed data

Run:

```bash
npm run seed
```

Sample login after seeding:

- Admin: `admin1@ems.com`
- Employee: `htet@ems.com`
- Password: `Admin@123`
