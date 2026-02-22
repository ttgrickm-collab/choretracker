// frontend/src/config/theme.js
// Centralized Launch Pad theme configuration
// Backend stays theme-agnostic - this file maps generic API terms to themed UI

export const THEME = {
  // ========================================
  // BRAND IDENTITY
  // ========================================
  brand: {
    name: "Launch Pad",
    tagline: "Complete Objectives. Collect Fuel. Launch to Rewards!",
  },

  // ========================================
  // TERMINOLOGY MAPPING (Backend → Frontend)
  // ========================================
  terms: {
    // Core concepts
    task: "Objective",
    tasks: "Objectives",
    points: "Fuel",
    dashboard: "Mission Control",
    
    // Actions
    submit: "Transmit Data",
    resubmit: "Re-Transmit Data",
    approve: "Approve",
    reject: "Reject",
    collect: "Collect",
    complete: "Complete",
    review: "Review",
    create: "Create",
    edit: "Edit",
    deactivate: "Deactivate",
    expired: "Expired",
    collected: "Rewards Collected!",
    
    // Roles
    parent: "Mission Control",
    kid: "Astronaut",
  },

  // ========================================
  // STATUS LABELS
  // ========================================
  status: {
    incomplete: "Incomplete Objective",
    pending: "Data Transmitting...",
    approved: "Transmission Complete!",
    rejected: "Transmission Failed...",
    expired: "Objective Expired",
    locked: "Objective Locked",
    completed: "Objective Complete!",
  },

  // ========================================
  // UI TEXT TEMPLATES
  // ========================================
  messages: {
    // ── Kid-facing ──────────────────────────
    dataRequired: "Mission Control Data Request",
    acknowledgementText: "I confirm that I have completed this objective to the best of my ability and am ready to transmit this completion to Mission Control.",
    acknowledgementFormTitle: "Official Objective Completion Form",
    astronautSignature: "Astronaut Signature:",
    dateLabel: "Date:",
    acknowledgementFormId: "Mission Control Form:",
    photoRequirements: "Photo Transmission Requirements:",
    photoRequiredMeta: "Photo required",
    uploadPhoto: "Upload Photo *",
    clickToUpload: "Click to upload or drag and drop",
    photoUploadHint: "PNG, JPG up to 10MB",
    remove: "Remove",
    insufficientFuel: "Insufficient fuel reserves!",
    objectiveComplete: "Objective complete! Collect your fuel.",
    noObjectives: "No active objectives at this time.",
    emptyObjectives: "Mission Control hasn't assigned any objectives yet. Check back later for new missions!",
    transmissionSuccess: "Data transmitted successfully!",
    transmissionFailed: "Transmission failed. Please try again.",
    fuelCollected: "Rewards collected successfully!",
    fuelUnit: "Fuel",

    // ── Loading / Error ──────────────────────
    loading: "Loading...",
    loadError: "Failed to load objectives",
    loadSubmissionsError: "Failed to load pending submissions",
    collectError: "Failed to collect rewards",
    collecting: "Collecting...",

    // ── Status ──────────────────────────────
    awaitingReview: "Awaiting Review",
    dueLabel: "Due:",

    // ── Parent Dashboard ─────────────────────
    dashboardSubtitle: "Manage active objectives and track family progress",
    activeObjectivesHeader: "Active Objectives",
    noTasksYet: "No objectives created yet.",
    createFirst: "Create your first objective",
    photoRequired: "Photo required",
    recurring: "Recurring",
    oneTime: "One-time",
    editing: "Editing…",

    // ── Parent Review ────────────────────────
    reviewTitle: "Review Submissions",
    reviewSubtitle: "Review and approve or reject objective submissions",
    noSubmissions: "No pending submissions to review. Great job keeping up!",
    submittedBy: "Submitted by",
    photoCriteria: "Photo Criteria:",
    viewPhoto: "View Photo",
    hidePhoto: "Hide Photo",
    submissionPhotoAlt: "Task submission photo",
    approveConfirmText: "Approve \"{title}\" for",
    rejectReasonPlaceholder: "Reason for rejection...",

    // ── Shared Confirmations / Actions ───────
    confirmYes: "Confirm",
    cancel: "Cancel",
    saving: "Saving...",
    saveChanges: "Save Changes",
    saveError: "Failed to save changes",
    deactivateConfirm: "Deactivate this objective?",
    deactivating: "Deactivating...",
    deactivateError: "Failed to deactivate",
    creating: "Creating...",
    createError: "Failed to create objective",

    // ── CreateTask / InlineEdit Form Labels ──
    createTaskTitle: "Create New Objective",
    createTaskSubtitle: "Set up a new objective for your crew to complete and earn fuel",
    createTaskButton: "Create Objective",
    sectionBasicInfo: "Basic Information",
    sectionPhotoReqs: "Photo Requirements",
    sectionSchedule: "Schedule & Recurrence",
    sectionAssignTo: "Assign To",
    taskNameLabel: "Objective Name",
    taskNamePlaceholder: "e.g., Make Your Bed",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Optional: Additional details about the objective",
    iconLabel: "Task Icon",
    iconUploadPrompt: "Click to upload icon",
    iconUploadHint: "Optional custom icon for this objective",
    valueLabel: "Value",
    pointsHint: "How much fuel crew earns for completing this objective",
    requirePhotoLabel: "Require photo proof of completion",
    photoCriteriaLabel: "Photo Criteria",
    photoCriteriaPlaceholder: "e.g., Bed must be made with pillows arranged neatly",
    photoCriteriaHint: "Tell crew what should be visible in their photo",
    recurringLabel: "Recurring Objective (auto-generates daily/weekly)",
    recurrencePatternLabel: "Recurrence Pattern",
    patternDaily: "Daily (every day)",
    patternWeekly: "Weekly (specific days)",
    selectDaysLabel: "Select Days",
    startOffsetLabel: "Start Time (minutes from midnight)",
    durationLabel: "Duration (minutes)",
    previewStart: "Preview:",
    previewEnd: "Ends:",
    availableStartLabel: "Available Start",
    availableEndLabel: "Available End",
    customTaskBadge: "Custom Objective:",
    customTaskNote: "This objective will be created immediately with specific dates/times. It won't auto-generate on a schedule.",
    noKidsFound: "No crew found. Create crew accounts first.",
    assignAllHint: "No crew selected — objective will be assigned to all crew",
    assignAllSelected: "All crew selected",
    assignSomeSelected: "{count} of {total} crew selected",
  },

  // ========================================
  // LABELS (for form fields, section headers)
  // ========================================
  labels: {
    objective: "Objective:",
    briefing: "Briefing:",
    rewards: "Rewards:",
  },

  // ========================================
  // ICONOGRAPHY
  // ========================================
  icons: {
    fuel: "CUSTOM_FUEL",        // Special: renders custom green glowing droplet
    collect: "CUSTOM_CARGO",    // Special: renders custom space cargo container (sealed)
    collected: "CUSTOM_CARGO_OPEN", // Special: renders custom space cargo container (opened)
    objective: "🎯",
    transmit: "📡",
    missionControl: "🎛️",
    photo: "📸",
    approved: "✅",
    rejected: "❌",
    time: "⏱️",
    pending: "📡",
    expired: "⏰",
    review: "🔍",
    completed: "🎉",
    crew: "👨‍👩‍👧‍👦",
    brand: "🚀",
    kid: "👨‍🚀",
    edit: "✏️",
    deactivate: "🗑️",
    recurring: "🔄",
    oneTime: "📅",
    basicInfo: "📋",
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
    if (value === undefined) return key;
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
 * Get themed icon identifier (returns emoji string or special identifier for custom icons)
 * Use with ic() helper from utils/iconRenderer for unified rendering
 * @param {string} iconKey - Key in THEME.icons
 * @returns {string} - Icon emoji or special identifier (CUSTOM_FUEL, CUSTOM_CARGO, CUSTOM_CARGO_OPEN)
 */
export const icon = (iconKey) => {
  return THEME.icons[iconKey] || '';
};
