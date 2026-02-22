# Launch Pad

A space-themed family task management system. Kids complete objectives, transmit photo proof to Mission Control (parents), and collect Fuel (points) for future launches.

**Current Status:** v0.4.0-alpha — Parent UX polish complete

---

## Quick Start

```bash
# Backend (localhost:8000)
cd backend
python run.py

# Frontend (localhost:5173)
cd frontend
npm run dev
```

**Default login:** `parent` / `password123`

---

## Features

### ✅ Implemented
- **Launch Pad theme** — Space mission UI for kids, professional admin for parents
  - Custom green glowing fuel icon, starfield login, role-based styling
  - Centralized theme config (`theme.js`) — all text/icons in one place
- **Task management** — Create recurring and one-time objectives with photo proof requirements
- **Automated task generation** — Daily/weekly schedules via APScheduler
- **Mission Control dashboard** — Kid view with fuel tracking and status badges
- **Parent dashboard** — Inline task editing with sectioned form cards; inline deactivate
- **Submission review** — Inline photo expand; single approve/reject location per card
- **Fuel (Points) ledger** — Transaction-based, not a simple counter

### 🚧 Designed (Ready to Build)
- **Launch Bay** — Shop system with tiered destinations (Moon, Mars, Jupiter)
- **Investigations** — Family-wide discovery quests
- **Hangar** — Rocket customization with unlockable parts

See `DESIGN.md` for complete feature specifications.

---

## Tech Stack

**Backend:** Python 3.13+, FastAPI 0.115.0, SQLite (aiosqlite), JWT (pyjwt), bcrypt, APScheduler  
**Frontend:** React 18, Vite, TailwindCSS, React Router, Axios  
**Deployment:** Raspberry Pi (local network)

---

## Installation

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.utils.task_generator bootstrap
python run.py
```

Backend: `http://localhost:8000` · API docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

---

## User Management

```bash
# Create user
python -m app.utils.user create <username> <password> <role> <display_name>

# Examples
python -m app.utils.user create kid1 test123 kid "Alice"
python -m app.utils.user create parent2 secure456 parent "Dad"

# Change password
python -m app.utils.user setpass <username> <new_password>
```

**Roles:** `parent` (create/review tasks) · `kid` (complete tasks)

---

## Project Structure

```
launch-pad/
├── backend/
│   ├── app/
│   │   ├── routes/       # API endpoints
│   │   ├── models/       # Pydantic schemas
│   │   ├── utils/        # User mgmt, task generator
│   │   ├── auth.py       # JWT authentication
│   │   ├── database.py   # SQLite schema
│   │   └── main.py       # FastAPI app
│   ├── database/         # SQLite file (gitignored)
│   ├── uploads/          # Photos & icons (gitignored)
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route pages
│   │   ├── services/     # API client (api.js)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── utils/        # iconRenderer
│   │   └── config/       # theme.js
│   └── package.json
├── DESIGN.md
├── TESTING.md
├── ALPHA_RELEASE_NOTES.md
└── README.md
```

---

## Database Schema

- `users` — Parent/kid accounts (bcrypt password hashing)
- `tasks` — Task templates (recurring/custom schedules)
- `task_instances` — Individual occurrences with time windows
- `points_transactions` — Ledger-based points system
- `task_history` — Audit trail for status changes

**Key rules:** Points are ledger-based · Photos deleted on approval or resubmission · Tasks expire at `available_end` (no grace period) · User deletion cascades

---

## Theme System

Backend is theme-agnostic. All Launch Pad terminology lives in `frontend/src/config/theme.js`.

| Backend API | Frontend UI |
|---|---|
| points | Fuel ⛽ |
| tasks | Objectives 🎯 |
| submit | Transmit Data 📡 |
| dashboard | Mission Control 🎛️ |

Swap the entire theme by replacing `theme.js` — backend unaffected.

---

## Known Limitations (Alpha)

- No real-time updates (page refresh required)
- No notifications (parents must check for pending submissions)
- Basic security — suitable for home network only
- Manual testing only (no unit tests yet)

**ALPHA phase:** Breaking DB changes = delete `backend/database/chore.db` and restart fresh.

---

## Roadmap

**Phase 1** (Current) — Fuel balance display, transaction history  
**Phase 2** — Launch Bay shop system  
**Phase 3** — Hangar customization, streaks, badges  
**Phase 4** — Notifications, real-time updates

---

## Support

1. `TESTING.md` — Test procedures
2. `DESIGN.md` — UI/UX specifications
3. `/docs` — API documentation (Swagger)

**Default credentials:** `parent` / `password123`
