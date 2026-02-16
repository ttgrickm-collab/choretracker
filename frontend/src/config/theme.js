// frontend/src/config/theme.js
// Centralized Launch Pad theme configuration
// Backend stays theme-agnostic - this file maps generic API terms to themed UI

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
    rejected: "Transmission Failure",
    expired: "Objective Expired",
    locked: "Objective Locked",
  },

  // ========================================
  // UI TEXT TEMPLATES
  // ========================================
  messages: {
    photoRequired: "Mission Control Photo Request",
    photoRequirements: "Photo Transmission Requirements:",
    insufficientFuel: "Insufficient fuel reserves!",
    objectiveComplete: "Objective complete! Collect your fuel.",
    noObjectives: "No active objectives at this time.",
    transmissionSuccess: "Data transmitted successfully!",
    transmissionFailed: "Transmission failed. Please try again.",
    fuelCollected: "Fuel collected successfully!",
    
    // Confirmations/Warnings
    confirmDelete: "⚠️ This action cannot be undone. Continue?",
  },

  // ========================================
  // ICONOGRAPHY
  // ========================================
  icons: {
    fuel: "CUSTOM_FUEL", // Special: renders custom green glowing droplet
    objective: "🎯",
    transmit: "📡",
    missionControl: "🎛️",
    photo: "📸",
    approved: "✅",
    rejected: "❌",
    time: "⏱️",
    pending: "📡",
    expired: "⏰",
    collect: "📦",
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
 * Get themed icon (returns emoji string or 'CUSTOM_FUEL' for special rendering)
 * @param {string} iconKey - Key in THEME.icons
 * @returns {string} - Icon emoji or special identifier
 */
export const icon = (iconKey) => {
  return THEME.icons[iconKey] || '';
};
