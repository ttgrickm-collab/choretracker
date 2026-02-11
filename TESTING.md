# Testing Guide

Quick reference for manually testing Launch Pad features.

---

## Prerequisites

- [ ] Backend running (`python run.py` on localhost:8000)
- [ ] Frontend running (`npm run dev` on localhost:5173)
- [ ] Default parent user exists (username: `parent`, password: `password123`)

---

## Quick Smoke Test

```bash
# 1. Create kid user
cd backend
python -m app.utils.user create kid1 test123 kid "Alice"

# 2. Bootstrap tasks
python -m app.utils.task_generator bootstrap
```

**Then in browser:**
- [ ] Login as parent → Create a task
- [ ] Logout → Login as kid1 → See task
- [ ] Submit task with photo
- [ ] Logout → Login as parent → Approve submission
- [ ] Verify kid can collect fuel

**Expected:** Full workflow works end-to-end

---

## Feature Tests

### Login Page

**Visual Check:**
- [ ] Navigate to login page
- [ ] Dark space gradient background loads (gray-900 → purple-900)
- [ ] Animated starfield visible and smooth
- [ ] Floating rocket emoji 🚀 animation
- [ ] "LAUNCH PAD" text has glow effect
- [ ] Form card has purple glow border
- [ ] Input fields have cyan focus rings
- [ ] "🚀 Prepare for Launch" button displays

**Functionality:**
- [ ] Enter username: `parent`
- [ ] Enter password: `password123`
- [ ] Click "Prepare for Launch"
- [ ] Loading state shows: spinner + "Accessing Systems..."
- [ ] Redirects to dashboard on success
- [ ] Test wrong password → error message displays with space theme styling

**Custom Fuel Icon:**
- [ ] After login as parent, check Dashboard page
- [ ] Green glowing fuel droplet icon shows (not "CUSTOM_FUEL" text)
- [ ] Login as kid, check Mission Control page
- [ ] Fuel icon renders in rewards boxes
- [ ] Fuel icon renders in submission modal

### Task Creation (Parent)

**Recurring Task with Default Times:**
- [ ] Login as parent
- [ ] Create Task → "Make Your Bed"
- [ ] Points: 10, Photo required: ✓
- [ ] Recurring: ✓, Pattern: Daily
- [ ] Start Time: 360 (6am), Duration: 2340 (39hrs) - defaults
- [ ] Verify live preview: "6:00 AM → 9:00 PM next day"
- [ ] Assign to: kid1
- [ ] Create Task

**Recurring Task with Custom Times:**
- [ ] Create Task → "Take Out Trash"
- [ ] Points: 15, Recurring: ✓
- [ ] Pattern: Weekly → Check Mon, Wed, Fri
- [ ] Start Time: 1020 (5pm), Duration: 180 (3hrs)
- [ ] Verify preview updates correctly
- [ ] Create Task

**Custom One-Time Task:**
- [ ] Create Task → "Clean Garage"
- [ ] Points: 50, Recurring: ✗
- [ ] Available Start: Tomorrow 10am
- [ ] Available End: Tomorrow 6pm
- [ ] Create Task (instance created immediately, no bootstrap needed)

### Task Instance Verification

```bash
cd backend
sqlite3 database/chore.db

-- Check "Make Your Bed" starts at 6am daily
SELECT title, available_start, available_end
FROM task_instances ti
JOIN tasks t ON ti.task_id = t.id
WHERE t.title = 'Make Your Bed'
LIMIT 3;

-- Check "Take Out Trash" only Mon/Wed/Fri at 5pm
SELECT title, available_start, strftime('%w', available_start) as day
FROM task_instances ti
JOIN tasks t ON ti.task_id = t.id
WHERE t.title = 'Take Out Trash'
LIMIT 5;

-- Check "Clean Garage" matches custom times
SELECT title, available_start, available_end
FROM task_instances ti
JOIN tasks t ON ti.task_id = t.id
WHERE t.title = 'Clean Garage';

.quit
```

**Expected:**
- [ ] Make Your Bed: 06:00 daily
- [ ] Take Out Trash: 17:00 only on days 1, 3, 5 (Mon/Wed/Fri)
- [ ] Clean Garage: Your exact start/end times

### Layout & Navbar (Role-Based Theme)

**Kid Login:**
- [ ] Login as kid1
- [ ] Dark space background loads (gray-900/800 gradient)
- [ ] Purple gradient navbar with 🚀 logo
- [ ] "LAUNCH PAD" text has glow effect
- [ ] "Mission Control" subtitle visible in cyan
- [ ] User name shows with astronaut icon
- [ ] No white backgrounds bleeding through
- [ ] Mission Control hero header flows seamlessly

**Parent Login:**
- [ ] Login as parent
- [ ] Light gray-50 background loads
- [ ] White navbar with clean professional styling
- [ ] 🚀 logo visible (smaller, cleaner)
- [ ] Navigation links visible: Dashboard, Review Submissions
- [ ] User badge shows "Admin" tag
- [ ] Professional appearance throughout

**Theme Switching:**
- [ ] Logout from kid → Login as parent (switches to light theme)
- [ ] Logout from parent → Login as kid (switches to dark theme)
- [ ] No console errors during theme switches
- [ ] No visual glitches or flashing

### Kid Dashboard

- [ ] Logout → Login as kid1
- [ ] See tasks grouped by day (Today, Tomorrow, etc.)
- [ ] Each task shows points, time window, status
- [ ] "Submit" button available on incomplete tasks

### Photo Submission

- [ ] Click "Submit" on any task
- [ ] Modal shows task title, photo requirements
- [ ] Upload test image (any .jpg or .png)
- [ ] Click "Submit Task"
- [ ] Task status changes to "Data Transmitting..." (pending)

### Parent Review & Approval

- [ ] Logout → Login as parent
- [ ] Click "Review Submissions"
- [ ] See pending submission with kid name, task, points
- [ ] Click "View Photo" → Modal opens with full-size image
- [ ] Click "✓ Approve"

**Verify points awarded:**
```bash
sqlite3 database/chore.db "SELECT * FROM points_transactions;"
```

**Verify photo deleted:**
```bash
ls backend/uploads/task-photos/
# Should be empty or not contain the approved photo
```

### Rejection Workflow

**Reject Before Deadline:**
- [ ] Kid submits task (still within available_end window)
- [ ] Parent rejects with reason: "Bed not made properly"
- [ ] Task returns to "Awaiting Data" status
- [ ] Kid can resubmit with new photo

**Reject After Deadline:**
```bash
# Manually expire a pending task
sqlite3 database/chore.db
UPDATE task_instances 
SET available_end = '2026-02-08T21:00:00Z' 
WHERE id = <instance_id> AND status = 'pending';
.quit
```
- [ ] Parent rejects expired pending task
- [ ] Task goes to "Transmission Failure" (permanent rejection)
- [ ] Kid cannot resubmit (task locked)

### Task Expiration

- [ ] Find task past available_end (or manually expire one)
- [ ] Login as kid
- [ ] Expired task shows as "Mission Expired" or disabled
- [ ] Submit button disabled/hidden

**Parent can still approve/reject pending submissions after expiration**

### Weekly Recurrence

- [ ] Wait for Monday, Wednesday, or Friday (or check database)
- [ ] Verify "Take Out Trash" only appears on those days

```bash
sqlite3 database/chore.db
SELECT 
  strftime('%w', available_start) as day,
  COUNT(*) as count
FROM task_instances ti
JOIN tasks t ON ti.task_id = t.id
WHERE t.title = 'Take Out Trash'
GROUP BY day;
# Should show counts only for 1 (Mon), 3 (Wed), 5 (Fri)
.quit
```

### Daily Midnight Generation

**Option A - Wait for midnight:**
- [ ] Check backend logs at 00:00 for:
  ```
  [timestamp] Running daily task generation (Day +7)...
  ✓ Generated X task instances for Day +7
  ```

**Option B - Manual trigger:**
```bash
cd backend
python -c "
import asyncio
from app.database import get_db
from app.utils.task_generator import generate_tasks_for_day

async def test():
    async with get_db() as db:
        count = await generate_tasks_for_day(db, days_ahead=7)
    print(f'Generated {count} instances for Day +7')

asyncio.run(test())
"
```

**Expected:** New instances use task's custom offset/duration settings

### Time Preview Accuracy

- [ ] Create Task → Recurring: ✓
- [ ] Start Time: 540 (9am)
- [ ] Duration: 600 (10hrs)
- [ ] Verify preview: "9:00 AM → 7:00 PM" (same day)
- [ ] Try different values → Preview updates correctly
- [ ] Uncheck Recurring → Datetime pickers appear with defaults

---

## Common Issues

**No tasks showing for kid:**
```bash
# Run bootstrap
python -m app.utils.task_generator bootstrap

# Verify tasks exist
sqlite3 database/chore.db "SELECT * FROM tasks;"

# Verify kid exists
sqlite3 database/chore.db "SELECT * FROM users WHERE role='kid';"
```

**Bootstrap creates 0 instances:**
- Create recurring tasks first (custom tasks don't need bootstrap)
- Check tasks are active: `SELECT active FROM tasks;` (should be 1)
- Check task_type: `SELECT task_type FROM tasks;` (should be 'recurring')

**Time windows seem wrong:**
- All times stored as UTC in database
- Frontend displays in local timezone
- Check task's `available_start_offset` and `duration` fields

**Custom task not appearing:**
- Custom tasks create instances immediately on creation
- Check: `SELECT * FROM task_instances WHERE task_id = <custom_task_id>;`
- Verify assigned_to matches kid's user ID

---

## Database Inspection

```bash
cd backend
sqlite3 database/chore.db

# View task templates with time settings
SELECT id, title, task_type, available_start_offset, duration 
FROM tasks WHERE active = 1;

# View instances with time windows
SELECT 
  ti.id,
  t.title,
  ti.status,
  ti.available_start,
  ti.available_end,
  ti.assigned_to
FROM task_instances ti
JOIN tasks t ON ti.task_id = t.id
ORDER BY ti.available_start;

# View points transactions
SELECT * FROM points_transactions;

# View task history (audit trail)
SELECT * FROM task_history ORDER BY changed_at DESC LIMIT 10;

.quit
```

---

## Success Criteria

- [x] Recurring tasks generate with custom offset/duration
- [x] Custom tasks create instances immediately
- [x] Live preview shows accurate times
- [x] Weekly tasks only appear on selected days
- [x] Kid dashboard displays correct time windows
- [x] Expiration logic works (no submission after available_end)
- [x] Daily midnight job uses task's custom settings
- [x] Bootstrap respects custom time settings
- [x] Photos deleted after approval/resubmission
- [x] Points ledger tracks all transactions
- [x] Rejection logic differs before/after deadline

---

## API Testing (Swagger)

Visit `http://localhost:8000/docs` for interactive API testing

**Key endpoints:**
- `POST /api/auth/login` - Get JWT token
- `GET /api/tasks` - List tasks (parent)
- `POST /api/tasks` - Create task (parent)
- `GET /api/task-instances/kid` - Kid's tasks
- `POST /api/task-instances/{id}/submit` - Submit with photo
- `GET /api/task-instances/pending` - Pending reviews (parent)
- `POST /api/task-instances/{id}/approve` - Approve submission
- `POST /api/task-instances/{id}/reject` - Reject submission

**Auth:** Click "Authorize" button, paste JWT token from login response

---

## Development Commands

```bash
# Backend
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python run.py

# Frontend  
cd frontend
npm run dev

# User management
python -m app.utils.user create <username> <password> <role> <display_name>
python -m app.utils.user setpass <username> <new_password>

# Task generation
python -m app.utils.task_generator bootstrap
```

---

## Next Steps After Testing

- [ ] Test on different timezones (change system time)
- [ ] Create complex weekly patterns (multiple tasks, different days)
- [ ] Monitor scheduler over 24+ hours
- [ ] Test on actual Raspberry Pi hardware
- [ ] Load test with multiple kids (5-10 users)
- [ ] Test edge cases (midnight tasks, very short durations, cross-day windows)
