# Employee Management System (EMS)

School project built to production-style standards: role-based APIs, protected uploads, env-based config, and a seed dataset that matches the live data model.

## Features

- **Auth:** admin and employee login (JWT, 1-day expiry)
- **Employees:** create/update/view, multiple departments, phones, profile photos
- **Employee types:** Internship, Probation, Permanent (duration, salary, and leave rules)
- **Departments:** CRUD with delete blocked while people are assigned
- **Leave:** employees request; one admin approve/reject
- **Salary:** monthly collections, edit by pay date, payslip download
- **Dashboards:** admin overview and employee overview

Admins are created only from the seed file. The app can create employees, not admins.

## Tech stack

| Layer | Stack |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS 4, MobX, Flowbite React |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Deploy | Frontend: Vercel (`frontend/vercel.json`). Backend: Render (`render.yaml`) |

## Project structure

```text
frontend/     React app
backend/      Express API, models, seed
backend/tests Unit tests
render.yaml   Render backend config
```

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Create env files from the examples.

**Windows (PowerShell):**

```powershell
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

**macOS / Linux:**

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Edit the values.

`backend/.env`:

```env
NODE_ENV=development
PORT=3000
MONGODB_URL=your_mongodb_connection_string
JWT_KEY=a-long-random-secret
FRONTEND_URL=http://localhost:3002
```

`frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

Do not commit `.env` files. They are listed in `.gitignore`.

## Run locally

Backend:

```bash
cd backend
npm run dev
```

Frontend (second terminal):

```bash
cd frontend
npm run dev
```

- Frontend: http://localhost:3002
- Backend: http://localhost:3000
- Health check: `GET http://localhost:3000/api/health`

## Seed data

This **deletes** existing EMS collections, then inserts sample data.

```bash
npm run seed
```

After seeding:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@ems.com` | `Admin@123` |
| Employee | `htet@ems.com` | `Admin@123` |

Other employee emails follow the same password (`sumon@ems.com`, `zawlin@ems.com`, and so on).

## Tests

```bash
npm test
```

Covers department ID parsing, leave-day calculation, and password rules.

## Production notes

- Set `NODE_ENV=production`
- Use a unique strong `JWT_KEY`
- Set `FRONTEND_URL` to the real frontend origin only
- Serve the API over HTTPS
- Keep MongoDB credentials out of git
- Run `npm test` before you deploy
- Seed only on an empty database
- Backend production start command: `cd backend && npm start`

API highlights already in place:

- Auth required on protected routes
- Admin vs employee enforced on the server
- Profile images served only to authenticated users
- Login rate limiting and Helmet headers
- Image uploads capped at 5MB
