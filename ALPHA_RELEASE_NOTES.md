# Chore Tracker - Alpha Release Notes

**Current Version:** v0.2.2-alpha
**Release Date:** February 10, 2026
**Status:** Alpha - Customizable Time Windows Added

---

## What's New in v0.2.2

### ✨ Time Window Customization

**Recurring Tasks:**
- Parents can now customize when tasks become available each day
- `available_start_offset`: Minutes from midnight (default: 360 = 6am)
- `duration`: How long task remains available (default: 2340 = 39 hours)
- Live preview shows actual start/end times as parent adjusts values
- Task generator uses these settings when creating instances

**Custom Tasks:**
- Full datetime pickers for exact start/end times
- Defaults: 6am today → 9pm tomorrow
- Instances created immediately upon task creation
- No more hardcoded time windows!

**Database Changes:**
- Added `available_start_offset` column to tasks table
- Added `duration` column to tasks table
- Migration script provided for existing installations

### 🎨 Improved Create Task UI

**Visual Enhancements:**
- Card-based sections with gradient headers
- Better spacing and visual hierarchy
- Styled file upload (no default browser input)
- Live preview badges for time windows
- Larger, cleaner inputs with better focus states
- Gradient submit button with loading spinner
- Responsive grid layouts
- Hover effects on interactive elements

**UX Improvements:**
- Checkbox multi-select for kid assignment (replaces dropdown)
- Helper text throughout
- Error alerts with better styling
- Progressive disclosure (only show relevant fields)
- Icon preview with larger thumbnail

---

## What's Included in v0.2.2

### ✅ Working Features

**Authentication & User Management:**
- JWT-based authentication system
- User class with Pythonic `@password.setter` decorator
- Command-line user management tools
- Login page with auth context
- Protected routes

**Task Management (Parent Side):**
- Create tasks (recurring or custom) with improved UI
- Set recurrence patterns (daily, specific days)
- **NEW:** Customize time windows (offset + duration for recurring, datetime for custom)
- Upload custom task icons with preview
- Define photo requirements and acceptance criteria
- Multi-select kid assignment via checkboxes
- View all created tasks in dashboard
- Full CRUD operations via API

**Task Instance System:**
- Automated task generation via APScheduler
- Daily midnight job generates Day +7 (7-day rolling window)
- **NEW:** Uses task's custom `available_start_offset` and `duration` fields
- Bootstrap command for initial setup: `python -m app.utils.task_generator bootstrap`
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

**Parent Review Workflow:**
- Review pending submissions page
- Full-size photo viewer with criteria reminder
- Approve submissions (awards points, deletes photo)
- Reject submissions with reason
- Smart rejection logic:
  - If within deadline → status: incomplete (kid can resubmit, photo deleted)
  - If past deadline → status: rejected (task failed, photo kept)
- Delete task instances endpoint

**Points System:**
- Ledger-based transactions (not simple counter)
- Points awarded on approval
- Full transaction history in database
- Ready for balance display and shop system

**Technical Foundation:**
- Complete database schema (5 tables, all active)
- SQLite with proper foreign keys
- Pydantic v2 validation with new time window fields
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

## Migration from v0.2.1

If you have an existing installation:

```bash
# Run the migration script to add new columns
python migrate_add_time_fields.py

# Restart the backend
cd backend
python run.py
```

This adds `available_start_offset` and `duration` columns with proper defaults (360 and 2340 respectively) to maintain existing behavior.

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
- Uses task's `available_start_offset` and `duration` fields
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
- **NEW:** `available_start_offset` (INTEGER, default 360)
- **NEW:** `duration` (INTEGER, default 2340)
- Recurring or custom
- Recurrence patterns with specific days
- Photo requirements and criteria
- Assignment (specific kid or all kids)

**task_instances** - Individual task occurrences
- Generated by scheduler (recurring) or immediately (custom)
- Time windows calculated from task's offset/duration (recurring) or parent-specified (custom)
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

## Changes from v0.2.1 to v0.2.2

**New Features:**
- Customizable time windows for recurring tasks
- Full datetime pickers for custom tasks
- Live preview of task availability times
- Improved Create Task UI with card-based sections
- Checkbox multi-select for kid assignment

**Database:**
- Added `available_start_offset` column to tasks table
- Added `duration` column to tasks table

**Modified Files:**
- `backend/app/database.py` - Updated schema
- `backend/app/models/task.py` - Added time window fields
- `backend/app/routes/tasks.py` - Handle custom datetimes
- `backend/app/utils/task_generator.py` - Use task's offset/duration
- `frontend/src/pages/CreateTask.jsx` - Complete redesign with better UX

**New Files:**
- `migrate_add_time_fields.py` - Migration script for existing installations

---

**Ready for Alpha Testing! 🚀**

This release adds flexibility for parents to control when tasks are available while maintaining the core workflow. The improved UI makes task creation more intuitive and visually appealing.
