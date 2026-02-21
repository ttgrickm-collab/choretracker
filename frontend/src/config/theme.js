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
    
    // Loading/Error states
    loadError: "Failed to load objectives",
    collectError: "Failed to collect rewards",
    collecting: "Collecting...",
    
    // Status messages
    awaitingReview: "Awaiting Review",
    
    // Meta labels
    dueLabel: "Due:",
    
    // Confirmations/Warnings
    confirmDelete: "⚠️ This action cannot be undone. Continue?",
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
    fuel: "CUSTOM_FUEL", // Special: renders custom green glowing droplet
    collect: "CUSTOM_CARGO", // Special: renders custom space cargo container (sealed)
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
 * Get themed icon identifier (returns emoji string or special identifier for custom icons)
 * Use with ic() helper from utils/iconRenderer for unified rendering
 * @param {string} iconKey - Key in THEME.icons
 * @returns {string} - Icon emoji or special identifier (CUSTOM_FUEL, CUSTOM_CARGO, CUSTOM_CARGO_OPEN)
 */
export const icon = (iconKey) => {
  return THEME.icons[iconKey] || '';
};
