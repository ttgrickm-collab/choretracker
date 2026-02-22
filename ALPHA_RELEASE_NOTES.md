# Launch Pad - Alpha Release Notes

---

## v0.4.0-alpha
**Released:** February 22, 2026

### What's New
- **Inline task editing** — Edit objectives directly on the dashboard without a modal
  - Task row expands in-place with sectioned form cards (matching CreateTask styling)
  - Summary row stays visible and muted for context while editing
  - Inline deactivate with confirmation, isolated from Save/Cancel
  - Eliminates `EditTaskModal.jsx` — no modal pattern for parent workflow
- **Inline photo expand** — View submission photos without a separate modal
  - Toggle button with chevron reveals full photo below criteria on the card
  - Eliminates `PhotoViewer.jsx` — single approve/reject location per card
  - Removes duplicate approve/reject UI that existed in both card and modal
- **CreateTask theme pass** — All hardcoded strings replaced with `tm()` / `t()` / `icon()`
  - Section header icons now sourced from `theme.js`
  - API calls unified through service layer (`iconsAPI`, `usersAPI`, `tasksAPI`)
  - Button styles consistent with rest of parent ecosystem

### What Changed
**Frontend only:**
- Replaced `frontend/src/pages/ParentDashboard.jsx` — inline edit, removed Quick Stats placeholder
- Replaced `frontend/src/pages/ParentReview.jsx` — inline photo expand, removed PhotoViewer dependency
- Replaced `frontend/src/pages/CreateTask.jsx` — full `tm()` pass, consistent button styles
- Updated `frontend/src/config/theme.js` — new messages, icons, section labels
- **Deleted** `frontend/src/components/EditTaskModal.jsx`
- **Deleted** `frontend/src/components/PhotoViewer.jsx`

**Backend:**
- No changes

### Breaking Changes
**None** — Frontend-only update. No database or API changes.

---

## v0.3.0-alpha
**Released:** February 11, 2026

### What's New
- **Launch Pad theme implementation** — Space mission UI for kids, clean admin for parents
  - Centralized theme config in `frontend/src/config/theme.js`
  - Role-based Layout and Navbar (dark space theme for kids, light professional for parents)
  - Custom green glowing fuel icon (rocket fuel droplet component)
  - Themed login page with starfield animation and "Prepare for Launch" button
  - Helper functions: `t()`, `tm()`, `icon()` for terminology mapping
  - Backend stays 100% theme-agnostic
- **Mission Control dashboard** — Complete kid UI redesign
  - Animated starfield hero header
  - Prominent fuel balance display with glow effect
  - Enhanced status badges with animations
  - Gradient action buttons ("Transmit Data")
- **Enhanced submission modal** — Better photo upload experience
  - Gradient header with themed messaging
  - Drag & drop styling for photo upload
  - Photo preview with remove button
  - Animated submit button with loading state
- **Parent pages with terminology** — Professional admin styling
  - Launch Pad terms (Objectives, Fuel) throughout
  - Clean, business-focused design (no fancy animations)
  - Improved reject workflow in Review page

### What Changed
**Frontend only:**
- Added `frontend/src/config/theme.js`
- Added `frontend/src/components/FuelIcon.jsx`
- Redesigned `Layout.jsx`, `Navbar.jsx`, `Login.jsx`
- Redesigned `KidDashboard.jsx`, `TaskSubmissionModal.jsx`
- Updated `ParentDashboard.jsx`, `ParentReview.jsx`
- Updated `tailwind.config.js` — custom animations (stars, float, shimmer)

**Backend:** No changes

### Breaking Changes
**None** — Frontend-only update. No database or API changes.

### Known Issues
- Starfield animation may stutter on very old devices
- Backdrop blur not supported in older browsers (graceful degradation)

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
**None**

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

## Version History

| Version | Date | Key Feature |
|---|---|---|
| v0.4.0 | Feb 22, 2026 | Inline edit + photo expand, parent UX polish |
| v0.3.0 | Feb 11, 2026 | Launch Pad theme & UI redesign |
| v0.2.2 | Feb 10, 2026 | Customizable time windows |
| v0.2.1 | Feb 8, 2026 | Task generation & review workflow |
| v0.2.0 | Feb 5, 2026 | Initial release |

---

## Upgrade Notes (ALPHA)

**ALPHA phase:** No migrations. Delete database and start fresh for breaking changes.

```bash
rm backend/database/chore.db
python -m app.utils.task_generator bootstrap
python -m app.utils.user create parent password123 parent "Parent"
python -m app.utils.user create kid1 test123 kid "Alice"
```

---

**For testing:** See `TESTING.md`  
**For features:** See `README.md`  
**For design:** See `DESIGN.md`
