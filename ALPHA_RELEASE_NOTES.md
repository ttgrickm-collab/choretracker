# Chore Tracker - Alpha Release Notes

**Current Version:** v0.2.1-alpha
**Release Date:** February 10, 2026
**Status:** Alpha - Task Instance System Complete

---

## What's Included in v0.2.1

### ✅ Working Features

**Authentication & User Management:**
- JWT-based authentication system
- User class with Pythonic `@password.setter` decorator
- Command-line user management tools
- Login page with auth context
- Protected routes

**Task Management (Parent Side):**
- Create tasks (recurring or custom)
- Set recurrence patterns (daily, specific days using Python weekday())
- Upload custom task icons
- Define photo requirements and acceptance criteria
- View all created tasks in dashboard
- Full CRUD operations via API

**Task Instance System:**
- Automated task generation via APScheduler
- Daily midnight job generates Day +7 (7-day rolling window)
- Bootstrap command for initial setup: `python -m app.utils.task_generator bootstrap`
- Default time windows: 6am start, 9pm next day end
- Lazy expiration checking (efficient for Raspberry Pi)
- Background safety net (runs every 10 minutes)
- Smart duplicate prevention
- Only locks incomplete tasks - pending can be reviewed after deadline

**Kid Interface:**
- View assigned tasks from active task templates
- Status badges (To Do, Pending Review, Approved, Rejected, Expired)
- Photo submission with preview
- View photo criteria before submission
- See rejection reasons and resubmit capability
- Frontend can filter tasks by status

**Parent Review Workflow:**
- Review pending submissions page
- Full-size photo viewer with criteria reminder
- Approve submissions (awards points, deletes photo)
- Reject submissions with reason
- Smart rejection logic:
  - If within deadline → status: incomplete (kid can resubmit, photo deleted)
  - If past deadline → status: rejected (task failed, photo kept)
- Delete task instances endpoint (useful for custom instances)

**Points System:**
- Ledger-based transactions (not simple counter)
- Points awarded on approval
- Full transaction history in database
- Ready for balance display and shop system

**Technical Foundation:**
- Complete database schema (5 tables, all active)
- SQLite with proper foreign keys
- Pydantic v2 validation
- FastAPI with auto-generated docs
- React frontend with TailwindCSS
- Responsive design for tablets
- APScheduler for automated jobs

### 📝 Code Quality

**Pythonic Patterns:**
- `@password.setter` for automatic password hashing
- `@classmethod` for User.get_by_username() / get_by_id()
- Context managers (`with` statements) for DB connections
- `__repr__` and `__str__` methods for debugging
- Type hints throughout
- Timezone-aware datetimes
- Async/await with aiosqlite

**Architecture:**
- Clean separation of routes, models, utils
- Centralized API client
- Environment-based configuration
- Proper .gitignore for production
- Modular scheduler system
- Lazy expiration for efficiency

---

## What's NOT Included (Coming Next)

### 🚧 Priority 1 - Polish & UI

1. Points balance display on dashboards
2. Points transaction history view (for kids)
3. Task completion statistics
4. Better mobile responsive design

### 🚧 Priority 2 - Shop System

5. Shop interface
6. Robux gift card code management
7. Purchase workflow with points deduction
8. Additional reward items

### 🚧 Priority 3 - Gamification

9. Streak tracking (consecutive days)
10. Badge system
11. Level-up mechanics
12. Profile page with achievements

### 🚧 Priority 4 - Family Features

13. Family collaborative events
14. Competition mode
15. Bonus multipliers
16. Tiered goals

---

## Known Limitations

**Current Alpha Constraints:**
- Manual database deletion needed for schema changes
- No real-time updates (page refresh required)
- Basic security (suitable for home network only)
- No notifications (parents must check for pending submissions)

**Deliberate Design Choices:**
- No Pillow/image processing (compilation issues on some systems)
- No passlib (using bcrypt directly for simplicity)
- No ORM (direct SQLite for transparency)
- Local network only (not internet-hardened)
- Lazy expiration (efficient for Raspberry Pi)

---

## New Commands (v0.2.x)

### Bootstrap Initial Task Instances
```bash
python -m app.utils.task_generator bootstrap
```
Run this once after creating your first tasks. Generates task instances for Days 0-6 (today through 6 days ahead).

### Create Kid Users
```bash
python -m app.utils.user create <username> <password> kid "<display_name>"
# Example:
python -m app.utils.user create kid1 test123 kid "Alice"
```

---

## Testing Checklist

Before considering complete, verify:

**Backend:**
- [ ] Backend starts successfully: `python run.py`
- [ ] APScheduler starts: Check logs for "✓ APScheduler started successfully"
- [ ] Bootstrap command works: `python -m app.utils.task_generator bootstrap`
- [ ] API docs accessible at http://localhost:8000/docs

**Frontend:**
- [ ] Frontend starts successfully: `npm run dev`
- [ ] Login works at http://localhost:5173

**Task Flow:**
- [ ] Parent can create recurring tasks via UI
- [ ] Parent can create custom tasks via UI
- [ ] Bootstrap generates instances for 7 days
- [ ] Kid can view tasks on dashboard (from active tasks only)
- [ ] Kid can submit task with photo
- [ ] Parent can view pending submissions
- [ ] Parent can approve (points awarded, photo deleted)
- [ ] Parent can reject within deadline (kid can resubmit)
- [ ] Expired incomplete tasks auto-lock when accessed
- [ ] Pending tasks can be reviewed after deadline

**Database:**
- [ ] Points transaction recorded in `points_transactions` table
- [ ] Task history recorded in `task_history` table
- [ ] Photos deleted after approval

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

## Changes from v0.2.0 to v0.2.1

**Terminology Update:**
- Renamed `"one-off"` to `"custom"` throughout codebase
- Better reflects purpose: tasks requiring manual instance creation

**Improved Logic:**
- Task generator now filters `task_type = 'recurring'` in query (more efficient)
- Expiration checker only locks `incomplete` tasks (pending can be reviewed after deadline)
- Kid dashboard returns tasks from active task templates only

**New Endpoint:**
- `DELETE /api/task-instances/{id}` - Parent can delete instances

**Modified Files:**
- `backend/app/models/task.py` - Updated validation patterns
- `backend/app/database.py` - Updated CHECK constraints
- `backend/app/utils/task_generator.py` - Improved query and logic
- `backend/app/utils/task_expiration.py` - Only lock incomplete tasks
- `backend/app/routes/task_instances.py` - Added DELETE, updated comments
- `frontend/src/pages/CreateTask.jsx` - Updated UI labels
- `frontend/src/services/api.js` - Added deleteInstance method
- `README.md` - Updated documentation
- `ALPHA_RELEASE_NOTES.md` - This file

**Breaking Change:**
- Database schema CHECK constraints changed
- **Requires database recreation:** `rm backend/database/chore.db && python run.py`

---

## Changes from v0.1.0 to v0.2.0

**New Backend Files:**
- `app/scheduler.py` - APScheduler integration
- `app/utils/task_generator.py` - Task instance generator with bootstrap
- `app/utils/task_expiration.py` - Lazy expiration checker
- `app/routes/task_instances.py` - Kid and parent instance endpoints

**Modified Backend Files:**
- `app/main.py` - Added scheduler startup/shutdown
- `app/routes/__init__.py` - Export task_instances
- `requirements.txt` - Added APScheduler==3.10.4
- `app/version.py` - Bumped to v0.2.0-alpha

**New Frontend Files:**
- `src/components/TaskSubmissionModal.jsx` - Photo upload modal
- `src/components/PhotoViewer.jsx` - Parent review modal
- `src/pages/ParentReview.jsx` - Review pending submissions page

**Modified Frontend Files:**
- `src/pages/KidDashboard.jsx` - Complete rewrite with task list
- `src/services/api.js` - Added taskInstancesAPI methods
- `src/App.jsx` - Added /review route
- `src/components/Navbar.jsx` - Added Review Submissions link

**Documentation:**
- `README.md` - Updated with new features and commands
- `ALPHA_RELEASE_NOTES.md` - This file (updated)

---

## Next Session Priorities

When you return to develop further:

1. **Points balance display** - Show total points on kid dashboard
2. **Points history** - Let kids see their transaction history
3. **Shop system** - Create shop interface for spending points
4. **Notifications** - Alert parents when submissions are pending

The core loop is now complete and functional!

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

# Task instance generation
python -m app.utils.task_generator bootstrap  # First-time setup

# API testing
# Visit http://localhost:8000/docs
```

---

## APScheduler Jobs

**Daily Task Generation:**
- Runs at midnight (00:00)
- Generates task instances for Day +7
- Maintains 7-day rolling window
- Job ID: `daily_task_generation`

**Expiration Checker:**
- Runs every 10 minutes
- Safety net for lazy expiration
- Locks expired incomplete tasks only
- Job ID: `expiration_check`

---

## Database Schema (All Tables Active)

**users** - Parent and kid accounts
- Bcrypt password hashing
- Role-based access (parent/kid)

**tasks** - Task templates
- Recurring or custom
- Recurrence patterns with specific days
- Photo requirements and criteria
- Assignment (specific kid or all kids)

**task_instances** - Individual task occurrences
- Generated by scheduler or parent
- Time windows (available_start, available_end)
- Status lifecycle (incomplete → pending → approved/rejected/locked)
- Photo submissions
- Review tracking

**points_transactions** - Ledger-based points
- Transaction types (task_completion, shop_purchase, bonus, adjustment)
- Reference IDs for traceability
- Full audit trail

**task_history** - Status change audit
- Tracks all instance status changes
- Records who made changes and when
- Stores notes/reasons

---

**Ready for Alpha Testing! 🚀**

This is a clean, Pythonic, well-documented Alpha release with a complete core workflow. Kids can complete tasks, parents can review, and points are awarded - the fundamental chore tracker loop is operational.
