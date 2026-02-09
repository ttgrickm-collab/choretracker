# Chore Tracker - Alpha v0.1.0 Release Notes

**Release Date:** February 9, 2026
**Status:** Alpha - Ready for Projects upload

---

## What's Included in This Release

### ✅ Working Features

**Authentication & User Management:**
- JWT-based authentication system
- User class with Pythonic `@password.setter` decorator
- Command-line user management tools
- Login page with auth context
- Protected routes

**Task Management (Parent Side):**
- Create tasks (recurring or one-off)
- Set recurrence patterns (daily, specific days)
- Upload custom task icons
- Define photo requirements and acceptance criteria
- View all created tasks in dashboard
- Full CRUD operations via API

**Technical Foundation:**
- Complete database schema (5 tables)
- SQLite with proper foreign keys
- Pydantic v2 validation
- FastAPI with auto-generated docs
- React frontend with TailwindCSS
- Responsive design for tablets

### 📝 Code Quality

**Pythonic Patterns:**
- `@password.setter` for automatic password hashing
- `@classmethod` for User.get_by_username() / get_by_id()
- Context managers (`with` statements) for DB connections
- `__repr__` and `__str__` methods for debugging
- Type hints throughout
- Timezone-aware datetimes

**Architecture:**
- Clean separation of routes, models, utils
- Centralized API client
- Environment-based configuration
- Proper .gitignore for production

---

## What's NOT Included (Coming Next)

### 🚧 In Development

**Priority 1 - Core Loop:**
1. Task instance generation (cron job for recurring tasks)
2. Kid dashboard (view assigned tasks)
3. Kid: Submit task with photo upload
4. Parent: Review pending submissions with photo viewer
5. Parent: Approve/reject workflow

**Priority 2 - Points System:**
6. Points balance display
7. Points transaction history
8. Points awarded notification

**Priority 3 - Shop:**
9. Shop interface
10. Robux gift card code management
11. Purchase workflow
12. Additional reward items

**Priority 4 - Gamification:**
13. Streak tracking
14. Badge system
15. Level-up mechanics
16. Profile page with achievements

**Priority 5 - Family Features:**
17. Family collaborative events
18. Competition mode
19. Bonus multipliers
20. Tiered goals

---

## Known Limitations

**Current Alpha Constraints:**
- Manual database deletion needed for schema changes
- No task instance auto-generation yet (requires cron)
- No kid interface (coming next)
- No real-time updates (page refresh required)
- Basic security (suitable for home network only)

**Deliberate Design Choices:**
- No Pillow/image processing (compilation issues on some systems)
- No passlib (using bcrypt directly for simplicity)
- No ORM (direct SQLite for transparency)
- Local network only (not internet-hardened)

---

## Testing Checklist

Before uploading to Projects, verify:

- [ ] Backend starts successfully: `python run.py`
- [ ] Frontend starts successfully: `npm run dev`
- [ ] Login works at http://localhost:5173
- [ ] Can create a task via UI
- [ ] Task appears in dashboard
- [ ] API docs accessible at http://localhost:8000/docs
- [ ] Can create user via CLI: `python -m app.utils.user create test pass kid "Test"`

---

## Files to Upload to Projects

**Essential:**
- `backend/` (entire folder)
- `frontend/` (entire folder)
- `README.md`
- `.gitignore`
- This file (`ALPHA_RELEASE_NOTES.md`)

**Exclude:**
- `backend/database/` (will be regenerated)
- `backend/uploads/` (user data)
- `backend/venv/` (virtual environment)
- `frontend/node_modules/` (will be reinstalled)
- `frontend/dist/` (build output)
- Any `__pycache__/` directories
- Any `.pyc` files

---

## Next Session Priorities

When you return to develop further:

1. **Implement task instance generation** - Most critical for testing full flow
2. **Build kid dashboard** - View available tasks
3. **Photo submission flow** - Complete the core loop

These three features will make the app fully testable end-to-end.

---

## Changes Made in Final Cleanup

**Improvements:**
- Added `__repr__` and `__str__` to User class
- Replaced manual conn.close() with context managers
- Added comprehensive .gitignore
- Added version tracking (app/version.py)
- Updated README with Alpha status
- API root endpoint now shows version

**Nothing Breaking:**
All changes are backwards compatible. Existing database will work fine.

---

## Development Commands Reference

```bash
# Backend
cd backend
source venv/bin/activate
python run.py

# Frontend  
cd frontend
npm run dev

# User management
python -m app.utils.user create <username> <password> <role> <display_name>
python -m app.utils.user setpass <username> <new_password>

# API testing
# Visit http://localhost:8000/docs
```

---

**Ready for Projects! 🚀**

This is a clean, Pythonic, well-documented Alpha release ready to be added to your Claude Projects for continued development.
