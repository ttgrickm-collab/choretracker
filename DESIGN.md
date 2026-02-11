# Launch Pad - Design System & Theme Guide

**Version:** 1.0  
**Last Updated:** February 10, 2026  
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
- `ParentDashboard.jsx` - Admin dashboard
- `ParentReview.jsx` - Review submissions
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

### Theme Config Structure

```javascript
// frontend/src/config/theme.js

export const THEME = {
  // ========================================
  // BRAND IDENTITY
  // ========================================
  brand: {
    name: "Launch Pad",
    tagline: "Your Family Mission Control",
  },

  // ========================================
  // TERMINOLOGY MAPPING (Backend → Frontend)
  // ========================================
  terms: {
    // Core concepts
    tasks: "Objectives",
    points: "Fuel",
    dashboard: "Mission Control",
    shop: "Launch Bay",           // Future
    customize: "Hangar",           // Future
    rewards: "Cargo",              // Future
    
    // Actions
    submit: "Transmit Data",
    resubmit: "Re-Transmit Data",
    approve: "Transmission Complete",
    reject: "Transmission Failure",
    collect: "Collect Fuel",
    complete: "Complete Objective",
    
    // Roles
    parent: "Mission Control",
    kid: "Astronaut",
  },

  // ========================================
  // STATUS LABELS
  // ========================================
  status: {
    todo: "Awaiting Data",
    pending: "Data Transmitting...",
    approved: "Transmission Complete!",
    rejected: "Transmission Failure",
    expired: "Mission Expired",
    completed: "Objective Complete",
  },

  // ========================================
  // UI TEXT TEMPLATES
  // ========================================
  messages: {
    photoRequired: "Requested Data from Mission Control",
    photoRequirements: "Mission Control Requests:",
    insufficientFuel: "Insufficient fuel reserves for round trip!",
    taskComplete: "Objective complete! Collect your fuel.",
    noTasks: "No active objectives at this time.",
    transmissionSuccess: "Data transmitted successfully!",
    transmissionFailed: "Transmission failed. Check your connection.",
    fuelCollected: "Fuel collected successfully!",
    
    // Confirmations/Warnings
    confirmLaunch: "⚠️ Launching will immediately burn {fuel} Fuel from your reserves and you mustn't return empty handed! Continue mission?",
    confirmDelete: "⚠️ This action cannot be undone. Continue?",
    unsavedInvestigation: "⚠️ You haven't scanned for discoveries yet. Return to base without investigating?",
  },

  // ========================================
  // COLOR SYSTEM
  // ========================================
  colors: {
    // Primary brand gradient
    brandGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    
    // Space backgrounds
    spaceDarkest: "#0a0e27",
    spaceDark: "#1a1f3a",
    spaceMedium: "#243b55",
    
    // Accent colors
    accentCyan: "#00d4ff",
    accentPurple: "#764ba2",
    accentPink: "#f093fb",
    accentOrange: "#ff6b00",
    
    // Functional
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },

  // ========================================
  // ICONOGRAPHY
  // ========================================
  icons: {
    fuel: "⛽",
    objective: "🎯",
    launch: "🚀",
    transmit: "📡",
    missionControl: "🎛️",
    photo: "📸",
    approved: "✅",
    rejected: "❌",
    time: "⏱️",
    achievement: "⭐",
    discovery: "🔭",
    cargo: "📦",
    hangar: "🔧",
  },
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get themed term from backend term
 * @param {string} key - Dot-notation path (e.g., 'terms.tasks', 'status.pending')
 * @returns {string} - Themed label
 */
export const t = (key) => {
  const keys = key.split('.');
  let value = THEME;
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) return key; // Fallback to key if not found
  }
  return value;
};

/**
 * Get themed message with variable substitution
 * @param {string} messageKey - Key in THEME.messages
 * @param {object} vars - Variables to substitute (e.g., {fuel: 100})
 * @returns {string} - Message with variables replaced
 */
export const tm = (messageKey, vars = {}) => {
  let message = THEME.messages[messageKey] || messageKey;
  Object.keys(vars).forEach(key => {
    message = message.replace(`{${key}}`, vars[key]);
  });
  return message;
};

/**
 * Get themed icon
 * @param {string} iconKey - Key in THEME.icons
 * @returns {string} - Icon emoji
 */
export const icon = (iconKey) => {
  return THEME.icons[iconKey] || '';
};
```

### Usage in Components

```javascript
import { t, tm, icon, THEME } from '@/config/theme';

// Basic term replacement
<h1>{t('terms.dashboard')}</h1>
// Renders: "Mission Control"

// Status label
<span className="badge">{t('status.pending')}</span>
// Renders: "Data Transmitting..."

// Message with variables
<p>{tm('confirmLaunch', { fuel: 100 })}</p>
// Renders: "⚠️ Launching will immediately burn 100 Fuel from your reserves..."

// Icons
<span>{icon('fuel')} {fuelAmount}</span>
// Renders: "⛽ 450"

// Direct color access (for inline styles or custom components)
<div style={{ background: THEME.colors.brandGradient }}>
  // Gradient background
</div>
```

---

## 🎨 Color System

### Primary Palette

```css
/* Brand Gradient (main visual identity) */
background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);

/* Space Backgrounds */
--space-darkest: #0a0e27;  /* Deep space, hero headers */
--space-dark: #1a1f3a;      /* Secondary backgrounds */
--space-medium: #243b55;    /* Elevated surfaces */

/* Accent Colors */
--accent-cyan: #00d4ff;     /* Primary actions, highlights, borders */
--accent-purple: #764ba2;   /* Secondary actions */
--accent-pink: #f093fb;     /* Tertiary/playful elements */
--accent-orange: #ff6b00;   /* Urgent/special indicators */
```

### Functional Colors

```css
/* Status Colors */
--success: #10b981;   /* Green - approvals, completions */
--warning: #f59e0b;   /* Orange - warnings, cautions */
--error: #ef4444;     /* Red - errors, rejections */
--info: #3b82f6;      /* Blue - informational */

/* Neutral Grays */
--gray-50: #f9fafb;   /* Page backgrounds */
--gray-100: #f3f4f6;  /* Card backgrounds */
--gray-200: #e5e7eb;  /* Borders */
--gray-300: #d1d5db;  /* Disabled states */
--gray-600: #4b5563;  /* Secondary text */
--gray-900: #111827;  /* Primary text */
```

### Color Usage Guidelines

**Primary Gradient:** Headers, hero sections, primary CTAs  
**Cyan Accent:** Interactive elements, focus states, primary actions  
**Purple/Pink:** Secondary buttons, decorative elements  
**Orange:** Warnings, urgent actions, special badges  
**Success Green:** Approvals, completed objectives, positive feedback  
**Error Red:** Rejections, failures, destructive actions

---

## 📝 Typography

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
             'Helvetica Neue', Arial, sans-serif;
```

System fonts ensure fast loading and native feel on all platforms.

### Type Scale

```css
/* Headings */
H1 (Page Titles):    32-40px, font-weight: 800
H2 (Sections):       24-28px, font-weight: 700
H3 (Card Headers):   18-20px, font-weight: 600
H4 (Subsections):    16-18px, font-weight: 600

/* Body Text */
Body (Default):      16px, font-weight: 400
Small/Meta:          14px, font-weight: 500
Tiny/Caption:        12px, font-weight: 400
```

### Typography Patterns

```jsx
// Page title
<h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
  Mission Control
</h1>

// Section header
<h2 className="text-2xl font-bold text-gray-800 mb-3">
  Active Objectives
</h2>

// Card header
<h3 className="text-lg font-semibold text-gray-900 mb-2">
  Make Your Bed
</h3>

// Body text
<p className="text-base text-gray-600 leading-relaxed">
  Complete this objective to earn fuel.
</p>

// Small meta text
<span className="text-sm text-gray-500">
  Due in 2 hours
</span>
```

---

## 🎨 Component Patterns (TailwindCSS)

### Buttons

#### Primary Action Button (Gradient Power Button)

```jsx
className="group relative overflow-hidden
           bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 
           hover:from-purple-600 hover:via-purple-700 hover:to-pink-600
           text-white font-bold text-lg
           px-8 py-4 rounded-xl
           shadow-lg hover:shadow-2xl
           transform hover:scale-105 active:scale-95
           transition-all duration-200
           border-2 border-transparent hover:border-cyan-400"

// Optional: Add inner glow effect
<button className="...">
  <span className="relative z-10">Transmit Data 📡</span>
  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-pink-400/20 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
</button>
```

#### Secondary Button (Outlined Space Button)

```jsx
className="relative
           border-2 border-cyan-400 
           text-cyan-400 hover:text-gray-900
           font-semibold text-base
           px-6 py-3 rounded-lg
           bg-transparent hover:bg-cyan-400
           shadow-md hover:shadow-cyan-400/50
           transform hover:scale-105
           transition-all duration-200"
```

#### Danger/Warning Button

```jsx
className="bg-gradient-to-r from-orange-500 to-red-500
           hover:from-orange-600 hover:to-red-600
           text-white font-bold
           px-6 py-3 rounded-lg
           shadow-lg hover:shadow-xl
           transform hover:scale-105
           transition-all duration-200
           border-2 border-transparent hover:border-red-300"
```

### Cards & Panels

#### Standard Card

```jsx
className="bg-white rounded-2xl shadow-md border border-gray-200
           hover:shadow-xl hover:border-gray-300
           transition-all duration-300
           overflow-hidden"
```

#### Card with Gradient Header

```jsx
<div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100">
  {/* Header */}
  <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50
                  px-6 py-5 border-b-2 border-gray-200">
    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
      <span className="text-3xl">🎯</span>
      Active Objectives
    </h2>
  </div>
  
  {/* Content */}
  <div className="p-6 space-y-4">
    {/* Card content */}
  </div>
</div>
```

#### Space-Themed Dark Card

```jsx
className="bg-gradient-to-br from-gray-900 to-gray-800
           border-2 border-cyan-400
           rounded-2xl shadow-2xl
           hover:shadow-cyan-400/50
           transition-all duration-300
           overflow-hidden"
```

#### Card with Animated Border Glow

```jsx
<div className="relative group">
  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 
                  rounded-2xl opacity-75 group-hover:opacity-100 blur 
                  transition duration-300" />
  <div className="relative bg-white rounded-2xl p-6">
    {/* Content */}
  </div>
</div>
```

### Status Badges

```jsx
// Reusable badge component
const StatusBadge = ({ status, children }) => {
  const variants = {
    'awaiting': 'bg-gray-100 text-gray-700 border-gray-300',
    'transmitting': 'bg-yellow-50 text-yellow-800 border-yellow-300 animate-pulse',
    'complete': 'bg-green-50 text-green-800 border-green-300',
    'failure': 'bg-red-50 text-red-800 border-red-300',
    'expired': 'bg-gray-200 text-gray-600 border-gray-400',
  };
  
  return (
    <span className={`
      inline-flex items-center gap-2
      px-4 py-2 rounded-full
      text-sm font-bold
      border-2 ${variants[status]}
      shadow-sm
      transition-all duration-200
    `}>
      {children}
    </span>
  );
};

// Usage
<StatusBadge status="transmitting">
  📡 {t('status.pending')}
</StatusBadge>
```

### Input Fields

#### Text Input

```jsx
className="w-full 
           px-4 py-3
           text-base text-gray-900 placeholder-gray-400
           bg-white border-2 border-gray-300
           rounded-lg
           focus:outline-none focus:ring-4 focus:ring-blue-500/20 
           focus:border-blue-500
           transition-all duration-200
           hover:border-gray-400"
```

#### Textarea

```jsx
className="w-full 
           px-4 py-3
           text-base text-gray-900 placeholder-gray-400
           bg-white border-2 border-gray-300
           rounded-lg resize-none
           focus:outline-none focus:ring-4 focus:ring-purple-500/20 
           focus:border-purple-500
           transition-all duration-200
           hover:border-gray-400"
```

#### File Upload (Drop Zone)

```jsx
<label className="relative block cursor-pointer group">
  <div className="border-2 border-dashed border-gray-300 
                  group-hover:border-cyan-400
                  bg-gray-50 group-hover:bg-cyan-50
                  rounded-xl p-8
                  transition-all duration-200
                  text-center">
    <div className="text-4xl mb-3 opacity-40 group-hover:opacity-100 transition-opacity">
      📸
    </div>
    <p className="text-sm font-semibold text-gray-600 group-hover:text-cyan-600">
      Click to upload or drag and drop
    </p>
    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
  </div>
  <input type="file" className="hidden" accept="image/*" />
</label>
```

### Modals

```jsx
// Modal with backdrop blur
<div className="fixed inset-0 z-50 overflow-y-auto">
  {/* Backdrop */}
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm 
                  transition-opacity duration-300" 
       onClick={onClose} />
  
  {/* Modal */}
  <div className="flex min-h-full items-center justify-center p-4">
    <div className="relative bg-white rounded-2xl shadow-2xl 
                    max-w-lg w-full overflow-hidden
                    transform transition-all duration-300
                    border-2 border-gray-200">
      
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 
                      px-6 py-5 text-white">
        <h3 className="text-2xl font-bold flex items-center gap-3">
          <span className="text-3xl">📡</span>
          Requested Data from Mission Control
        </h3>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Modal content */}
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t-2 border-gray-200">
        <button className="...">Cancel</button>
        <button className="...">Transmit Data 🚀</button>
      </div>
    </div>
  </div>
</div>
```

### Page Headers

#### Hero Header with Starfield

```jsx
<div className="relative overflow-hidden 
                bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900
                border-b-4 border-cyan-400">
  
  {/* Animated starfield background */}
  <div className="absolute inset-0 opacity-60">
    <div className="absolute inset-0 
                    bg-[radial-gradient(2px_2px_at_20%_30%,white,transparent),
                        radial-gradient(2px_2px_at_60%_70%,white,transparent),
                        radial-gradient(1px_1px_at_50%_50%,white,transparent),
                        radial-gradient(1px_1px_at_80%_10%,white,transparent),
                        radial-gradient(2px_2px_at_90%_60%,white,transparent)]
                    bg-[length:200%_200%]
                    animate-[stars_20s_linear_infinite]" />
  </div>
  
  {/* Content */}
  <div className="relative z-10 px-8 py-12 text-center">
    <div className="text-7xl mb-4 animate-[float_3s_ease-in-out_infinite]">
      🚀
    </div>
    <h1 className="text-5xl md:text-7xl font-black text-white mb-3
                   [text-shadow:_0_0_30px_rgba(255,255,255,0.5),_0_0_60px_rgba(102,126,234,0.8)]
                   tracking-wider">
      LAUNCH PAD
    </h1>
    <p className="text-2xl font-bold text-white/90">
      Your Family Mission Control
    </p>
  </div>
</div>
```

**Required Tailwind Config for Animations:**

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        stars: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        stars: 'stars 20s linear infinite',
        float: 'float 3s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
};
```

### Loading States

#### Spinning Loader

```jsx
<div className="inline-flex items-center gap-3">
  <div className="w-6 h-6 border-4 border-gray-200 border-t-purple-600 
                  rounded-full animate-spin" />
  <span className="text-sm font-semibold text-gray-600">
    Data Transmitting...
  </span>
</div>
```

#### Shimmer Effect (Fuel Collection)

```jsx
<button disabled className="relative overflow-hidden ...">
  <span className="relative z-10">Collecting Fuel...</span>
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent
                  animate-shimmer" />
</button>
```

### Fuel Display (Prominent)

```jsx
// Large fuel counter with glow effect
<div className="relative group">
  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 
                  rounded-2xl blur opacity-75 group-hover:opacity-100 
                  transition duration-300" />
  <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 
                  border-2 border-yellow-400
                  rounded-2xl px-8 py-6 
                  shadow-2xl">
    <div className="text-center">
      <div className="text-yellow-400 text-5xl mb-2">⛽</div>
      <div className="text-6xl font-black text-white mb-1
                      [text-shadow:_0_0_20px_rgba(250,204,21,0.5)]">
        {fuelAmount}
      </div>
      <div className="text-lg font-bold text-yellow-400/80 uppercase tracking-wide">
        Fuel Available
      </div>
    </div>
  </div>
</div>
```

### Alert Messages

#### Success Alert

```jsx
<div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4 shadow-md">
  <div className="flex items-start gap-3">
    <span className="text-2xl">✅</span>
    <div>
      <h4 className="font-bold text-green-900">Transmission Complete!</h4>
      <p className="text-sm text-green-700 mt-1">
        Your data has been approved by Mission Control.
      </p>
    </div>
  </div>
</div>
```

#### Error Alert

```jsx
<div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 shadow-md">
  <div className="flex items-start gap-3">
    <span className="text-2xl">❌</span>
    <div>
      <h4 className="font-bold text-red-900">Transmission Failure</h4>
      <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
    </div>
  </div>
</div>
```

#### Warning Alert

```jsx
<div className="bg-orange-50 border-l-4 border-orange-500 rounded-r-lg p-4 shadow-md">
  <div className="flex items-start gap-3">
    <span className="text-2xl">⚠️</span>
    <div>
      <h4 className="font-bold text-orange-900">Warning</h4>
      <p className="text-sm text-orange-700 mt-1">
        Launching will immediately burn {fuel} Fuel from your reserves!
      </p>
    </div>
  </div>
</div>
```

### Empty States

```jsx
// No objectives available
<div className="text-center py-16 px-6">
  <div className="text-8xl mb-6 opacity-40">🎯</div>
  <h3 className="text-2xl font-bold text-gray-700 mb-3">
    No Active Objectives
  </h3>
  <p className="text-gray-500 max-w-md mx-auto">
    Mission Control hasn't assigned any objectives yet. 
    Check back later for new missions!
  </p>
</div>
```

---

## 📐 Layout & Spacing

### Container Patterns

```jsx
// Full-width page container
<div className="min-h-screen bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Page content */}
  </div>
</div>

// Centered content card
<div className="max-w-2xl mx-auto px-4 py-8">
  <div className="bg-white rounded-2xl shadow-lg p-8">
    {/* Content */}
  </div>
</div>

// Two-column layout
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  {/* Sidebar */}
  <div className="lg:col-span-1">
    {/* Sidebar content */}
  </div>
  
  {/* Main content */}
  <div className="lg:col-span-2">
    {/* Main content */}
  </div>
</div>
```

### Spacing Scale

```jsx
// Vertical spacing between sections
<div className="space-y-8">        {/* 32px - Loose (major sections) */}
<div className="space-y-6">        {/* 24px - Comfortable (default) */}
<div className="space-y-4">        {/* 16px - Normal (card content) */}
<div className="space-y-2">        {/* 8px - Tight (related items) */}

// Grid gaps
<div className="grid grid-cols-2 gap-6">    {/* 24px between cards */}
<div className="grid grid-cols-3 gap-4">    {/* 16px between items */}
```

---

## 🎭 Narrative Voice & Messaging

### Tone Guidelines

**Target Audience:** Ages 6-16 (families with multiple children)  
**Voice:** Adventurous, encouraging, space-mission themed  
**Personality:** Optimistic, supportive, goal-oriented

**Do:**
- Use space/mission terminology consistently
- Frame tasks as achievable objectives
- Celebrate completions and progress
- Keep language energetic but not childish

**Don't:**
- Use baby talk or overly cutesy language
- Be condescending or patronizing
- Use technical jargon kids won't understand
- Frame failures negatively (rejections are learning opportunities)

### Good vs Bad Examples

#### ✅ Good Examples

```
"Fuel reserves depleted! Complete objectives to refuel."
"Mission Control requests visual confirmation of your work."
"Transmission received! Awaiting analysis from Mission Control."
"You've completed 3 objectives this week. Keep it up, astronaut!"
"Insufficient fuel reserves for round trip! Complete more objectives."
```

#### ❌ Bad Examples

```
"You don't have enough points to do that."
"Please upload a picture of the completed task."
"Task submitted. Waiting for parent approval."
"Error: Invalid file format."
"You need to do more chores before you can buy rewards."
```

### Message Patterns

Use these templates for consistent messaging:

```javascript
// Warnings
"⚠️ [Action] will [consequence]. Continue?"
// Example: "⚠️ Launching will burn 100 Fuel. Continue mission?"

// Success
"✅ [Achievement]! [Next step]."
// Example: "✅ Transmission complete! Collect your fuel."

// Errors
"❌ [Problem]. [Solution]."
// Example: "❌ Connection lost. Check your internet and try again."

// Prompts
"[Request from Mission Control]. [Action needed]."
// Example: "Mission Control requests photo proof. Transmit your data."

// Encouragement
"[Progress observation]. [Motivational statement]."
// Example: "3 objectives completed this week. You're on a roll!"
```

---

## 📱 Responsive Design

### Breakpoint Strategy

Tailwind's default breakpoints (mobile-first):
- `sm`: 640px (small tablets)
- `md`: 768px (tablets)
- `lg`: 1024px (desktops)
- `xl`: 1280px (large desktops)
- `2xl`: 1536px (extra large)

### Responsive Patterns

```jsx
// Spacing
<div className="
  px-4              /* Mobile: 16px padding */
  sm:px-6           /* Tablets: 24px */
  lg:px-8           /* Desktop: 32px */
">

// Typography
<h1 className="
  text-3xl          /* Mobile: 30px */
  md:text-5xl       /* Tablets: 48px */
  lg:text-6xl       /* Desktop: 60px */
">

// Grid Layouts
<div className="
  grid grid-cols-1      /* Mobile: stack */
  md:grid-cols-2        /* Tablets: 2 columns */
  lg:grid-cols-3        /* Desktop: 3 columns */
  gap-4 md:gap-6        /* Responsive gap */
">

// Visibility
<div className="
  hidden              /* Hide on mobile */
  md:block            /* Show on tablets+ */
">
```

### Touch-Friendly Guidelines

```jsx
// Minimum touch target: 44x44px (Apple HIG / Android guidelines)
<button className="min-h-[44px] min-w-[44px] px-6 py-3">

// Increased spacing on touch devices
<button className="
  px-4 py-2           /* Desktop: compact */
  touch:px-6 touch:py-4  /* Touch: comfortable */
">

// Larger hit areas for small icons
<button className="p-3">  {/* Padding around 24px icon = 48px total */}
  <span className="text-2xl">🚀</span>
</button>
```

---

## ♿ Accessibility

### Focus States

Always visible, high contrast:

```jsx
// Standard focus ring
className="focus:outline-none 
           focus:ring-4 focus:ring-blue-500/50 
           focus:ring-offset-2"

// Cyan accent for Launch Pad theme
className="focus:outline-none 
           focus:ring-4 focus:ring-cyan-400/50 
           focus:ring-offset-2"

// Dark mode (future)
className="dark:focus:ring-cyan-400/50"
```

### Skip Navigation

```jsx
// Skip to main content link (visible on focus)
<a href="#main-content" 
   className="sr-only focus:not-sr-only 
              focus:absolute focus:top-4 focus:left-4
              bg-white px-6 py-3 rounded-lg shadow-lg 
              z-50 font-bold text-purple-600
              focus:ring-4 focus:ring-purple-500/50">
  Skip to main content
</a>

// Main content target
<main id="main-content" tabIndex="-1">
  {/* Page content */}
</main>
```

### ARIA Labels & Roles

```jsx
// Icon buttons need labels
<button aria-label="Transmit data to Mission Control">
  📡
</button>

// Status announcements (for screen readers)
<div role="status" aria-live="polite">
  {successMessage}
</div>

// Alert regions
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>

// Loading states
<button disabled aria-busy="true">
  <span className="sr-only">Data transmitting, please wait...</span>
  <span aria-hidden="true">📡 Transmitting...</span>
</button>

// Disabled explanations
<button disabled aria-disabled="true" aria-label="Collect fuel (complete objective first)">
  Collect Fuel
</button>
```

### Screen Reader Only Text

```jsx
// Provide context for screen readers
<button>
  <span aria-hidden="true">🚀</span>
  <span className="sr-only">Launch to destination</span>
</button>

// Form labels (always required)
<label htmlFor="objective-title" className="sr-only">
  Objective Title
</label>
<input id="objective-title" placeholder="e.g., Make Your Bed" />
```

### Color Contrast

Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large):

**Good Contrast Pairs:**
- White text on `purple-600` or darker
- `gray-900` text on `white` or `gray-50`
- `yellow-400` text on `gray-900` (fuel displays)
- `cyan-400` borders on `gray-900` backgrounds

**Test Tools:**
- Chrome DevTools Lighthouse
- WebAIM Contrast Checker
- Axe DevTools browser extension

### Keyboard Navigation

All interactive elements must be keyboard accessible:

```jsx
// Custom interactive elements need tabIndex
<div 
  role="button" 
  tabIndex="0"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleAction();
    }
  }}
  onClick={handleAction}
>
  Interactive Element
</div>

// Modal focus trap (use a library like focus-trap-react)
import FocusTrap from 'focus-trap-react';

<FocusTrap>
  <div role="dialog" aria-modal="true">
    {/* Modal content - focus stays inside */}
  </div>
</FocusTrap>
```

---

## 🎨 Theme Extension & Customization

### Creating Alternative Themes

The centralized theme config makes it easy to create completely different themes for different families.

**Example: Medieval Quest Board Theme**

```javascript
// frontend/src/config/themes/questboard.js

export const THEME = {
  brand: {
    name: "Quest Board",
    tagline: "Your Family Adventure Awaits",
  },
  
  terms: {
    tasks: "Quests",
    points: "Gold",
    dashboard: "Quest Hall",
    shop: "Merchant",
    submit: "Complete Quest",
    approve: "Quest Approved",
    reject: "Quest Failed",
    collect: "Collect Gold",
    // ...
  },
  
  colors: {
    brandGradient: "linear-gradient(135deg, #8B4513 0%, #D4AF37 100%)",
    // Medieval browns, golds, etc.
  },
  
  icons: {
    fuel: "🪙",
    objective: "⚔️",
    launch: "🗡️",
    // ...
  },
};
```

**To Switch Themes:**

1. Create new theme file in `frontend/src/config/themes/`
2. Update import in components: `from '@/config/theme'` → `from '@/config/themes/questboard'`
3. All UI text, colors, icons update automatically
4. Backend API stays completely unchanged

### Theme Selector (Future Feature)

Allow families to choose their theme from settings:

```javascript
// Store theme preference
localStorage.setItem('theme', 'launchpad'); // or 'questboard', 'sports', etc.

// Dynamic theme loading
import launchpadTheme from '@/config/themes/launchpad';
import questboardTheme from '@/config/themes/questboard';

const themes = {
  launchpad: launchpadTheme,
  questboard: questboardTheme,
};

const activeTheme = themes[localStorage.getItem('theme') || 'launchpad'];
```

---

## 🚀 Implementation Checklist

### Phase 1: Theme Foundation
- [ ] Create `frontend/src/config/theme.js` with full THEME object
- [ ] Add helper functions (`t`, `tm`, `icon`)
- [ ] Add custom animations to `tailwind.config.js`
- [ ] Test theme helpers in one component

### Phase 2: Component Migration
- [ ] Replace hardcoded text with `t()` calls in all components
- [ ] Update button styles with enhanced gradients
- [ ] Implement status badges with proper styling
- [ ] Add themed alerts (success, error, warning)
- [ ] Create reusable card components

### Phase 3: Visual Polish
- [ ] Implement starfield hero header
- [ ] Add animated border glows to key cards
- [ ] Create prominent fuel display component
- [ ] Add loading states with shimmer effects
- [ ] Implement empty states with themed messaging

### Phase 4: Accessibility Audit
- [ ] Add ARIA labels to all interactive elements
- [ ] Verify keyboard navigation works everywhere
- [ ] Test with screen reader (NVDA, VoiceOver)
- [ ] Ensure all focus states are visible
- [ ] Run Lighthouse accessibility audit (target: 95+)
- [ ] Check color contrast ratios (WCAG AA minimum)

### Phase 5: Responsive Testing
- [ ] Test on mobile (375px, 414px)
- [ ] Test on tablet (768px, 1024px)
- [ ] Test on desktop (1280px, 1920px)
- [ ] Verify touch targets are 44x44px minimum
- [ ] Test with browser zoom at 200%
- [ ] Test on real devices (iOS, Android)

### Phase 6: Performance
- [ ] Minimize re-renders with React.memo where appropriate
- [ ] Lazy load images
- [ ] Optimize animations (use transform/opacity only)
- [ ] Test page load time < 2s
- [ ] Run Lighthouse performance audit (target: 90+)

---

## 📚 Design Resources

### Tools & References

**Color:**
- [Coolors.co](https://coolors.co) - Palette generator
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - WCAG compliance

**Typography:**
- [Type Scale](https://typescale.com) - Font size calculator
- [Modular Scale](https://www.modularscale.com) - Harmonious sizing

**Accessibility:**
- [WAVE](https://wave.webaim.org) - Accessibility checker
- [Axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

**Icons & Emoji:**
- [Emojipedia](https://emojipedia.org) - Emoji reference
- Native emoji support (no external dependencies)

**Tailwind:**
- [Tailwind Docs](https://tailwindcss.com/docs) - Official documentation
- [Tailwind UI Components](https://tailwindui.com) - Premium components (reference only)

---

## 🎯 Design Principles Summary

1. **Theme Separation:** Backend is generic, frontend is themed
2. **Centralized Config:** One source of truth for all theming
3. **Narrative Consistency:** Space mission metaphor throughout
4. **Age-Appropriate:** 6-16 years, adventurous but not childish
5. **Accessibility First:** WCAG AA minimum, keyboard navigable
6. **Mobile-First:** Responsive, touch-friendly, 44px targets
7. **Performance:** Fast, smooth animations, optimized
8. **Extensible:** Easy to create new themes without code changes

---

**Last Updated:** February 10, 2026  
**Maintained By:** Launch Pad Development Team  
**Questions?** Refer to this guide for all UI/UX decisions.
