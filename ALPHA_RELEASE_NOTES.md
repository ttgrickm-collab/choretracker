# Launch Pad - Alpha Release Notes

---

## v0.2.2-alpha
**Released:** February 10, 2026

### What's New
- **Customizable task time windows** - Parents can set when recurring tasks become available
  - `available_start_offset`: Minutes from midnight (default: 360 = 6am)
  - `duration`: How long task remains available (default: 2340 = 39 hours)
  - Live preview shows actual start/end times as you adjust
- **Custom task datetime pickers** - Full control over one-time task windows
  - Pick exact start and end times (defaults: 6am today → 9pm tomorrow)
  - Instances created immediately (no bootstrap needed)
- **Improved Create Task UI** - Card-based sections with better visual hierarchy
  - Gradient headers for each section
  - Styled file upload (no default browser input)
  - Checkbox multi-select for kid assignment (replaced dropdown)
  - Responsive grid layouts with hover effects

### What Changed
**Database:**
- Added `available_start_offset` column to tasks table (INTEGER, default 360)
- Added `duration` column to tasks table (INTEGER, default 2340)

**Backend:**
- Task generator now uses task's custom `available_start_offset` and `duration`
- Custom tasks create instances immediately with parent-specified datetimes
- Updated task creation API to accept time window parameters

**Frontend:**
- Complete redesign of Create Task page
- Live time preview that updates as settings change
- Better form validation and error display

### Breaking Changes
**None** - ALPHA phase: Delete `backend/database/chore.db` and restart fresh if issues occur.

### Known Issues
- No real-time updates (page refresh required)
- No notifications for pending submissions
- Basic security (home network only)
- Manual testing only

---

## v0.2.1-alpha
**Released:** February 8, 2026

### What's New
- Task instance generation with APScheduler
- Bootstrap command for initial 7-day window
- Kid dashboard with task grouping by day
- Photo submission with preview
- Parent review workflow (approve/reject)
- Points ledger system

### What Changed
- Implemented daily midnight task generation
- Added expiration checking (lazy + background job)
- Photo deletion on approval/resubmission

---

## v0.2.0-alpha
**Released:** February 5, 2026

### What's New
- Initial alpha release
- User authentication (JWT)
- Task CRUD (parents)
- Photo upload system
- Database schema with 5 tables

---

## Version History Summary

| Version | Date | Key Feature |
|---------|------|-------------|
| v0.2.2 | Feb 10, 2026 | Customizable time windows |
| v0.2.1 | Feb 8, 2026 | Task generation & review workflow |
| v0.2.0 | Feb 5, 2026 | Initial release |

---

## Upgrade Notes (ALPHA)

**ALPHA phase:** No migrations. Delete database and start fresh for breaking changes.

```bash
# Fresh start
rm backend/database/chore.db
python -m app.utils.task_generator bootstrap
python -m app.utils.user create parent password123 parent "Parent"
python -m app.utils.user create kid1 test123 kid "Alice"
```

---

## Development Commands

```bash
# Backend
cd backend
python run.py

# Frontend  
cd frontend
npm run dev

# Bootstrap tasks (first time)
python -m app.utils.task_generator bootstrap

# Create users
python -m app.utils.user create <username> <password> <role> <display_name>
```

---

**For testing:** See `TESTING.md`  
**For features:** See `README.md`  
**For design:** See `DESIGN.md`
