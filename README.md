# Chore Tracker - Alpha v0.1.0

A family chore management system where kids complete tasks with photo proof and parents approve to award points.

## Status: Alpha Release

**What Works:**
- ✅ User authentication (JWT-based)
- ✅ Parent: Create and manage tasks
- ✅ Photo/icon upload system
- ✅ Complete task creation UI flow
- ✅ Parent dashboard

**In Development:**
- Task instance generation (cron for recurring tasks)
- Kid dashboard and task submission
- Parent review and approval workflow
- Points system UI
- Shop with Robux redemption
- Gamification (badges, streaks, levels)

## Quick Start

### Prerequisites
- Python 3.13+
- Node.js 18+
- npm

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
python run.py
```

Server runs at http://localhost:8000
API docs at http://localhost:8000/docs

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

App runs at http://localhost:5173

### Default Login
- Username: `parent`
- Password: `password123`

## Architecture

### Backend (Python/FastAPI)
```
backend/
├── app/
│   ├── routes/      # API endpoints
│   ├── models/      # Pydantic schemas
│   ├── utils/       # User class & utilities
│   ├── auth.py      # JWT authentication
│   ├── database.py  # SQLite schema
│   └── main.py      # FastAPI app
├── database/        # SQLite database (gitignored)
├── uploads/         # User uploads (gitignored)
└── requirements.txt
```

### Frontend (React/Vite)
```
frontend/
├── src/
│   ├── components/  # Reusable components
│   ├── pages/       # Page components
│   ├── hooks/       # Custom hooks (useAuth)
│   ├── services/    # API client
│   └── App.jsx
└── package.json
```

### Database Schema
- **users** - Parent and kid accounts with bcrypt hashed passwords
- **tasks** - Task templates (recurring/one-off)
- **task_instances** - Individual task occurrences with time windows
- **points_transactions** - Ledger-based point tracking
- **task_history** - Audit trail for task status changes

## User Management

```bash
# Create a new kid user
python -m app.utils.user create kid1 password123 kid "Alice"

# Change password
python -m app.utils.user setpass parent newpassword
```

Or in Python shell:
```python
from app.utils.user import User

# Create user
user = User(username='kid2', role='kid', display_name='Bob')
user.password = 'secretpass'  # Automatically hashed
user.save()

# Load and update
user = User.get_by_username('parent')
user.password = 'newpass'
user.save()
```

## API Testing

Visit http://localhost:8000/docs for interactive Swagger UI.

**Test login:**
```json
POST /api/auth/login
{
  "username": "parent",
  "password": "password123"
}
```

**Create a task:**
```json
POST /api/tasks
Authorization: Bearer <token>
{
  "title": "Make Bed",
  "description": "Make your bed every morning",
  "points_value": 10,
  "task_type": "recurring",
  "recurrence_pattern": "daily",
  "photo_required": true,
  "photo_criteria": "Sheets pulled tight, pillows arranged neatly"
}
```

## Tech Stack

**Backend:**
- FastAPI 0.115.0
- Python 3.13+
- SQLite3
- bcrypt (direct, no passlib)
- PyJWT
- Pydantic v2

**Frontend:**
- React 18
- Vite
- TailwindCSS
- React Router
- Axios

## Development Notes

### Pythonic Patterns Used
- `@password.setter` decorator for automatic password hashing
- `@classmethod` for alternative constructors (User.get_by_username)
- Context managers (`with` statements) for database connections
- `__repr__` and `__str__` for better debugging

### Code Style
- Type hints throughout
- Minimal comments (self-documenting code)
- No unnecessary abstractions
- Direct bcrypt usage (not passlib)
- Timezone-aware datetimes (`datetime.now(timezone.utc)`)

### Design Decisions
- **Ledger-based points** - Not simple balance, full transaction history
- **Photo deletion** - Photos deleted after approval to save space
- **No grace periods** - Tasks lock exactly at `available_end` time
- **Hard delete users** - Cascade deletion when removing kids
- **Local network only** - Not production-hardened security

## Deployment Target

Raspberry Pi on local home network.

## Known Limitations

- No image processing (Pillow removed due to compilation issues)
- No automated task instance generation yet (manual cron to be added)
- Basic security (suitable for home network, not internet-facing)
- No real-time updates (requires page refresh)

## Contributing

This is a personal family project. Code follows Pythonic conventions and emphasizes simplicity.

## License

Private use only.
