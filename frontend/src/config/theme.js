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
    launchBay: "Launch Bay",
    tier: "Destination",
    tiers: "Destinations",
    reward: "Cargo",
    rewards: "Cargo",
    cargoHold: "Cargo Hold",

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
    // Cargo statuses
    pending_cargo: "Selecting Cargo...",
    awarded: "Ready to Redeem",
    redeemed: "Awaiting Fulfillment",
    fulfilled: "Mission Complete!",
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

    // ── Launch Bay (kid-facing) ──────────────
    launchBayTagline: "Select a destination. Spend fuel. Claim your cargo.",
    selectDestination: "Select a Destination to Launch",
    initiateLaunch: "Initiate Launch",
    launching: "Launching...",
    selectCargo: "Select Your Cargo",
    arrivalMessage: "You've arrived at {destination}!",
    arrivalSubtitle: "Choose your cargo before returning to the Launch Bay.",
    secureCargo: "Secure Cargo & Return",
    securingCargo: "Securing...",
    cargoSecured: "Cargo secured! Check your Cargo Hold.",
    cargoHoldEmpty: "Your cargo hold is empty. Launch to a destination to claim cargo!",
    noTiersAvailable: "No destinations available. Check back with Mission Control!",
    launchBayInsufficient: "Not Enough Fuel!",
    pendingCargoWarning: "Active launch detected! You must select your cargo before launching again.",
    fuelCost: "Fuel Required",
    cargoAvailable: "Cargo Available",
    outOfStock: "Out of Stock",
    redeemCargo: "Redeem Cargo",
    redeeming: "Redeeming...",
    redeemSuccess: "Cargo submitted for fulfillment!",
    redeemInfo: "Redeeming will notify Mission Control to fulfill this reward.",
    cargoStatusAwarded: "Ready to Redeem",
    cargoStatusRedeemed: "Awaiting Fulfillment",
    cargoStatusFulfilled: "Mission Complete! ✅",
    yourBalance: "Your Fuel",
    destinationCost: "Fuel Cost:",
    afterLaunch: "Remaining After Launch:",

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
    dashboardTitle: "Dashboard",
    dashboardSubtitle: "Manage active objectives and track family progress",
    activeObjectivesHeader: "Active Objectives",
    createObjectiveCTA: "Create Objective",
    noTasksYet: "No objectives created yet.",
    createFirst: "Create your first objective",
    photoRequired: "Photo required",
    recurring: "Recurring",
    oneTime: "One-time",
    editing: "Editing…",
    taskNameLabel: "Objective Name",
    taskDescriptionLabel: "Briefing (optional)",
    taskDescriptionPlaceholder: "What does the kid need to do?",
    fuelValueLabel: "Fuel Value",
    deactivateError: "Failed to deactivate objective",

    // ── Parent Review ────────────────────────
    reviewTitle: "Review Submissions",
    reviewSubtitle: "Review and approve or reject objective submissions",
    pendingCount: "{count} pending",
    noSubmissions: "No pending submissions to review. Great job keeping up!",
    submittedBy: "Submitted by",
    photoCriteria: "Photo Criteria:",
    viewPhoto: "View Photo",
    hidePhoto: "Hide Photo",
    submissionPhotoAlt: "Task submission photo",
    approveConfirmText: "Approve \"{title}\" for",
    rejectReasonPlaceholder: "Reason for rejection...",
    approveError: "Failed to approve submission",
    rejectError: "Failed to reject submission",
    rejectReasonRequired: "Please provide a reason for rejection",

    // ── Parent Manage Rewards ────────────────
    manageRewardsTitle: "Manage Rewards",
    manageRewardsSubtitle: "Create and manage destinations and cargo items",
    destinationsHeader: "Destinations",
    destinationsSubtitle: "Tiers kids can travel to by spending fuel",
    cargoItemsHeader: "Cargo Items",
    cargoItemsSubtitle: "Rewards available at each destination",
    addDestination: "Add Destination",
    addCargoItem: "Add Cargo Item",
    noDestinations: "No destinations created yet.",
    noCargoItems: "No cargo items created yet.",
    destinationCostLabel: "Fuel Cost",
    displayOrderLabel: "Display Order",
    displayOrderHint: "Higher number = shown higher on the page",
    quantityLabel: "Quantity",
    quantityHint: "Leave empty for unlimited",
    unlimitedLabel: "Unlimited",
    outOfStockLabel: "Out of Stock",
    remainingLabel: "{count} remaining",
    tierLabel: "Destination",
    costLabel: "Cost",
    redemptionCount: "{count} redemptions",

    // ── Parent Reward Redemptions ────────────
    rewardRedemptionsTitle: "Reward Redemptions",
    rewardRedemptionsSubtitle: "Review and fulfill redeemed cargo from kids",
    noRedemptions: "No redemptions yet.",
    fulfillReward: "Fulfill",
    fulfillConfirm: "Mark as fulfilled for {kidName}?",
    returnToCargo: "Return to Cargo",
    cancelReward: "Cancel & Refund",
    cancelConfirm: "Cancel this reward and refund {points} fuel to {kidName}?",
    fuelSpent: "Fuel Spent:",
    redeemedAt: "Redeemed:",
    fulfilledAt: "Fulfilled:",
    filterAll: "All",
    filterPending: "Awaiting Fulfillment",
    filterFulfilled: "Fulfilled",
    fulfilling: "Fulfilling...",
    cancelling: "Cancelling...",

    // ── Shared Confirmations / Actions ───────
    confirmYes: "Confirm",
    cancel: "Cancel",
    saving: "Saving...",
    saveChanges: "Save Changes",
    saveError: "Failed to save changes",
    deactivateConfirm: "Deactivate this objective?",
    deactivating: "Deactivating...",
    createError: "Failed to create objective",
    valueLabel: "Value",
    pointsHint: "How much fuel this objective is worth",
    sectionBasicInfo: "Basic Information",
    sectionPhotoReqs: "Photo Requirements",
    sectionSchedule: "Schedule & Recurrence",
    sectionAssign: "Assign To",
    assignAllHint: "No crew selected — objective will be assigned to all crew",
    assignAllSelected: "All crew selected",
    assignSomeSelected: "{count} of {total} crew selected",
    noKidsFound: "No crew found. Create crew accounts first.",
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
    fuel: "CUSTOM_FUEL",            // Special: renders custom green glowing droplet
    collect: "CUSTOM_CARGO",        // Special: renders custom space cargo container (sealed)
    collected: "CUSTOM_CARGO_OPEN", // Special: renders custom space cargo container (opened)
    cargo: "CUSTOM_CARGO",          // Alias — cargo hold button, sealed
    cargoOpen: "CUSTOM_CARGO_OPEN", // Alias — opened cargo
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
    launchBay: "🚀",
    destination: "🪐",
    outOfStock: "🚫",
    redeem: "📬",
    fulfilled: "✅",
    planet1: "🌙",
    planet2: "🔴",
    planet3: "🪐",
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
 * @returns {string} - Icon emoji or special identifier
 */
export const icon = (iconKey) => {
  return THEME.icons[iconKey] || '';
};
