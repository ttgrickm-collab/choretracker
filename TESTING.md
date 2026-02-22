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
- [ ] Login as parent → Create an objective
- [ ] Logout → Login as kid1 → See objective
- [ ] Submit objective with photo
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
- [ ] Enter username: `parent`, password: `password123`
- [ ] Click "Prepare for Launch"
- [ ] Loading state shows: spinner + "Accessing Systems..."
- [ ] Redirects to dashboard on success
- [ ] Test wrong password → error message displays

**Custom Fuel Icon:**
- [ ] After login as parent, check Dashboard page — green glowing fuel droplet shows (not "CUSTOM_FUEL" text)
- [ ] Login as kid — fuel icon renders in rewards boxes and submission modal

### Task Creation (Parent)

**Recurring Task with Default Times:**
- [ ] Login as parent → Create Objective → "Make Your Bed"
- [ ] Fuel Value: 10, Photo required: ✓
- [ ] Recurring: ✓, Pattern: Daily
- [ ] Start Time: 360 (6am), Duration: 2340 (39hrs) — defaults
- [ ] Verify live preview: "6:00 AM → 9:00 PM next day"
- [ ] Assign to: kid1
- [ ] Create Objective

**Recurring Task with Custom Times:**
- [ ] Create Objective → "Take Out Trash"
- [ ] Fuel Value: 15, Recurring: ✓
- [ ] Pattern: Weekly → Check Mon, Wed, Fri
- [ ] Start Time: 1020 (5pm), Duration: 180 (3hrs)
- [ ] Verify preview updates correctly

**Custom One-Time Objective:**
- [ ] Create Objective → "Clean Garage"
- [ ] Fuel Value: 50, Recurring: ✗
- [ ] Available Start: Tomorrow 10am, Available End: Tomorrow 6pm
- [ ] Create Objective (instance created immediately)

**Verify all strings are themed — no hardcoded text visible:**
- [ ] Page title shows "Create New Objective" (not "Create New Task")
- [ ] Points field label shows "Fuel Value"
- [ ] Section headers: "Basic Information", "Photo Requirements", "Schedule & Recurrence", "Assign To"
- [ ] Submit button shows "Create Objective"

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

.quit
```

**Expected:**
- [ ] Make Your Bed: 06:00 daily
- [ ] Take Out Trash: 17:00 only on days 1, 3, 5 (Mon/Wed/Fri)

### Layout & Navbar (Role-Based Theme)

**Kid Login:**
- [ ] Dark space background loads (gray-900/800 gradient)
- [ ] Purple gradient navbar with 🚀 logo
- [ ] "LAUNCH PAD" text has glow effect
- [ ] User name shows with astronaut icon

**Parent Login:**
- [ ] Light gray-50 background loads
- [ ] White navbar with clean professional styling
- [ ] Navigation links: Dashboard, Review Submissions
- [ ] User badge shows "Admin" tag

**Theme Switching:**
- [ ] Logout from kid → Login as parent → light theme loads cleanly
- [ ] Logout from parent → Login as kid → dark theme loads cleanly
- [ ] No console errors, no visual glitches

### Kid Dashboard

- [ ] Login as kid1
- [ ] Tasks grouped by day (Today, Tomorrow, etc.)
- [ ] Fuel balance displayed in header
- [ ] Each task shows fuel value, time window, status badge
- [ ] "Transmit Data" button available on incomplete tasks

### Photo Submission

- [ ] Click "Transmit Data" on any task
- [ ] Modal shows task title, photo requirements
- [ ] Upload test image (any .jpg or .png)
- [ ] Click submit button
- [ ] Task status changes to "Data Transmitting..."

### Parent Review & Approval

- [ ] Logout → Login as parent → Click "Review Submissions"
- [ ] See pending submission card: kid name, task title, fuel value, submission time
- [ ] Photo criteria visible on card (if set)

**Inline photo expand:**
- [ ] Click "View Photo" button — photo expands inline below criteria (no modal)
- [ ] Chevron rotates to indicate expanded state
- [ ] Click again — photo collapses
- [ ] Photo visible while approve/reject buttons remain accessible below

**Approve flow:**
- [ ] Click "Approve" → inline confirm prompt appears: "Approve 'Task Name' for ⛽ X?"
- [ ] Click "Confirm" → card disappears, submission list refreshes
- [ ] Click "Cancel" → returns to normal state

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
- [ ] Click "Reject" → inline text input appears for reason
- [ ] Type "Bed not made properly" → click Confirm
- [ ] Task returns to "Awaiting Data" status for kid
- [ ] Kid can resubmit with new photo

**Reject After Deadline:**
```bash
sqlite3 database/chore.db
UPDATE task_instances 
SET available_end = '2026-02-08T21:00:00Z' 
WHERE id = <instance_id> AND status = 'pending';
.quit
```
- [ ] Parent rejects expired pending task
- [ ] Task goes to "Transmission Failure" (permanent rejection)
- [ ] Kid cannot resubmit

### Task Editing (Parent Dashboard)

- [ ] Login as parent → Dashboard
- [ ] Each objective row shows: title, description, fuel value, type badge, photo badge, ✏️ Edit button

**Inline edit expand:**
- [ ] Click "Edit" — row expands below the summary
- [ ] Summary row stays visible, muted (opacity reduced)
- [ ] Edit button label changes to "Editing…"
- [ ] Three sectioned cards appear: Basic Information, Photo Requirements, Schedule (if recurring)
- [ ] Edit title → click Save Changes → row collapses, list refreshes with updated data
- [ ] Click Cancel → row collapses with no changes

**Deactivate flow:**
- [ ] With edit expanded, click "🗑️ Deactivate" (left side, red text)
- [ ] Inline confirmation appears: "Deactivate this objective?" with Confirm / Cancel
- [ ] Confirm → task disappears from list
- [ ] Cancel → returns to edit state

**Custom (one-time) task edit:**
- [ ] Edit a custom task — Schedule section does NOT appear (read-only dates)
- [ ] Other sections (Basic Info, Photo) still editable

### Task Expiration

- [ ] Find task past available_end (or manually expire one)
- [ ] Login as kid → expired task shows as "Mission Expired" or disabled
- [ ] Submit button disabled/hidden

**Parent can still reject expired pending tasks:**
- [ ] Manually expire a pending task (see SQL above)
- [ ] Parent rejects → task goes to permanent failure state

### Custom Fuel Icon

- [ ] Login as parent → Dashboard → fuel icon is green glowing droplet (not emoji or text)
- [ ] Login as kid → fuel icon visible in header balance and task cards
- [ ] No "CUSTOM_FUEL" text visible anywhere

---

## Verification Checklist

- [x] Task instances generated for correct days/times
- [x] Daily midnight job uses task's custom settings
- [x] Bootstrap respects custom time settings
- [x] Photos deleted after approval/resubmission
- [x] Points ledger tracks all transactions
- [x] Rejection logic differs before/after deadline
- [x] Inline edit saves correctly and collapses on success
- [x] Inline edit Cancel collapses without API call
- [x] Deactivate removes task from dashboard list
- [x] Photo expand/collapse toggles correctly
- [x] No duplicate approve/reject UI (card only, no modal)

---

## API Testing (Swagger)

Visit `http://localhost:8000/docs` for interactive API testing

**Key endpoints:**
- `POST /api/auth/login` — Get JWT token
- `GET /api/tasks` — List tasks (parent)
- `POST /api/tasks` — Create task (parent)
- `PUT /api/tasks/{id}` — Update task (parent)
- `GET /api/task-instances/my-tasks` — Kid's tasks
- `POST /api/task-instances/{id}/submit` — Submit with photo
- `GET /api/task-instances/pending` — Pending reviews (parent)
- `POST /api/task-instances/{id}/approve` — Approve submission
- `POST /api/task-instances/{id}/reject` — Reject submission

**Auth:** Click "Authorize", paste JWT token from login response

---

## Development Commands

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

# Task generation
python -m app.utils.task_generator bootstrap
```

---

## Next Steps After Testing

- [ ] Test on different timezones
- [ ] Create complex weekly patterns (multiple tasks, different days)
- [ ] Monitor scheduler over 24+ hours
- [ ] Test on actual Raspberry Pi hardware
- [ ] Test edge cases (midnight tasks, very short durations, cross-day windows)
