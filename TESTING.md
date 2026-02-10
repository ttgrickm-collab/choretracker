# Testing Guide - Chore Tracker with Custom Time Windows

This guide walks you through testing the complete task system including the new time window customization features.

## Prerequisites

1. Backend and frontend running
2. At least one parent user (default: username `parent`, password `password123`)
3. At least one kid user created

## Step 1: Create Kid User

```bash
cd backend
source venv/bin/activate
python -m app.utils.user create kid1 test123 kid "Test Kid"
```

Output should show:
```
✓ Created user 'kid1' with ID 2
```

## Step 2: Create Tasks with Custom Time Windows (Parent)

1. Login as parent: http://localhost:5173/login
   - Username: `parent`
   - Password: `password123`

2. Click "Create Task" button

### Test Case A: Recurring Daily Task with Default Times

3. Create a recurring task:
   - **Task Name:** "Make Your Bed"
   - **Description:** "Make your bed neatly every morning"
   - **Points:** 10
   - **Photo Required:** ✓ (checked)
   - **Photo Criteria:** "Bed must be made with sheets pulled tight, pillows arranged neatly, no wrinkles visible."
   - **Recurring Task:** ✓ (checked)
   - **Recurrence Pattern:** Daily
   - **Start Time:** 360 (6:00 AM - default)
   - **Duration:** 2340 (39 hours - default)
   - **Assign To:** Select kid1

4. Verify live preview shows correct times (e.g., "Feb 10, 6:00 AM → Feb 11, 9:00 PM")

5. Click "Create Task"

### Test Case B: Recurring Weekly Task with Custom Times

6. Click "Create Task" again

7. Create another recurring task:
   - **Task Name:** "Take Out Trash"
   - **Points:** 15
   - **Recurring Task:** ✓ (checked)
   - **Recurrence Pattern:** Weekly
   - **Select Days:** Check Monday, Wednesday, Friday
   - **Start Time:** 1020 (5:00 PM = 17:00 = 1020 minutes)
   - **Duration:** 180 (3 hours)
   - **Assign To:** Select kid1

8. Verify live preview updates as you change offset/duration

9. Click "Create Task"

### Test Case C: Custom One-Time Task

10. Click "Create Task" again

11. Create a custom task:
    - **Task Name:** "Clean Garage"
    - **Points:** 50
    - **Recurring Task:** ✗ (unchecked)
    - **Available Start:** Pick tomorrow at 10:00 AM
    - **Available End:** Pick tomorrow at 6:00 PM
    - **Assign To:** Select kid1

12. Click "Create Task"

13. **Important:** Custom tasks create instances immediately - no need to bootstrap!

## Step 3: Bootstrap Recurring Task Instances

```bash
cd backend
python -m app.utils.task_generator bootstrap
```

Output should show:
```
🚀 Bootstrapping initial 7-day task window...
  Day +0: Created X instances
  Day +1: Created X instances
  ...
  Day +6: Created X instances
✓ Bootstrap complete! Created XX total instances
```

**Note:** This only creates instances for recurring tasks. Custom tasks already have instances.

## Step 4: Verify Generated Time Windows

```bash
sqlite3 database/chore.db

-- Check "Make Your Bed" instances (should start at 6am)
SELECT 
  title,
  available_start,
  available_end
FROM task_instances ti
JOIN tasks t ON ti.task_id = t.id
WHERE t.title = 'Make Your Bed'
ORDER BY available_start
LIMIT 3;

-- Check "Take Out Trash" instances (should start at 5pm, only Mon/Wed/Fri)
SELECT 
  title,
  available_start,
  available_end,
  strftime('%w', available_start) as day_of_week
FROM task_instances ti
JOIN tasks t ON ti.task_id = t.id
WHERE t.title = 'Take Out Trash'
ORDER BY available_start
LIMIT 5;

-- Check "Clean Garage" custom instance (should match your chosen times)
SELECT 
  title,
  available_start,
  available_end
FROM task_instances ti
JOIN tasks t ON ti.task_id = t.id
WHERE t.title = 'Clean Garage';

.quit
```

Verify:
- "Make Your Bed" starts at 06:00 each day
- "Take Out Trash" starts at 17:00 only on Mon(1), Wed(3), Fri(5)
- "Clean Garage" has your custom start/end times

## Step 5: Test Kid Dashboard

1. Logout from parent account

2. Login as kid: http://localhost:5173/login
   - Username: `kid1`
   - Password: `test123`

3. You should see the Kid Dashboard with:
   - Tasks grouped by day (Today, Tomorrow, etc.)
   - Custom "Clean Garage" task (if scheduled for visible dates)
   - Each task showing points value, due time, status
   - "Submit" button for incomplete tasks

4. Verify time windows are displayed correctly

## Step 6: Submit a Task

1. Click "Submit" on the "Make Your Bed" task

2. Modal should open showing:
   - Task title
   - Photo requirements
   - File upload input

3. Upload a test photo (any image)

4. Click "Submit Task"

5. Task should now show "⏳ Waiting for review" status

## Step 7: Test Approval Workflow

1. Logout from kid account

2. Login as parent

3. Click "Review Submissions" in navbar

4. You should see:
   - Pending submission from kid
   - Task details and points
   - "View Photo" button

5. Click "View Photo" to see the modal

6. Click "✓ Approve" button

7. Verify points were awarded:
   ```bash
   sqlite3 database/chore.db "SELECT * FROM points_transactions;"
   ```

8. Verify photo was deleted:
   ```bash
   ls backend/uploads/task-photos/
   ```

## Step 8: Test Custom Task Expiration

Since custom tasks have specific date/time windows:

1. Login as kid

2. If "Clean Garage" is past its `available_end` time, it should show as "Expired"

3. If still within window, kid can submit it normally

## Step 9: Test Time Window Edge Cases

### Test A: Submit Just Before Expiration

1. Find a task that expires soon (check available_end in database)

2. Submit photo just before expiration

3. Parent can still review after expiration

### Test B: Try to Submit After Expiration

1. Find an expired task (past available_end)

2. Task should show as "Expired" or "Locked"

3. Submit button should be disabled

### Test C: Rejection Within vs After Deadline

**Within deadline:**
1. Submit a task
2. Parent rejects it before available_end
3. Task returns to "To Do" status
4. Kid can resubmit

**After deadline:**
1. Manually set a pending task's available_end to the past:
   ```sql
   UPDATE task_instances 
   SET available_end = '2026-02-08T21:00:00Z' 
   WHERE id = X AND status = 'pending';
   ```
2. Parent rejects it
3. Task goes to "Rejected" status (permanent)
4. Kid cannot resubmit

## Step 10: Test Weekly Recurrence

1. Wait for Monday, Wednesday, or Friday

2. Verify "Take Out Trash" appears only on those days

3. Check database to confirm no instances on Tue/Thu/Sat/Sun:
   ```bash
   sqlite3 database/chore.db
   SELECT 
     strftime('%w', available_start) as day,
     COUNT(*) as count
   FROM task_instances ti
   JOIN tasks t ON ti.task_id = t.id
   WHERE t.title = 'Take Out Trash'
   GROUP BY day;
   ```

Should show counts only for 1 (Mon), 3 (Wed), 5 (Fri).

## Step 11: Test Daily Generation at Midnight

**Option A: Wait for midnight**
- Check backend logs at midnight for:
  ```
  [2026-02-XX 00:00:00] Running daily task generation (Day +7)...
  ✓ Generated X task instances for Day +7
  ```

**Option B: Manual trigger**
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

Verify new instances use the task's custom offset/duration settings.

## Step 12: Test UI Time Preview Accuracy

1. Login as parent

2. Click "Create Task"

3. Set **Recurring Task** checked

4. Set **Start Time:** 540 (9:00 AM)

5. Set **Duration:** 600 (10 hours)

6. Verify live preview shows "9:00 AM → 7:00 PM" (same day)

7. Try different values and verify preview updates correctly

8. Uncheck **Recurring Task**

9. Verify datetime pickers appear with defaults (6am today, 9pm tomorrow)

## Common Issues

### No tasks showing for kid
- Run bootstrap: `python -m app.utils.task_generator bootstrap`
- Verify tasks exist: `sqlite3 database/chore.db "SELECT * FROM tasks;"`
- Verify kid user exists: `SELECT * FROM users WHERE role='kid';`
- Check assigned_to field (NULL means all kids)

### Bootstrap creates 0 instances
- Create recurring tasks first (custom tasks don't need bootstrap)
- Ensure tasks are active (`active = 1`)
- Ensure task_type = 'recurring'

### Time windows seem wrong
- Check task's `available_start_offset` and `duration` in database
- Verify timezone (all times stored as UTC in database)
- Frontend displays in local timezone

### Custom task not appearing
- Custom tasks create instances immediately on creation
- Check task_instances table for task_id match
- Verify assigned_to matches kid's ID

## Database Inspection Commands

```bash
cd backend
sqlite3 database/chore.db

# View task templates with time settings
SELECT id, title, task_type, available_start_offset, duration 
FROM tasks 
WHERE active = 1;

# View task instances with time windows
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

# Exit
.quit
```

## Success Criteria

✅ Recurring tasks create instances with custom offset/duration
✅ Custom tasks create instances immediately with specific datetimes
✅ Live preview shows accurate start/end times
✅ Weekly tasks only appear on selected days
✅ Kid dashboard shows correct time windows
✅ Expiration logic works for custom time windows
✅ Daily midnight job uses task's custom settings
✅ Bootstrap respects custom time settings
✅ UI is intuitive and visually appealing

## Next Steps

After confirming everything works:

1. Test on different timezones
2. Create more complex weekly patterns
3. Test edge cases (midnight tasks, very short durations)
4. Monitor scheduler over 24+ hours
5. Test on actual Raspberry Pi hardware
