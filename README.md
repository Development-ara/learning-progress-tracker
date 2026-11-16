# Learning Progress Tracker

## Run locally (Windows PowerShell)

Open two VS Code terminals.

### 1. Backend
```powershell
cd backend
npm.cmd ci
npm.cmd run dev
```
Backend health check: http://localhost:3001/api/v1/health

### 2. Frontend
```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```
Open: http://localhost:5173

The frontend uses Vite's `/api` proxy in development, so local sign-in requests reach the local backend.

## Demo accounts
The backend seed script defines these demo accounts:
- Coordinator: `coordinator@tracker.local` / `Coord!n@t0r1`
- Learner: `jordan.lee@example.com` / `Candidate1!`
- Learner: `morgan.chen@example.com` / `Candidate2!`
- Learner: `casey.rivera@example.com` / `Candidate3!`

If the database has not been seeded, run this once from `backend`:
```powershell
npm.cmd run seed
```

## Notes
- The landing page is public. After sign-in, Coordinators go to their dashboard and Learners go to their training dashboard.
- The original role-based routes and application pages are retained.
- Local session cookies use HTTP-compatible settings. Production uses secure cookies.
- `backend/.env` is a local-development file only. Replace its session secret and coordinator password before any deployment.
- For production frontend builds, the Render API URL is configured in `frontend/.env.production`. Change it if your backend URL changes.
- This package does not include `node_modules`; run `npm.cmd ci` in both folders.
