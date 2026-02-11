# Launch Pad

A space-themed family task management system. Kids complete objectives, transmit photo proof to Mission Control (parents), and collect Fuel (points) for future launches.

**Current Status:** v0.2.2-alpha - Core workflow complete, shop system designed

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
- Task management with photo proof requirements
- Automated task generation (daily/weekly schedules)
- Kid dashboard: View objectives, submit with photos
- Parent dashboard: Review submissions, approve/reject
- Points (Fuel) ledger system
- Customizable task time windows

### 🚧 Designed (Ready to Build)
- **Launch Bay** - Shop system with tiered destinations
- **Investigations** - Family-wide discovery quests
- **Hangar** - Rocket customization with unlockable parts

See `DESIGN.md` for complete feature specifications.

---

## Tech Stack

**Backend:**
- Python 3.13+ with FastAPI 0.115.0
- SQLite database (aiosqlite)
- JWT authentication (pyjwt)
- bcrypt password hashing
- APScheduler for automated jobs

**Frontend:**
- React 18 with Vite
- TailwindCSS (no component libraries)
- React Router
- Axios for API calls

**Deployment:** Raspberry Pi (local network)

---

## Installation

### Prerequisites
- Python 3.13+
- Node.js 18+
- Git

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Bootstrap initial data (creates default parent user + 7 days of tasks)
python -m app.utils.task_generator bootstrap

# Run server
python run.py
```

Backend runs at `http://localhost:8000`  
API docs at `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## User Management

```bash
# Create new user
python -m app.utils.user create <username> <password> <role> <display_name>

# Examples
python -m app.utils.user create kid1 test123 kid "Alice"
python -m app.utils.user create parent2 secure456 parent "Dad"

# Change password
python -m app.utils.user setpass <username> <new_password>
```

**Roles:** `parent` (can create/review tasks) or `kid` (can complete tasks)

---

## Project Structure

```
launch-pad/
├── backend/
│   ├── app/
│   │   ├── routes/          # API endpoints
│   │   ├── models/          # Pydantic schemas
│   │   ├── utils/           # User mgmt, task generator
│   │   ├── auth.py          # JWT authentication
│   │   ├── database.py      # SQLite schema
│   │   └── main.py          # FastAPI app
│   ├── database/            # SQLite file (gitignored)
│   ├── uploads/             # Photos & icons (gitignored)
│   └── run.py               # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── services/        # API client
│   │   ├── hooks/           # Custom React hooks
│   │   └── config/          # Theme configuration
│   └── package.json
├── DESIGN.md                # UI/UX design system
├── INSTRUCTIONS.md          # Development guidelines
├── TESTING.md               # Manual test procedures
└── README.md                # This file
```

---

## Database Schema

**Core Tables:**
- `users` - Parent/kid accounts (bcrypt password hashing)
- `tasks` - Task templates (recurring/custom schedules)
- `task_instances` - Individual task occurrences with time windows
- `points_transactions` - Ledger-based points system
- `task_history` - Audit trail for status changes

**Key Concepts:**
- Points are ledger-based (transactions), not simple balance
- Photos deleted after approval or resubmission
- Tasks expire at `available_end` (no grace period)
- User deletion cascades (hard delete)

---

## Development

### Running Tests
Manual testing via Swagger UI at `/docs`

See `TESTING.md` for test scenarios and checklists.

### Code Guidelines
See `INSTRUCTIONS.md` for:
- Pythonic code standards
- Backend/frontend architecture
- File delivery format
- Working preferences

### UI/UX Guidelines
See `DESIGN.md` for:
- Launch Pad theme system
- Component patterns (TailwindCSS)
- Color palette & typography
- Accessibility standards

---

## Theme System

**Backend:** Theme-agnostic. Uses generic terms (`points`, `tasks`, `submit`)  
**Frontend:** "Launch Pad" space theme (`Fuel`, `Objectives`, `Transmit Data`)

Theme is centralized in `frontend/src/config/theme.js` and can be swapped without touching backend API.

| Backend API | Frontend UI |
|-------------|-------------|
| points      | Fuel ⛽     |
| tasks       | Objectives 🎯 |
| submit      | Transmit Data 📡 |
| dashboard   | Mission Control 🎛️ |

---

## Known Limitations (Alpha)

- No real-time updates (page refresh required)
- No notifications (parents must check for pending submissions)
- No Pillow/image processing (compilation issues)
- Basic security (suitable for home network only, not internet-facing)
- Manual testing only (no unit tests yet)

**ALPHA phase:** Breaking database changes = delete `backend/database/chore.db` and start fresh. Migrations come in production.

---

## Roadmap

**Phase 1** (Current) - Core workflow polish
- Fuel balance display
- Transaction history
- Statistics dashboard

**Phase 2** - Launch Bay (Shop System)
- Tiered destinations (Moon, Mars, Jupiter)
- Cargo rewards
- Family investigations

**Phase 3** - Gamification
- Hangar (rocket customization)
- Streaks & badges
- Achievement system

**Phase 4** - Advanced Features
- Notifications
- Real-time updates
- Multi-family support

---

## License

Private family use only.

---

## Support

For questions or issues, check:
1. `TESTING.md` - Test procedures
2. `DESIGN.md` - UI/UX specifications
3. `/docs` endpoint - API documentation
4. Project issues (if public repo)

**Default Credentials:** `parent` / `password123` (change after first login)
