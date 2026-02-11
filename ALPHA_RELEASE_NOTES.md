# Launch Pad - Alpha Release Notes

---

## v0.3.0-alpha
**Released:** February 11, 2026

### What's New
- **Launch Pad theme implementation** - Space mission UI for kids, clean admin for parents
  - Centralized theme config in `frontend/src/config/theme.js`
  - Role-based Layout and Navbar (dark space theme for kids, light professional for parents)
  - Custom green glowing fuel icon (rocket fuel droplet component)
  - Themed login page with starfield animation and "Prepare for Launch" button
  - Helper functions: `t()`, `tm()`, `icon()` for terminology mapping
  - Backend stays 100% theme-agnostic
- **Mission Control dashboard** - Complete kid UI redesign
  - Animated starfield hero header
  - Prominent fuel balance display with glow effect
  - Enhanced status badges with animations
  - Gradient action buttons ("Transmit Data")
- **Enhanced submission modal** - Better photo upload experience
  - Gradient header with themed messaging
  - Drag & drop styling for photo upload
  - Photo preview with remove button
  - Animated submit button with loading state
- **Parent pages with terminology** - Professional admin styling
  - Launch Pad terms (Objectives, Fuel) throughout
  - Clean, business-focused design (no fancy animations)
  - Improved reject workflow in Review page

### What Changed
**Frontend only:**
- Added `frontend/src/config/theme.js` - centralized theming
- Added `frontend/src/components/FuelIcon.jsx` - custom green glowing fuel droplet
- Redesigned `Layout.jsx` - role-based backgrounds (dark for kids, light for parents)
- Redesigned `Navbar.jsx` - Launch Pad branding with role-based styling
- Redesigned `Login.jsx` - space-themed login with starfield animation
- Redesigned `KidDashboard.jsx` - full Mission Control theme
- Redesigned `TaskSubmissionModal.jsx` - enhanced UX
- Updated `ParentDashboard.jsx` - terminology + custom fuel icon
- Updated `ParentReview.jsx` - terminology + improved workflow
- Updated `tailwind.config.js` - added custom animations (stars, float, shimmer)

**Backend:**
- No changes (theme-agnostic by design)

### Breaking Changes
**None** - Frontend-only update. No database or API changes.

### Known Issues
- Starfield animation may stutter on very old devices
- Backdrop blur not supported in older browsers (graceful degradation)
- "Collect Fuel" button is placeholder (functionality coming soon)

---

## v0.2.2-alpha
**Released:** February 10, 2026

### What's New
- Customizable task time windows (offset + duration)
- Custom task datetime pickers
- Improved Create Task UI with live preview

### What Changed
- Added `available_start_offset` and `duration` to tasks table
- Task generator uses custom time settings
- Create Task page redesigned with card-based sections

### Breaking Changes
None

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
| v0.3.0 | Feb 11, 2026 | Launch Pad theme & UI redesign |
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
