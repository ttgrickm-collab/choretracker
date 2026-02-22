# Launch Pad - Design System & Theme Guide

**Version:** 1.1  
**Last Updated:** February 22, 2026  
**Purpose:** Frontend theming, UI patterns, and visual guidelines for the Launch Pad family task management system.

---

## 🎯 Architecture Principle: Theme Separation

### Backend = Theme-Agnostic Data Layer
- **Database:** `tasks`, `task_instances`, `points_transactions` (generic terms)
- **API Responses:** `{ "points": 150, "status": "pending" }` (no theme-specific terminology)
- **Endpoints:** `/api/tasks`, `/api/photos`, `/api/users` (functional names only)
- **Business Logic:** Pure task management, no UI concerns

### Frontend = Replaceable Presentation Layer
- All "Launch Pad" terminology lives exclusively in frontend
- Centralized theme configuration in single file
- Easy to swap entire theme without touching backend
- Different families could use completely different themes (medieval, sports, etc.)

**Critical Rule:** Backend code must NEVER reference theme terms like "fuel", "objectives", "transmit". Always use generic terms: "points", "tasks", "submit".

---

## 🚀 Launch Pad Theme Identity

### Brand Overview

**Product Name:** Launch Pad  
**Tagline:** "Your Family Mission Control"  
**Target Audience:** Ages 6-16 (families with multiple kids)

**Core Narrative:**  
Kids are astronauts completing mission objectives. They transmit data (photos) back to Mission Control (parents) for approval. Upon approval, they collect fuel (points) which powers future launches to exciting destinations where they can claim cargo (rewards) and make discoveries.

**Theme Metaphor:**
- Kids = Astronauts on missions
- Parents = Mission Control (approve/reject transmissions)
- Points = Fuel (currency for future launches)
- Tasks = Objectives (mission goals)
- Photo submission = Transmit Data
- Dashboard = Mission Control
- Shop = Launch Bay (future)
- Customization = Hangar (future)

---

## 🎨 UI Style Guidelines by Role

### Kid Pages (Full Theme Treatment)

**Visual Style:**
- Starfield backgrounds with animations
- Gradient buttons with hover effects
- Glowing borders and shadow effects
- Prominent fuel displays with visual flair
- Space-themed empty states
- Animated status badges

**Pages:**
- `KidDashboard.jsx` - Mission Control
- `TaskSubmissionModal.jsx` - Data transmission

**Principle:** Kids get the exciting, immersive space mission experience. This is their game, their adventure.

### Parent Pages (Professional Admin Style)

**Visual Style:**
- Clean white backgrounds
- Simple borders (no glows or animations)
- Standard buttons (blues/grays, solid colors)
- Professional color scheme
- Information-dense layouts
- Focus on clarity and efficiency

**Pages:**
- `ParentDashboard.jsx` - Admin dashboard with inline task editing
- `ParentReview.jsx` - Review submissions with inline photo expand
- `CreateTask.jsx` - Task creation

**Principle:** Parents get a business tool with themed terminology. Professional, efficient, no distractions.

**Why the Difference?**
- Kids need engagement and excitement
- Parents need productivity and clarity
- Both use the same terminology (Objectives, Fuel) for consistency
- Visual treatment matches the user's role

---

## 🎨 Theme Configuration System

### Centralized Config File

All theming lives in: `frontend/src/config/theme.js`

This single file contains:
- Terminology mappings (backend → frontend)
- Status labels
- UI message templates
- Color palette
- Icon definitions

**Why Centralize?**
- Easy theme swapping (just replace one file)
- No hardcoded text scattered across components
- Consistent terminology everywhere
- Simple to translate or rebrand

### Theme Helper Functions

```javascript
t('terms.tasks')         // → "Objectives"
t('status.pending')      // → "Data Transmitting..."
tm('dashboardSubtitle')  // → "Manage active objectives..."
tm('assignSomeSelected', { count: 2, total: 3 }) // → "2 of 3 crew selected"
icon('fuel')             // → "CUSTOM_FUEL" (use with ic() from iconRenderer)
icon('recurring')        // → "🔄"
```

### Swappable Theme Example

```javascript
// frontend/src/config/themes/questboard.js
export const THEME = {
  brand: { name: "Quest Board", tagline: "Your Family Adventure Awaits" },
  terms: { tasks: "Quests", points: "Gold", dashboard: "Quest Hall" },
  icons: { fuel: "🪙", objective: "⚔️" },
};
```

**To Switch Themes:** Replace the import in `theme.js`. Backend unaffected.

---

## 🎨 Component Patterns (TailwindCSS)

### Buttons

#### Primary Action (Parent Pages)

```jsx
className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg
           font-medium hover:from-blue-700 hover:to-indigo-700
           shadow-sm hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
```

#### Primary Action (Kid Pages — Gradient Power Button)

```jsx
className="group relative overflow-hidden
           bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 
           hover:from-purple-600 hover:via-purple-700 hover:to-pink-600
           text-white font-bold text-lg px-8 py-4 rounded-xl
           shadow-lg hover:shadow-2xl
           transform hover:scale-105 active:scale-95 transition-all duration-200
           border-2 border-transparent hover:border-cyan-400"
```

#### Secondary / Cancel

```jsx
className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700
           font-medium hover:bg-gray-50 transition-colors"
```

#### Destructive (Deactivate / Reject)

```jsx
// Inline trigger — subdued until confirmed
className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
           text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"

// Confirmed action button
className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm
           font-medium rounded-md transition-colors"
```

#### Edit / Secondary Action

```jsx
className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-md
           font-medium border-gray-300 text-gray-600
           hover:bg-gray-50 hover:text-gray-900 transition-colors"
```

### Cards & Panels

#### Standard Card (Parent Pages)

```jsx
className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
```

#### Sectioned Card with Gradient Header

Used in `CreateTask.jsx` and inline edit forms. Each section is a separate card:

```jsx
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
      <span>📋</span> Basic Information
    </h2>
  </div>
  <div className="p-6 space-y-5">
    {/* form fields */}
  </div>
</div>
```

**Section gradient mapping (consistent across CreateTask + inline edit):**
- Basic Information → `from-blue-50 to-indigo-50`
- Photo Requirements → `from-purple-50 to-pink-50`
- Schedule & Recurrence → `from-green-50 to-emerald-50`
- Assign To → `from-orange-50 to-amber-50`

#### Space-Themed Dark Card (Kid Pages)

```jsx
className="bg-gradient-to-br from-gray-900 to-gray-800
           border-2 border-cyan-400 rounded-2xl shadow-2xl
           hover:shadow-cyan-400/50 transition-all duration-300 overflow-hidden"
```

### Inline Expand Pattern (Parent Pages)

Used for task editing on `ParentDashboard` and photo viewing on `ParentReview`. No modals — content expands in-place.

```
┌─────────────────────────────────────────────────┐
│ Summary row (always visible, muted when editing) │  ← opacity-40 bg-gray-50
├─────────────────────────────────────────────────┤
│ ┌── Basic Information ─────────────────────┐    │
│ └──────────────────────────────────────────┘    │
│ ┌── Photo Requirements ─────────────────────┐   │  ← expanded content
│ └───────────────────────────────────────────┘   │
│ ┌── Schedule ────────────────────────────────┐  │
│ └────────────────────────────────────────────┘  │
│ [🗑️ Deactivate]           [Cancel] [Save]       │
└─────────────────────────────────────────────────┘
```

**Rules:**
- Summary row stays visible but muted (`opacity-40`) when expanded — provides context anchor
- Deactivate sits left, isolated from Cancel/Save which sit right
- Deactivate requires inline confirmation before firing
- Cancel collapses the form without saving
- Photo expand uses a toggle button with chevron indicator

### Status Badges

```jsx
const variants = {
  'awaiting':     'bg-gray-100 text-gray-700 border-gray-300',
  'transmitting': 'bg-yellow-50 text-yellow-800 border-yellow-300 animate-pulse',
  'complete':     'bg-green-50 text-green-800 border-green-300',
  'failure':      'bg-red-50 text-red-800 border-red-300',
  'expired':      'bg-gray-200 text-gray-600 border-gray-400',
};

<span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full
                 text-sm font-bold border-2 shadow-sm ${variants[status]}`}>
  {children}
</span>
```

### Input Fields

```jsx
// Standard input (all parent pages)
className="w-full px-4 py-3 border border-gray-300 rounded-lg
           focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"

// Compact input (inline edit forms — smaller context)
className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
           focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
```

### Empty States

```jsx
// Parent pages
<div className="text-center py-8">
  <div className="text-6xl mb-4 opacity-20">{icon('objective')}</div>
  <p className="text-gray-500 mb-4">No objectives created yet.</p>
  <Link to="/tasks/create" className="...primary button...">+ Create your first objective</Link>
</div>

// Kid pages
<div className="text-center py-16 px-6">
  <div className="text-8xl mb-6 opacity-40">🎯</div>
  <h3 className="text-2xl font-bold text-gray-700 mb-3">No Active Objectives</h3>
  <p className="text-gray-500 max-w-md mx-auto">
    Mission Control hasn't assigned any objectives yet.
  </p>
</div>
```

---

## 📐 Layout & Spacing

### Container Patterns

```jsx
// Parent page (full width)
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

// Parent page (narrower — review, create)
<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<div className="max-w-4xl mx-auto p-6">
```

### Spacing Scale

```jsx
<div className="space-y-8">  {/* Major sections */}
<div className="space-y-6">  {/* Default comfortable */}
<div className="space-y-4">  {/* Card content */}
<div className="space-y-2">  {/* Tight / list items */}
```

---

## 📝 Typography

```jsx
// Page title
<h1 className="text-3xl font-bold text-gray-900">

// Section header (card)
<h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">

// Card sub-header (inline edit)
<h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">

// Body text
<p className="text-sm text-gray-600">

// Meta / label
<p className="text-xs font-medium text-gray-600">
```

---

## 🎭 Narrative Voice & Messaging

**Do:** Space/mission terminology, achievable framing, encouraging tone.  
**Don't:** Baby talk, jargon kids won't understand, negative failure framing.

| Backend Generic | Frontend Themed |
|---|---|
| "Task submitted. Waiting for parent approval." | "Transmission received! Awaiting analysis from Mission Control." |
| "You don't have enough points." | "Insufficient fuel reserves!" |
| "Photo criteria:" | "Mission Control Requests:" |

---

## 🎨 Color Palette

```css
/* Primary gradient (parent CTAs) */
from-blue-600 to-indigo-600   /* headers, primary buttons */

/* Success */
bg-green-600                  /* approve, completed */

/* Danger */
bg-red-600                    /* reject, deactivate confirm */
text-red-600 border-red-200   /* deactivate trigger (subdued) */

/* Warning */
bg-amber-50 border-amber-200  /* caution banners */

/* Neutral */
bg-gray-50                    /* page background, muted rows */
border-gray-200               /* card borders */
text-gray-500                 /* secondary text */
```

---

## 🚀 Implementation Checklist

### Completed
- [x] Theme foundation — `theme.js` with `t()`, `tm()`, `icon()` helpers
- [x] Custom animations in `tailwind.config.js`
- [x] Role-based Layout and Navbar
- [x] Kid pages — full space theme (KidDashboard, TaskSubmissionModal, Login)
- [x] Parent pages — professional admin style (ParentDashboard, ParentReview, CreateTask)
- [x] Inline task edit (ParentDashboard — expand in-place, sectioned cards)
- [x] Inline photo expand (ParentReview — no modal, single approve/reject location)
- [x] All text centralized through `t()` / `tm()` / `icon()` — no hardcoded strings

### Designed (Ready to Build)
- [ ] Launch Bay — shop system with tiered destinations
- [ ] Investigations — family-wide discovery quests
- [ ] Hangar — rocket customization with unlockable parts
- [ ] Fuel balance display + transaction history (Phase 1 polish)

### Future
- [ ] Accessibility audit (WCAG AA)
- [ ] Responsive testing (mobile, tablet, desktop)
- [ ] Theme selector (multiple family themes)

---

**Last Updated:** February 22, 2026  
**For questions:** Refer to this guide for all UI/UX decisions.
