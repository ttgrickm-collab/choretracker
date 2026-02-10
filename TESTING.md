# Testing Guide - Task Instance System

This guide walks you through testing the new task instance features.

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

## Step 2: Bootstrap Initial Task Instances

```bash
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

**Note:** If no tasks exist yet, this will create 0 instances. Create some tasks first (Step 3), then run bootstrap again.

## Step 3: Create Tasks (Parent)

1. Login as parent: http://localhost:5173/login
   - Username: `parent`
   - Password: `password123`

2. Click "Create Task" button

3. Create a recurring task:
   - Title: "Make Your Bed"
   - Description: "Make your bed neatly every morning"
   - Points: 10
   - Task Type: Recurring
   - Recurrence Pattern: Daily
   - Photo Required: ✓ (checked)
   - Photo Criteria: "Bed must be made with sheets pulled tight, pillows arranged neatly, no wrinkles visible."

4. Click "Create Task"

5. Run bootstrap again to generate instances:
   ```bash
   python -m app.utils.task_generator bootstrap
   ```

## Step 4: Test Kid Dashboard

1. Logout from parent account

2. Login as kid: http://localhost:5173/login
   - Username: `kid1`
   - Password: `test123`

3. You should see the Kid Dashboard with:
   - Tasks grouped by day (Today, Tomorrow, etc.)
   - Each task showing points value, due time, status
   - "Submit" button for incomplete tasks
   - "Waiting for review" indicator for pending tasks

## Step 5: Submit a Task

1. Click "Submit" on any task

2. Modal should open showing:
   - Task title
   - Photo requirements (if set)
   - File upload input

3. Upload a test photo (any image)

4. Click "Submit Task"

5. Task should now show "⏳ Waiting for review" status

## Step 6: Review as Parent

1. Logout from kid account

2. Login as parent

3. Click "Review Submissions" in navbar

4. You should see:
   - Pending submission from kid
   - Task details and points
   - "View Photo" button
   - "Approve" and "Reject" buttons

5. Click "View Photo" to see the modal with:
   - Full-size photo
   - Photo criteria reminder
   - Approve/Reject buttons

## Step 7: Test Approval

1. Click "✓ Approve" button

2. Confirmation should appear

3. Task should disappear from pending list

4. Verify points were awarded:
   ```bash
   # In backend directory
   sqlite3 database/chore.db "SELECT * FROM points_transactions;"
   ```

   Should show:
   ```
   1|2|10|task_completion|1|Completed: Make Your Bed|2026-02-09 ...
   ```

5. Verify photo was deleted:
   ```bash
   ls backend/uploads/task-photos/
   ```

   Should be empty or not contain the submitted photo.

## Step 8: Test Rejection (Within Deadline)

1. Login as kid and submit another task

2. Login as parent → "Review Submissions"

3. Click "✗ Reject"

4. Enter rejection reason: "Bed not made properly - wrinkles visible"

5. Click "Confirm Rejection"

6. Login as kid - task should be back in "To Do" status with rejection reason displayed

7. Kid can resubmit with a new photo

## Step 9: Test Rejection (After Deadline)

This is tricky to test without waiting. You can manually update the database:

```bash
sqlite3 database/chore.db
```

```sql
-- Find a pending task instance
SELECT id, available_end FROM task_instances WHERE status = 'pending' LIMIT 1;

-- Update its available_end to the past
UPDATE task_instances SET available_end = '2026-02-08T21:00:00Z' WHERE id = <instance_id>;

-- Exit
.quit
```

Now reject this task as parent - it should go to "rejected" status instead of "incomplete".

## Step 10: Test Expiration

1. Find an incomplete task instance and update its `available_end` to the past:

```sql
UPDATE task_instances 
SET available_end = '2026-02-08T21:00:00Z' 
WHERE id = <instance_id> AND status = 'incomplete';
```

2. Refresh kid dashboard

3. Task should automatically lock and not appear (or show as expired)

## Step 11: Test Daily Generation

To test the daily midnight job:

**Option A: Manual trigger (if you add the endpoint)**
```bash
curl -X POST http://localhost:8000/api/admin/generate-day \
  -H "Authorization: Bearer <parent_token>"
```

**Option B: Wait for midnight**
- Check logs at midnight for:
  ```
  [2026-02-09 00:00:00] Running daily task generation (Day +7)...
  ✓ Generated X task instances for Day +7
  ```

**Option C: Manually run the function:**
```bash
cd backend
python -c "
import asyncio
from app.database import get_db
from app.utils.task_generator import generate_tasks_for_day

async def test():
    async with get_db() as db:
        count = await generate_tasks_for_day(db, days_ahead=7)
    print(f'Generated {count} instances')

asyncio.run(test())
"
```

## Step 12: Test Custom Instance Creation

You can test this via the API docs (http://localhost:8000/docs):

1. Login as parent and get token

2. Navigate to `/api/task-instances/create` endpoint

3. Click "Try it out"

4. Fill in:
   ```json
   {
     "task_id": 1,
     "assigned_to": 2,
     "available_start": "2026-02-15T06:00:00Z",
     "available_end": "2026-02-16T21:00:00Z"
   }
   ```

5. Execute

6. Login as kid - should see the custom task in their list

## Common Issues

### No tasks showing for kid
- Run bootstrap: `python -m app.utils.task_generator bootstrap`
- Verify tasks exist in database: `sqlite3 database/chore.db "SELECT * FROM tasks;"`
- Verify kid user exists: `SELECT * FROM users WHERE role='kid';`

### Bootstrap creates 0 instances
- Create tasks first as parent
- Ensure tasks are active (`active = 1`)
- Check task type (one-off tasks are NOT auto-generated)

### Photos not uploading
- Check `backend/uploads/task-photos/` directory exists
- Check file permissions
- Check file size (5MB limit)

### Points not being awarded
- Check `points_transactions` table
- Verify approval actually succeeded (check response)
- Check task instance `points_awarded` column

### APScheduler not running
- Check backend startup logs for "✓ APScheduler started successfully"
- If missing, check for errors in scheduler.py import

## Database Inspection Commands

```bash
cd backend
sqlite3 database/chore.db

# View all task instances
SELECT id, task_id, assigned_to, status, available_start, available_end FROM task_instances;

# View pending submissions
SELECT * FROM task_instances WHERE status = 'pending';

# View points transactions
SELECT * FROM points_transactions;

# View task history
SELECT * FROM task_history;

# Exit
.quit
```

## Success Criteria

✅ Bootstrap creates instances for 7 days
✅ Kid can see tasks grouped by day
✅ Kid can submit task with photo
✅ Parent can view pending submissions
✅ Parent can approve (points awarded, photo deleted)
✅ Parent can reject (status based on expiration)
✅ Expired tasks auto-lock when accessed
✅ Daily job generates Day +7 at midnight
✅ Expiration checker runs every 10 minutes

## Next Steps

After confirming everything works:

1. Create more kids: Test multiple kids with different assigned tasks
2. Test weekly recurrence: Create tasks for specific days
3. Test mixed scenarios: Some kids complete, some don't
4. Monitor APScheduler logs over 24 hours
5. Test on Raspberry Pi hardware
