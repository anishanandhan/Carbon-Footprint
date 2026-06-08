/* ==========================================================================
   EcoSphere - Application Logic & State Engine
   ========================================================================== */

// 1. CONSTANTS & CONVERSION FACTORS (kg CO2e per passenger-mile)
const EMISSION_FACTORS = {
  gas_car: 0.20,       // Standard internal combustion gasoline passenger car
  hybrid_car: 0.11,    // Hybrid vehicle
  electric_car: 0.04,  // Electric Vehicle (based on national grid average)
  transit_bus: 0.08,   // Standard public transit bus
  transit_train: 0.05, // Commuter train / light rail
  escooter: 0.01,      // Electric kick scooter
  walk_bike: 0.00      // Biking or Walking (Zero emissions)
};

const MODE_NAMES = {
  gas_car: "Gasoline Car",
  hybrid_car: "Hybrid Car",
  electric_car: "Electric Vehicle (EV)",
  transit_bus: "Public Transit (Bus)",
  transit_train: "Public Transit (Train)",
  escooter: "Electric Scooter",
  walk_bike: "Bicycle / Walking"
};

const MODE_ICONS = {
  gas_car: "directions_car",
  hybrid_car: "directions_car",
  electric_car: "electric_car",
  transit_bus: "directions_bus",
  transit_train: "directions_transit",
  escooter: "electric_bike",
  walk_bike: "directions_bike"
};

const WEEKLY_BUDGET_LIMIT = 40.0; // Weekly budget target in kg CO2e

// 2. STATE OBJECT
let state = {
  logs: [],
  ecoPoints: 0,
  streak: 0,
  lastLogDate: "",
  weatherContext: "sunny",
  distanceContext: 5.0,
  unlockedBadges: [],
  gameScore: 0,
  gameStreak: 0,
  activeTab: "dashboard"
};

// 3. BADGE / ACHIEVEMENT DEFINITIONS
const BADGES = [
  { id: "first_step", title: "First Step", desc: "Logged your first activity", icon: "footprint", criteria: "Log any travel activity" },
  { id: "streak_3", title: "Consistent Eco-Friend", desc: "Reach a 3-day travel logging streak", icon: "local_fire_department", criteria: "3-day streak" },
  { id: "streak_7", title: "Green Champion", desc: "Reach a 7-day travel logging streak", icon: "star", criteria: "7-day streak" },
  { id: "points_200", title: "Eco Enthusiast", desc: "Earn a total of 200 Eco-Points", icon: "spa", criteria: "200 points" },
  { id: "quiz_5", title: "Carbon Scholar", desc: "Get 5 correct answers in Carbon Clash", icon: "school", criteria: "5 quiz wins" },
  { id: "saving_50", title: "Planet Protector", desc: "Save 50.0 kg of CO₂ vs gasoline car", icon: "forest", criteria: "50kg saved" },
  { id: "zero_emissions", title: "Pedal Powerhouse", desc: "Log 3 active zero-emission trips (Bicycle/Walk)", icon: "directions_run", criteria: "3 zero-emissions trips" },
  { id: "carpool_master", title: "Carpool Pioneer", desc: "Log a trip sharing a ride with 3+ passengers", icon: "groups", criteria: "3+ passengers log" }
];

// 4. CARBON CLASH GAME DATA
const GAME_ITEMS = [
  { title: "Streaming Video in HD", desc: "for 10 hours", co2: 0.40, icon: "tv", explanation: "Streaming high-definition video requires data centers and networks running constantly. 10 hours equals about 0.4kg of CO2." },
  { title: "Manufacturing 10 Plastic Bags", desc: "single-use shopping bags", co2: 0.33, icon: "shopping_bag", explanation: "Plastic bags are made from petroleum. Making 10 bags produces about 0.33kg of CO2." },
  { title: "Eating a Beef Hamburger", desc: "single 1/4 lb beef patty", co2: 2.50, icon: "lunch_dining", explanation: "Beef production is highly carbon-intensive due to land use, feed, and methane emissions from cattle." },
  { title: "Eating a Plant-Based Burger", desc: "single soy/pea protein patty", co2: 0.15, icon: "grass", explanation: "Plant proteins have a fraction of the emissions of livestock. Choosing a veggie burger saves 94% emissions." },
  { title: "Flying on a Jet Flight", desc: "average share for 100 miles", co2: 25.00, icon: "flight", explanation: "Airplanes burn vast amounts of kerosene, depositing emissions directly into the upper atmosphere." },
  { title: "Driving a Gasoline Car", desc: "standard commuter for 100 miles", co2: 20.00, icon: "directions_car", explanation: "A typical gas passenger car emits 0.2kg CO2 per mile, totaling 20.0kg for 100 miles." },
  { title: "Purchasing 1 New Cotton T-shirt", desc: "manufacture, dye, and ship", co2: 8.30, icon: "checkroom", explanation: "Growing cotton, dyeing fabric, and global shipping make textile manufacturing highly energy-intensive." },
  { title: "Washing & Drying 5 Laundry Loads", desc: "warm wash, heated electric dryer", co2: 2.40, icon: "local_laundry_service", explanation: "Most emissions come from heating water and running the electric clothes dryer." },
  { title: "Oat Milk Daily", desc: "drinking 1 cup daily for 1 year", co2: 65.00, icon: "local_cafe", explanation: "Oat farming requires low water and land, making it one of the most sustainable milk alternatives." },
  { title: "Cow's Milk Daily", desc: "drinking 1 cup daily for 1 year", co2: 229.00, icon: "egg", explanation: "Dairy farming has a massive footprint due to cow digestive emissions (methane) and feed crop land use." },
  { title: "Sending 100 Standard Emails", desc: "average size without heavy attachments", co2: 0.40, icon: "email", explanation: "Emails require servers to process and store. 100 emails generate about 0.4kg of CO2." },
  { title: "Running a Refrigerator", desc: "energy consumption for 1 month", co2: 15.00, icon: "kitchen", explanation: "Refrigerators run 24/7. An average modern model produces about 15.0kg of CO2 per month depending on power source." }
];

// ==========================================================================
// INITIALIZATION & STATE PERSISTENCE
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  initApp();
});

// Load state from LocalStorage
function loadState() {
  const savedState = localStorage.getItem("ecosphere_state");
  if (savedState) {
    try {
      state = JSON.parse(savedState);
      // Ensure all arrays/structures exist in case of schema update
      if (!state.logs) state.logs = [];
      if (state.ecoPoints === undefined) state.ecoPoints = 0;
      if (state.streak === undefined) state.streak = 0;
      if (state.unlockedBadges === undefined) state.unlockedBadges = [];
      if (state.gameScore === undefined) state.gameScore = 0;
      if (state.gameStreak === undefined) state.gameStreak = 0;
      if (state.weatherContext === undefined) state.weatherContext = "sunny";
      if (state.distanceContext === undefined) state.distanceContext = 5.0;
    } catch (e) {
      console.error("Error parsing saved state", e);
      resetToDefaultState();
    }
  } else {
    resetToDefaultState();
  }
}

function resetToDefaultState() {
  state = {
    logs: [],
    ecoPoints: 120, // Start with a few points for gamification engagement
    streak: 2, // Start with a 2-day streak to incentivize keeping it up
    lastLogDate: getTodayDateString(),
    weatherContext: "sunny",
    distanceContext: 5.0,
    unlockedBadges: [],
    gameScore: 0,
    gameStreak: 0,
    activeTab: "dashboard"
  };
  saveState();
}

function saveState() {
  localStorage.setItem("ecosphere_state", JSON.stringify(state));
}

// Helper: Get date string (YYYY-MM-DD)
function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

// Initial UI Setup
function initApp() {
  // Setup tabs
  switchTab(state.activeTab || 'dashboard');
  
  // Set UI values
  updateSidebarStats();
  updateDashboardUI();
  calculateFormPreview();
  renderBadgesGrid();
  
  // Initialize AI chatbot welcomes
  initChatBot();
  
  // Set context sliders/buttons in UI
  document.getElementById("context-distance").value = state.distanceContext;
  document.getElementById("distance-val").innerText = state.distanceContext.toFixed(1) + " miles";
  setWeatherUI(state.weatherContext);
}

// ==========================================================================
// NAVIGATION TAB CONTROLLER
// ==========================================================================
function switchTab(tabId) {
  state.activeTab = tabId;
  saveState();
  
  // Deactivate all nav buttons and panels
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));
  
  // Activate selected elements
  const activeBtn = document.getElementById(`nav-${tabId}`);
  const activePanel = document.getElementById(`tab-${tabId}`);
  
  if (activeBtn) activeBtn.classList.add("active");
  if (activePanel) activePanel.classList.add("active");
  
  // Special action on entering assistant to update quick replies
  if (tabId === "assistant") {
    updateAssistantQuickReplies();
    // Scroll chat to bottom
    const chatBox = document.getElementById("chat-messages");
    setTimeout(() => chatBox.scrollTop = chatBox.scrollHeight, 50);
  }
  
  // Render games tab or badges tab freshly
  if (tabId === "badges") {
    renderBadgesGrid();
  }
}

// ==========================================================================
// CORE CALCULATIONS
// ==========================================================================

// Calculate emissions in kg CO2
function calculateEmissions(type, distance, passengers) {
  const factor = EMISSION_FACTORS[type] || 0.20;
  return (factor * distance) / passengers;
}

// Calculate carbon savings relative to a standard gas car with same passengers
function calculateSavings(type, distance, passengers) {
  if (type === "gas_car") return 0;
  const gasEmissions = (EMISSION_FACTORS.gas_car * distance) / passengers;
  const transitEmissions = calculateEmissions(type, distance, passengers);
  return Math.max(0, gasEmissions - transitEmissions);
}

// Calculate points gained for travel logs
function calculatePointsGained(type, distance) {
  let basePoints = 10; // 10 base points for logging
  
  // Green bonuses
  let bonus = 0;
  if (type === "walk_bike") bonus = 50; // Active travel bonus
  else if (type === "escooter") bonus = 20;
  else if (type === "transit_train" || type === "transit_bus") bonus = 15;
  else if (type === "electric_car") bonus = 10;
  
  // Distance bonus (1 point per mile)
  let distBonus = Math.floor(distance);
  
  // Streak multiplier
  let multiplier = 1.0;
  if (state.streak >= 7) multiplier = 1.5;
  else if (state.streak >= 3) multiplier = 1.2;
  
  return Math.round((basePoints + bonus + distBonus) * multiplier);
}

// ==========================================================================
// GAMIFICATION: BADGES ENGINE
// ==========================================================================

// Check and trigger badge unlocks
function checkBadgeUnlocks() {
  let newlyUnlocked = [];
  
  // Total stats calculators
  const totalSavings = state.logs.reduce((sum, log) => sum + parseFloat(log.savings), 0);
  const activeTripsCount = state.logs.filter(log => log.type === "walk_bike").length;
  
  BADGES.forEach(badge => {
    // Skip if already unlocked
    if (state.unlockedBadges.includes(badge.id)) return;
    
    let isEligible = false;
    
    switch (badge.id) {
      case "first_step":
        isEligible = state.logs.length >= 1;
        break;
      case "streak_3":
        isEligible = state.streak >= 3;
        break;
      case "streak_7":
        isEligible = state.streak >= 7;
        break;
      case "points_200":
        isEligible = state.ecoPoints >= 200;
        break;
      case "quiz_5":
        isEligible = state.gameScore >= 5; // Total correct answers
        break;
      case "saving_50":
        isEligible = totalSavings >= 50.0;
        break;
      case "zero_emissions":
        isEligible = activeTripsCount >= 3;
        break;
      case "carpool_master":
        isEligible = state.logs.some(log => log.passengers >= 3);
        break;
    }
    
    if (isEligible) {
      state.unlockedBadges.push(badge.id);
      newlyUnlocked.push(badge);
    }
  });
  
  if (newlyUnlocked.length > 0) {
    saveState();
    // Trigger unlock effects for the first unlocked badge
    triggerAchievementToast(newlyUnlocked[0]);
    // Add points for unlocking achievement (+100 Eco-Points!)
    awardPoints(100 * newlyUnlocked.length, "Achievement Unlocked!");
  }
}

// Award points and show visual animation
function awardPoints(pts, reason) {
  state.ecoPoints += pts;
  saveState();
  
  updateSidebarStats();
  updateDashboardUI();
  
  // Trigger floating points animation
  triggerFloatingPoints(pts);
}

// Floating points micro-animation
function triggerFloatingPoints(pts) {
  const floater = document.getElementById("points-floater");
  if (!floater) return;
  
  floater.innerText = `+${pts} 🌱`;
  floater.style.left = `${window.innerWidth / 2 - 30}px`;
  floater.style.top = `${window.innerHeight / 2}px`;
  
  floater.classList.remove("animate-float-up");
  void floater.offsetWidth; // Force reflow
  floater.classList.add("animate-float-up");
}

// Toast achievement unlock
function triggerAchievementToast(badge) {
  const toast = document.getElementById("achievement-toast");
  const title = document.getElementById("toast-title");
  const desc = document.getElementById("toast-desc");
  
  if (!toast) return;
  
  title.innerText = `Achievement Unlocked! (+100 XP)`;
  desc.innerText = `${badge.title} - ${badge.desc}`;
  
  toast.classList.remove("hidden");
  
  // Play short sound equivalent or alert
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 4500);
}

// Render badges grid inside UI
function renderBadgesGrid() {
  const grid = document.getElementById("badges-grid");
  if (!grid) return;
  
  grid.innerHTML = "";
  
  BADGES.forEach(badge => {
    const isUnlocked = state.unlockedBadges.includes(badge.id);
    const badgeCard = document.createElement("div");
    badgeCard.className = `badge-card ${isUnlocked ? 'unlocked' : 'locked'}`;
    
    // Choose appropriate visual material icon for badge
    let iconName = badge.id === "first_step" ? "emoji_footprints" : badge.icon;
    if (badge.id === "first_step") iconName = "footprint"; // fallback
    if (badge.id === "saving_50") iconName = "forest";
    if (badge.id === "quiz_5") iconName = "school";
    if (badge.id === "zero_emissions") iconName = "directions_bike";
    if (badge.id === "carpool_master") iconName = "groups";
    if (badge.id === "points_200") iconName = "spa";
    
    badgeCard.innerHTML = `
      <div class="badge-icon-holder">
        <span class="material-icons-round badge-icon">${iconName}</span>
      </div>
      <h4>${badge.title}</h4>
      <p>${badge.desc}</p>
      <small class="form-help">${isUnlocked ? '✓ Unlocked' : 'Locked'}</small>
    `;
    grid.appendChild(badgeCard);
  });
}

// ==========================================================================
// DASHBOARD & ANALYTICS UPDATES
// ==========================================================================

function updateSidebarStats() {
  document.getElementById("sidebar-streak").innerText = `${state.streak} Days`;
  document.getElementById("sidebar-points").innerText = state.ecoPoints;
}

function updateDashboardUI() {
  // Calculate statistics from logs
  const totalEmitted = state.logs.reduce((sum, log) => sum + parseFloat(log.emissions), 0);
  const totalSaved = state.logs.reduce((sum, log) => sum + parseFloat(log.savings), 0);
  
  // Weekly progress
  const emittedWeek = totalEmitted; // Simulating all logs in localStorage are from current week
  const budgetRemaining = Math.max(0, WEEKLY_BUDGET_LIMIT - emittedWeek);
  const budgetPct = Math.round((budgetRemaining / WEEKLY_BUDGET_LIMIT) * 100);
  
  // Equivalency: 1 mature tree absorbs ~22kg of CO2 per year (1.83kg per month)
  // Let's express trees as "Annual absorption of X trees saved"
  const treesEquivalent = totalSaved / 22.0;
  
  // Update header chips
  document.getElementById("header-co2-saved").innerText = `${totalSaved.toFixed(1)} kg`;
  document.getElementById("header-budget-pct").innerText = `${budgetPct}%`;
  
  // Update dashboard stat cards
  document.getElementById("card-total-emitted").innerText = `${emittedWeek.toFixed(2)} kg`;
  document.getElementById("card-trees").innerText = treesEquivalent.toFixed(2);
  
  // Update weekly budget bars
  document.getElementById("lbl-emitted").innerText = `${emittedWeek.toFixed(1)} kg emitted`;
  const progressBar = document.getElementById("budget-progress");
  const progressPct = Math.min(100, (emittedWeek / WEEKLY_BUDGET_LIMIT) * 100);
  progressBar.style.width = `${progressPct}%`;
  
  // Color code progress bar: green when low emissions, amber/red as we approach budget limit
  if (progressPct >= 90) {
    progressBar.style.background = "var(--color-red)";
  } else if (progressPct >= 70) {
    progressBar.style.background = "var(--color-yellow)";
  } else {
    progressBar.style.background = "linear-gradient(90deg, var(--color-green) 0%, var(--color-cyan) 100%)";
  }
  
  // Update radial remaining percentage
  document.getElementById("radial-percent").innerText = `${budgetPct}%`;
  const radialFill = document.getElementById("radial-progress");
  if (radialFill) {
    // SVG radial perimeter mapping
    const dashArrayVal = Math.max(0, Math.min(100, budgetPct));
    radialFill.setAttribute("stroke-dasharray", `${dashArrayVal}, 100`);
    
    // Change radial circle color too
    if (budgetPct <= 10) radialFill.style.stroke = "var(--color-red)";
    else if (budgetPct <= 30) radialFill.style.stroke = "var(--color-yellow)";
    else radialFill.style.stroke = "var(--color-cyan)";
  }
  
  // Re-render recent logs table
  renderLogsTable();
  
  // Re-render daily charts
  renderDailyChart();
}

// Log table render
function renderLogsTable() {
  const tbody = document.getElementById("activity-tbody");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  
  if (state.logs.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-state-row">
        <td colspan="5">No logs yet this week. Use "Log Activity" or chat with EcoGuide to get started!</td>
      </tr>
    `;
    return;
  }
  
  // Show last 6 logs chronologically reversed (newest first)
  const displayLogs = [...state.logs].reverse().slice(0, 6);
  
  displayLogs.forEach(log => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="table-mode-cell">
          <span class="material-icons-round table-mode-icon icon-cyan">${MODE_ICONS[log.type] || 'directions_run'}</span>
          <span>${MODE_NAMES[log.type]}</span>
        </div>
      </td>
      <td>${log.distance} mi</td>
      <td class="text-red font-semibold">${parseFloat(log.emissions).toFixed(2)} kg</td>
      <td class="text-green font-semibold">+${parseFloat(log.savings).toFixed(2)} kg</td>
      <td>
        <button class="btn-delete" onclick="deleteLog('${log.id}')" title="Delete log">
          <span class="material-icons-round">delete</span>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteLog(logId) {
  state.logs = state.logs.filter(log => log.id !== logId);
  saveState();
  
  // Refresh UI
  updateDashboardUI();
}

// Dynamic SVG/HTML Bar Chart Generation
// Groups carbon emissions by transit mode to see what mode emits the most
function renderDailyChart() {
  const container = document.getElementById("bar-chart-container");
  if (!container) return;
  
  container.innerHTML = "";
  
  // Group logs emissions by Transit Mode
  const modeData = {
    gas_car: 0,
    hybrid_car: 0,
    electric_car: 0,
    transit_bus: 0,
    transit_train: 0,
    escooter: 0,
    walk_bike: 0
  };
  
  state.logs.forEach(log => {
    if (modeData[log.type] !== undefined) {
      modeData[log.type] += parseFloat(log.emissions);
    }
  });
  
  // Find max emissions for height scaling
  const maxEmissions = Math.max(...Object.values(modeData), 5.0); // minimum scale is 5kg
  
  const modes = Object.keys(modeData);
  
  modes.forEach(mode => {
    const totalEmitted = modeData[mode];
    const pctHeight = (totalEmitted / maxEmissions) * 100;
    
    // Choose specific colors for different bars
    let barColor = "var(--color-cyan)";
    if (mode === "gas_car") barColor = "var(--color-red)";
    else if (mode === "hybrid_car") barColor = "var(--color-yellow)";
    else if (mode === "walk_bike") barColor = "var(--color-green)";
    
    const barGroup = document.createElement("div");
    barGroup.className = "chart-bar-group";
    
    // Short label code
    let label = "Car";
    if (mode === "electric_car") label = "EV";
    else if (mode === "hybrid_car") label = "Hyb";
    else if (mode === "transit_bus") label = "Bus";
    else if (mode === "transit_train") label = "Train";
    else if (mode === "escooter") label = "Scoot";
    else if (mode === "walk_bike") label = "Active";
    
    barGroup.innerHTML = `
      <div class="chart-bar-fill" style="height: ${Math.max(4, pctHeight)}%; background-color: ${barColor}">
        <div class="chart-tooltip">${totalEmitted.toFixed(1)} kg CO₂</div>
      </div>
      <span class="chart-lbl-below">${label}</span>
    `;
    
    container.appendChild(barGroup);
  });
}

// ==========================================================================
// LOG ACTIVITY FORM HANDLERS
// ==========================================================================

function calculateFormPreview() {
  const type = document.getElementById("travel-type").value;
  const distance = parseFloat(document.getElementById("travel-distance").value) || 0;
  const passengers = parseInt(document.getElementById("travel-passengers").value) || 1;
  const repeat = parseInt(document.getElementById("travel-repeat").value) || 1;
  
  const totalDistance = distance * repeat;
  
  const emissions = calculateEmissions(type, totalDistance, passengers);
  const savings = calculateSavings(type, totalDistance, passengers);
  const points = calculatePointsGained(type, totalDistance);
  
  // Update Preview panel DOM
  document.getElementById("preview-co2").innerText = `${emissions.toFixed(2)} kg`;
  document.getElementById("preview-saved").innerText = `${savings.toFixed(2)} kg`;
  document.getElementById("preview-points").innerText = `+${points} Eco-Points will be earned`;
}

function handleLogForm(event) {
  event.preventDefault();
  
  const type = document.getElementById("travel-type").value;
  const distance = parseFloat(document.getElementById("travel-distance").value);
  const passengers = parseInt(document.getElementById("travel-passengers").value);
  const repeat = parseInt(document.getElementById("travel-repeat").value);
  
  if (isNaN(distance) || distance <= 0) return;
  
  const totalDistance = distance * repeat;
  const emissions = calculateEmissions(type, totalDistance, passengers);
  const savings = calculateSavings(type, totalDistance, passengers);
  const points = calculatePointsGained(type, totalDistance);
  
  // Create log entry
  const newLog = {
    id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    date: getTodayDateString(),
    type: type,
    distance: totalDistance,
    passengers: passengers,
    emissions: emissions.toFixed(3),
    savings: savings.toFixed(3)
  };
  
  // Update streak logic
  updateStreakOnLog();
  
  // Save log and points
  state.logs.push(newLog);
  state.ecoPoints += points;
  saveState();
  
  // Trigger animations
  awardPoints(points, "Travel Logged");
  checkBadgeUnlocks();
  
  // Reset form
  resetLogForm();
  
  // Shift view to Dashboard tab
  switchTab("dashboard");
}

function resetLogForm() {
  document.getElementById("log-form").reset();
  document.getElementById("travel-passengers").value = 1;
  calculateFormPreview();
}

function updateStreakOnLog() {
  const todayStr = getTodayDateString();
  
  if (state.lastLogDate === "") {
    state.streak = 1;
  } else {
    const lastDate = new Date(state.lastLogDate);
    const today = new Date(todayStr);
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Logged on consecutive day
      state.streak += 1;
    } else if (diffDays > 1) {
      // Gap in logging, reset streak to 1
      state.streak = 1;
    }
    // If diffDays is 0, they already logged today, streak stays the same
  }
  state.lastLogDate = todayStr;
  saveState();
  updateSidebarStats();
}

// ==========================================================================
// CONTEXT-AWARE SMART ASSISTANT (ECOGUIDE)
// ==========================================================================

function setWeather(weatherType) {
  state.weatherContext = weatherType;
  saveState();
  setWeatherUI(weatherType);
  
  // Re-generate chatbot options and quick replies
  updateAssistantQuickReplies();
  
  // Append contextual system notice in chat
  appendBotMessage(`*System update*: Simulated weather set to **${weatherType.toUpperCase()}**. Travel recommendations updated.`);
}

function setWeatherUI(weatherType) {
  document.querySelectorAll(".weather-btn").forEach(btn => btn.classList.remove("active"));
  const activeBtn = document.getElementById(`weather-${weatherType}`);
  if (activeBtn) activeBtn.classList.add("active");
}

function updateDistanceContext(val) {
  const numVal = parseFloat(val);
  state.distanceContext = numVal;
  saveState();
  
  document.getElementById("distance-val").innerText = `${numVal.toFixed(1)} miles`;
  updateAssistantQuickReplies();
}

// Initialize chat window
function initChatBot() {
  const chatBox = document.getElementById("chat-messages");
  if (!chatBox) return;
  
  chatBox.innerHTML = "";
  
  // Append initial warm greeting
  appendBotMessage(`Hello! I'm **EcoGuide**, your smart carbon footprint assistant. 🌐<br><br>I analyze your environmental variables (like the current **weather** and **distance** in the sidebar) to guide you toward carbon-neutral commuting.<br><br>Where are you traveling today? Type a location or click a quick reply below!`);
  
  updateAssistantQuickReplies();
}

function clearChat() {
  initChatBot();
}

// Append a message to the chat
function appendBotMessage(htmlContent, actionOptions = null) {
  const chatBox = document.getElementById("chat-messages");
  if (!chatBox) return;
  
  const msgDiv = document.createElement("div");
  msgDiv.className = "message bot";
  
  msgDiv.innerHTML = `
    <div class="message-meta">EcoGuide • Just now</div>
    <div class="message-bubble">${htmlContent}</div>
  `;
  
  chatBox.appendChild(msgDiv);
  
  // If there are action options (buttons inside bubble)
  if (actionOptions && actionOptions.length > 0) {
    const actionBubble = document.createElement("div");
    actionBubble.className = "message-actions-bubble";
    actionBubble.innerHTML = `<span class="action-bubble-title">Select commute to log instantly:</span>`;
    
    const optionsList = document.createElement("div");
    optionsList.className = "action-options-list";
    
    actionOptions.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "chat-log-btn";
      
      const co2Val = calculateEmissions(opt.type, opt.distance, 1);
      const ptsEarned = calculatePointsGained(opt.type, opt.distance);
      
      btn.innerHTML = `
        <div class="chat-log-btn-left">
          <span class="material-icons-round">${MODE_ICONS[opt.type]}</span>
          <span>${MODE_NAMES[opt.type]} (${opt.distance} mi)</span>
        </div>
        <div class="chat-log-btn-right">
          <span class="text-red">${co2Val.toFixed(1)} kg CO₂</span>
          <span class="badge-pts-gain">+${ptsEarned} pts</span>
        </div>
      `;
      
      btn.onclick = () => logTripFromAssistant(opt.type, opt.distance, ptsEarned, btn);
      optionsList.appendChild(btn);
    });
    
    actionBubble.appendChild(optionsList);
    msgDiv.appendChild(actionBubble);
  }
  
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendUserMessage(text) {
  const chatBox = document.getElementById("chat-messages");
  if (!chatBox) return;
  
  const msgDiv = document.createElement("div");
  msgDiv.className = "message user";
  msgDiv.innerHTML = `
    <div class="message-meta">You • Just now</div>
    <div class="message-bubble"></div>
  `;
  
  // Prevent XSS by using textContent for raw user-provided input
  msgDiv.querySelector(".message-bubble").textContent = text;
  
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Handle action buttons logged directly from chat
function logTripFromAssistant(type, distance, pts, buttonElement) {
  // Mark button as logged
  buttonElement.classList.add("logged");
  buttonElement.innerHTML = `
    <div class="chat-log-btn-left">
      <span class="material-icons-round">check_circle</span>
      <span>Logged successfully!</span>
    </div>
    <div class="chat-log-btn-right">
      <span>🌱 +${pts} pts</span>
    </div>
  `;
  
  // Calculations
  const emissions = calculateEmissions(type, distance, 1);
  const savings = calculateSavings(type, distance, 1);
  
  // Log entry
  const newLog = {
    id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    date: getTodayDateString(),
    type: type,
    distance: distance,
    passengers: 1,
    emissions: emissions.toFixed(3),
    savings: savings.toFixed(3)
  };
  
  // Update state
  updateStreakOnLog();
  state.logs.push(newLog);
  state.ecoPoints += pts;
  saveState();
  
  // Animations & unlock checks
  triggerFloatingPoints(pts);
  checkBadgeUnlocks();
  updateDashboardUI();
  
  // Bot responses with confirmation
  setTimeout(() => {
    appendBotMessage(`Awesome decision! Logged **${distance} miles** via **${MODE_NAMES[type]}**. <br>✨ You saved **${savings.toFixed(2)} kg CO₂** and earned **${pts} Eco-Points**!`);
  }, 600);
}

// Generate dynamic quick suggestions based on distance & weather contexts
function updateAssistantQuickReplies() {
  const container = document.getElementById("quick-replies");
  if (!container) return;
  
  container.innerHTML = "";
  
  const dist = state.distanceContext;
  
  // Standard replies
  const replies = [
    { text: `Plan trip for ${dist} mi`, action: "plan" },
    { text: "Check budget status", action: "budget" },
    { text: "Carbon footprint tips", action: "tips" }
  ];
  
  replies.forEach(rep => {
    const btn = document.createElement("button");
    btn.className = "quick-reply-btn";
    btn.innerText = rep.text;
    btn.onclick = () => handleQuickReply(rep.action);
    container.appendChild(btn);
  });
}

function handleQuickReply(action) {
  if (action === "plan") {
    appendUserMessage(`I want to plan a commute of ${state.distanceContext} miles.`);
    showAssistantResponse(`plan_${state.weatherContext}_${state.distanceContext}`);
  } else if (action === "budget") {
    appendUserMessage("How is my weekly carbon budget doing?");
    showAssistantResponse("budget");
  } else if (action === "tips") {
    appendUserMessage("Give me some tips to reduce my transport footprint.");
    showAssistantResponse("tips");
  }
}

// Parse user text input
function handleChatSubmit(event) {
  event.preventDefault();
  
  const input = document.getElementById("chat-input");
  const query = input.value.trim();
  if (query === "") return;
  
  appendUserMessage(query);
  input.value = "";
  
  // Show typing indicator
  const typing = document.getElementById("chat-typing");
  typing.classList.remove("hidden");
  
  // Analyze query (simple NLP matching)
  setTimeout(() => {
    typing.classList.add("hidden");
    parseUserQuery(query);
  }, 1000);
}

function parseUserQuery(query) {
  const text = query.toLowerCase();
  
  if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
    appendBotMessage("Hello there! How can I assist you with your green commuting today? You can tell me details like 'I want to travel 5 miles' or ask for general tips!");
  } else if (text.includes("plan") || text.includes("commute") || text.includes("travel") || text.includes("go to") || text.includes("office") || text.includes("work")) {
    // Attempt to extract distance from query, otherwise use context slider distance
    let dist = state.distanceContext;
    const match = text.match(/\b\d+(\.\d+)?\b/);
    if (match) {
      dist = parseFloat(match[0]);
    }
    showAssistantResponse(`plan_${state.weatherContext}_${dist}`);
  } else if (text.includes("budget") || text.includes("track") || text.includes("progress")) {
    showAssistantResponse("budget");
  } else if (text.includes("tips") || text.includes("how to reduce") || text.includes("carbon")) {
    showAssistantResponse("tips");
  } else if (text.includes("points") || text.includes("streak") || text.includes("score")) {
    appendBotMessage(`You currently have **${state.ecoPoints} Eco-Points** 🌱 and an active logging streak of **${state.streak} Days**! 🔥<br><br>Keep logging low-carbon journeys to earn multiplier bonuses and unlock achievements in the Badges tab.`);
  } else {
    // Default reply
    appendBotMessage(`I'm not fully sure I understood that commute destination, but I can help you plan! <br><br>Based on your active context variables (Weather: **${state.weatherContext}**, Distance: **${state.distanceContext} mi**), here are the best options for your trip:`, [
      { type: "walk_bike", distance: state.distanceContext },
      { type: "escooter", distance: state.distanceContext },
      { type: "transit_bus", distance: state.distanceContext }
    ]);
  }
}

// Logic Context engine response selection
function showAssistantResponse(key) {
  // Parsing planning queries
  if (key.startsWith("plan_")) {
    const parts = key.split("_");
    const weather = parts[1];
    const dist = parseFloat(parts[2]);
    
    // Core decision tree based on Weather & Distance
    if (weather === "sunny") {
      if (dist <= 3.0) {
        appendBotMessage(
          `☀️ **Sunny Weather & Short Distance Alert** (${dist} mi)!<br><br>Since the weather is perfect and your trip is short, **active transit** is your absolute best option. Riding a bicycle or walking produces **zero emissions** and gives you a major active bonus!`,
          [
            { type: "walk_bike", distance: dist },
            { type: "escooter", distance: dist },
            { type: "transit_bus", distance: dist }
          ]
        );
      } else if (dist <= 10.0) {
        appendBotMessage(
          `☀️ **Sunny & Moderate Commute** (${dist} mi).<br><br>Biking is still highly viable if you have time. Otherwise, taking the **Public Bus or Train** keeps carbon emissions extremely low compared to driving. If you must drive, choose an **Electric Vehicle**!`,
          [
            { type: "transit_train", distance: dist },
            { type: "transit_bus", distance: dist },
            { type: "electric_car", distance: dist },
            { type: "gas_car", distance: dist }
          ]
        );
      } else {
        appendBotMessage(
          `☀️ **Sunny & Long Highway Journey** (${dist} mi).<br><br>Because of the long distance, we suggest taking the **Commuter Train** to completely bypass highway gridlock and emit only a fraction of the greenhouse gases. If driving, please carpool or ride an **EV**!`,
          [
            { type: "transit_train", distance: dist },
            { type: "electric_car", distance: dist },
            { type: "hybrid_car", distance: dist },
            { type: "gas_car", distance: dist }
          ]
        );
      }
    } 
    else if (weather === "rainy") {
      if (dist <= 3.0) {
        appendBotMessage(
          `🌧️ **Rainy Commute Warning** (${dist} mi).<br><br>It's raining outside, so walking or biking is uncomfortable. To keep dry while staying eco-friendly, take **Public Transit** (Bus/Train) or use an **Electric Vehicle** ride pool.`,
          [
            { type: "transit_bus", distance: dist },
            { type: "transit_train", distance: dist },
            { type: "electric_car", distance: dist },
            { type: "gas_car", distance: dist }
          ]
        );
      } else {
        appendBotMessage(
          `🌧️ **Rainy & Long Trip** (${dist} mi).<br><br>Wet highway driving increases road risk and fuel drag. Taking the **Commuter Train** is the safest and lowest-carbon option in this downpour!`,
          [
            { type: "transit_train", distance: dist },
            { type: "electric_car", distance: dist },
            { type: "hybrid_car", distance: dist },
            { type: "gas_car", distance: dist }
          ]
        );
      }
    } 
    else if (weather === "snowy") {
      appendBotMessage(
        `❄️ **Freezing Cold / Snow Warning** (${dist} mi).<br><br>Active commuting is unsafe due to ice. Taking a **Commuter Train** is highly recommended as rail lines are regularly cleared and emit minimal CO₂. Alternatively, carpool to reduce per-person impact in heavy traffic.`,
        [
          { type: "transit_train", distance: dist },
          { type: "transit_bus", distance: dist },
          { type: "hybrid_car", distance: dist },
          { type: "gas_car", distance: dist }
        ]
      );
    }
  } 
  
  else if (key === "budget") {
    const totalEmitted = state.logs.reduce((sum, log) => sum + parseFloat(log.emissions), 0);
    const remaining = Math.max(0, WEEKLY_BUDGET_LIMIT - totalEmitted);
    
    if (totalEmitted === 0) {
      appendBotMessage(`Your weekly carbon budget is fresh! You have **${WEEKLY_BUDGET_LIMIT} kg** available. Log a commute to see your analytics update!`);
    } else if (remaining > 10) {
      appendBotMessage(`You are doing great! You've emitted **${totalEmitted.toFixed(1)} kg CO₂** this week. You have **${remaining.toFixed(1)} kg** remaining in your budget. You are well on track to hit your targets!`);
    } else if (remaining > 0) {
      appendBotMessage(`⚠️ **Budget Warning!** You've used **${totalEmitted.toFixed(1)} kg CO₂** of your weekly 40.0 kg limit. You only have **${remaining.toFixed(1)} kg** left. Consider walking, biking, or taking the train for the next few days!`);
    } else {
      appendBotMessage(`🚨 **Over Budget!** You have exceeded your weekly target by **${(totalEmitted - WEEKLY_BUDGET_LIMIT).toFixed(1)} kg CO₂**. Don't worry, reset your goals by focusing strictly on zero-emission biking or bus transit for the rest of the week!`);
    }
  } 
  
  else if (key === "tips") {
    appendBotMessage(`Here are **3 practical transit actions** to instantly lower your personal carbon footprint:<br><br>1. **Shift 1 Commute to Rail/Bus**: Changing just one 10-mile daily drive to public transit prevents 4 kg of CO2 from entering the atmosphere.<br>2. **Active Travel for Short Trips**: Over 50% of urban car trips are under 3 miles. Walk or bike these instead—it's zero emissions and keeps you fit!<br>3. **Drive Smarter**: Carpooling with one colleague instantly cuts your drive emissions by 50%. Regular tire checks and smooth accelerating improve fuel economy by up to 15%.`);
  }
}

// ==========================================================================
// CARBON CLASH MINI-GAME LOGIC
// ==========================================================================

let activeGameRound = {
  cardA: null,
  cardB: null
};

function startGame() {
  document.getElementById("game-intro").classList.add("hidden");
  document.getElementById("game-play").classList.remove("hidden");
  
  state.gameScore = 0;
  state.gameStreak = 0;
  
  updateGameHUD();
  loadNewClashRound();
}

function updateGameHUD() {
  document.getElementById("game-score").innerText = state.gameScore;
  document.getElementById("game-streak").innerText = `🔥 ${state.gameStreak}`;
}

function loadNewClashRound() {
  // Clear overlays
  const feedback = document.getElementById("game-feedback");
  feedback.classList.add("hidden");
  feedback.classList.remove("wrong");
  
  // Reset card styles
  document.getElementById("card-a-co2-box").classList.add("hidden");
  document.getElementById("card-b-co2-box").classList.add("hidden");
  document.getElementById("clash-buttons").classList.remove("hidden");
  document.getElementById("card-b").classList.add("interactive-clash-card");
  
  // Select two unique random items from dataset
  let indexA = Math.floor(Math.random() * GAME_ITEMS.length);
  let indexB = Math.floor(Math.random() * GAME_ITEMS.length);
  
  // Make sure they are not the same item
  while (indexA === indexB) {
    indexB = Math.floor(Math.random() * GAME_ITEMS.length);
  }
  
  activeGameRound.cardA = GAME_ITEMS[indexA];
  activeGameRound.cardB = GAME_ITEMS[indexB];
  
  // Populate Card A (Left - Revealed)
  document.getElementById("card-a-title").innerText = activeGameRound.cardA.title;
  document.getElementById("card-a-desc").innerText = activeGameRound.cardA.desc;
  document.getElementById("card-a-co2").innerText = `${activeGameRound.cardA.co2.toFixed(2)} kg`;
  document.getElementById("card-a-co2-box").classList.remove("hidden");
  
  const iconA = document.getElementById("card-a-icon");
  iconA.innerText = activeGameRound.cardA.icon || "devices";
  
  // Populate Card B (Right - Hidden emissions)
  document.getElementById("card-b-title").innerText = activeGameRound.cardB.title;
  document.getElementById("card-b-desc").innerText = activeGameRound.cardB.desc;
  document.getElementById("card-b-co2").innerText = `${activeGameRound.cardB.co2.toFixed(2)} kg`;
  
  const iconB = document.getElementById("card-b-icon");
  iconB.innerText = activeGameRound.cardB.icon || "shopping_bag";
}

function makeGuess(guess) {
  // Hide choice buttons, reveal card B's emissions
  document.getElementById("clash-buttons").classList.add("hidden");
  document.getElementById("card-b-co2-box").classList.remove("hidden");
  document.getElementById("card-b").classList.remove("interactive-clash-card");
  
  const co2A = activeGameRound.cardA.co2;
  const co2B = activeGameRound.cardB.co2;
  
  let isCorrect = false;
  if (guess === "higher" && co2B >= co2A) isCorrect = true;
  if (guess === "lower" && co2B <= co2A) isCorrect = true;
  
  const feedback = document.getElementById("game-feedback");
  const headline = document.getElementById("feedback-headline");
  const expl = document.getElementById("feedback-explanation");
  
  if (isCorrect) {
    state.gameScore += 1;
    state.gameStreak += 1;
    headline.innerText = "Correct! 🎉";
    expl.innerHTML = `**${activeGameRound.cardB.title}** emits **${co2B.toFixed(2)} kg CO₂e**, which is indeed ${guess === 'higher' ? 'more' : 'less'} than **${activeGameRound.cardA.title}** (${co2A.toFixed(2)} kg).<br><br>${activeGameRound.cardB.explanation}`;
    feedback.classList.remove("wrong");
    
    // Reward points for correct guess (+10 points)
    awardPoints(10, "Correct Quiz Guess");
    checkBadgeUnlocks();
  } else {
    state.gameStreak = 0;
    headline.innerText = "Incorrect 😅";
    expl.innerHTML = `Actually, **${activeGameRound.cardB.title}** emits **${co2B.toFixed(2)} kg CO₂e**, which is ${guess === 'higher' ? 'less' : 'more'} than **${activeGameRound.cardA.title}** (${co2A.toFixed(2)} kg).<br><br>${activeGameRound.cardB.explanation}`;
    feedback.classList.add("wrong");
  }
  
  updateGameHUD();
  feedback.classList.remove("hidden");
}

function nextRound() {
  loadNewClashRound();
}
