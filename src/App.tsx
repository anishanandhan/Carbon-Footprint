import React, { useState, useEffect, useRef } from 'react';
import {
  Leaf,
  Flame,
  Award,
  Plus,
  Trash2,
  Send,
  RefreshCw,
  Sun,
  CloudRain,
  Snowflake,
  Info,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Car,
  Bus,
  Train,
  Bike,
  Sparkle,
  Gamepad2,
  LayoutDashboard,
  Tv,
  ShoppingBag,
  Mail,
  Shirt,
  UtensilsCrossed,
  Droplet,
  LogOut
} from 'lucide-react';
import {
  MODE_NAMES,
  calculateEmissions,
  calculateSavings,
  calculatePoints,
  generateUniqueId,
  analyzeCommuteFootprint,
  BENCHMARKS,
  type Insight,
  type Category,
  EMISSION_FACTORS_LIST,
  getCategoryForType
} from './utils';

// ==========================================================================
// TYPES & CONSTANTS
// ==========================================================================

export interface LogEntry {
  id: string;
  date: string;
  type: string;
  distance: number;
  passengers: number;
  emissions: number;
  savings: number;
  note?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  actionOptions?: Array<{ type: string; distance: number }>;
}

export interface GameItem {
  title: string;
  desc: string;
  co2: number;
  iconName: string;
  explanation: string;
}

export interface DailyAction {
  id: string;
  text: string;
  completed: boolean;
  pts: number;
}

const WEEKLY_BUDGET_LIMIT = 40.0; // kg CO2

const BADGES = [
  { id: "first_step", title: "First Step", desc: "Logged your first travel activity", criteria: "Log any trip" },
  { id: "streak_3", title: "Consistent Eco-Friend", desc: "Reach a 3-day travel logging streak", criteria: "3-day streak" },
  { id: "streak_7", title: "Green Champion", desc: "Reach a 7-day travel logging streak", criteria: "7-day streak" },
  { id: "points_200", title: "Eco Enthusiast", desc: "Earn a total of 200 Eco-Points", criteria: "200 points" },
  { id: "quiz_5", title: "Carbon Scholar", desc: "Get 5 correct answers in Carbon Clash", criteria: "5 quiz wins" },
  { id: "saving_50", title: "Planet Protector", desc: "Save 50.0 kg of CO₂ vs gasoline car", criteria: "50kg saved" },
  { id: "zero_emissions", title: "Pedal Powerhouse", desc: "Log 3 active zero-emission trips (Bicycle/Walk)", criteria: "3 active trips" },
  { id: "carpool_master", title: "Carpool Pioneer", desc: "Log a trip sharing a ride with 3+ passengers", criteria: "3+ passengers log" }
];

const GAME_ITEMS = [
  { title: "Streaming HD Video", desc: "for 10 hours in 1080p", co2: 0.40, iconName: "Tv", explanation: "Data centers processing video streams consume electricity. 10 hours equal ~0.40kg of CO2." },
  { title: "Manufacturing 10 Plastic Bags", desc: "single-use shopping bags", co2: 0.33, iconName: "ShoppingBag", explanation: "Plastic bags require petroleum and heat to manufacture, emitting ~0.033kg per bag." },
  { title: "Eating a Beef Hamburger", desc: "one 1/4 lb beef patty", co2: 2.50, iconName: "Utensils", explanation: "Livestock farming produces vast amounts of methane and requires land clearing, leading to high emissions." },
  { title: "Eating a Plant-Based Burger", desc: "one soy/pea protein patty", co2: 0.15, iconName: "Leaf", explanation: "Plant-based proteins require 90% fewer greenhouse gas emissions compared to beef." },
  { title: "Flying on a Jet Flight", desc: "airline seat for 100 miles", co2: 25.00, iconName: "Plane", explanation: "Jet fuel burning in the upper atmosphere makes flying highly greenhouse gas intensive." },
  { title: "Driving a Gas Car", desc: "standard commute for 100 miles", co2: 20.00, iconName: "Car", explanation: "Standard gasoline cars produce about 0.20kg of CO2 per mile, totaling 20kg over 100 miles." },
  { title: "Buying 1 New Cotton T-shirt", desc: "grow, spin, dye, and distribute", co2: 8.30, iconName: "Shirt", explanation: "Dyeing, weaving, and global shipping of textiles is energy intensive." },
  { title: "Washing & Drying 5 Laundry Loads", desc: "warm wash, heated electric dryer", co2: 2.40, iconName: "Droplet", explanation: "The vast majority of laundry emissions come from the heating element of electric tumble dryers." },
  { title: "Sending 100 Emails", desc: "without heavy file attachments", co2: 0.40, iconName: "Mail", explanation: "Routing and storing data across servers uses continuous electrical power." },
  { title: "Cow's Milk Daily", desc: "drinking 1 cup daily for 1 year", co2: 229.00, iconName: "Utensils", explanation: "Dairy farming has a heavy carbon footprint due to cattle digestions (methane) and feed crop land use." }
];

const CustomLogo: React.FC<{ className?: string }> = ({ className = "h-5 w-auto" }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 256 256"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
    </defs>
    <path
      fill="url(#logoGrad)"
      d="M 160 88 L 194 34 L 216 0 L 256 0 L 256 40 L 221.5 93.5 L 200 128 L 256 128 L 256 256 L 96 256 L 96 168 L 64.246 220 L 40 256 L 0 256 L 0 216 L 34 162 L 56 128 L 0 128 L 0 0 L 160 0 Z"
    />
  </svg>
);

// ==========================================================================
// UTILITY HELPERS (Defined outside component for purity and testing)
// ==========================================================================

// Calculations and ID generators imported from './utils'

export function App() {
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  
  const loadStateValue = <T,>(key: string, defaultValue: T): T => {
    const saved = localStorage.getItem('ecosphere_react_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed[key] !== undefined) return parsed[key];
      } catch (e) {
        console.error("Error loading state key " + key, e);
      }
    }
    return defaultValue;
  };

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  const [logs, setLogs] = useState<LogEntry[]>(() => loadStateValue('logs', []));
  const [ecoPoints, setEcoPoints] = useState<number>(() => loadStateValue('ecoPoints', 120));
  const [streak, setStreak] = useState<number>(() => loadStateValue('streak', 2));
  const [lastLogDate, setLastLogDate] = useState<string>(() => loadStateValue('lastLogDate', new Date().toISOString().split('T')[0]));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => localStorage.getItem('ecosphere_logged_in') === 'true');
  
  const [email, setEmail] = useState<string>('eco@ecosphere.com');
  const [password, setPassword] = useState<string>('greenfuture');
  const [loginError, setLoginError] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'eco@ecosphere.com' && password === 'greenfuture') {
      setIsLoggedIn(true);
      localStorage.setItem('ecosphere_logged_in', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid email or password. Please use the demo credentials.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('ecosphere_logged_in');
    setEmail('');
    setPassword('');
  };
  
  const [weatherContext, setWeatherContext] = useState<string>(() => loadStateValue('weatherContext', 'sunny'));
  const [distanceContext, setDistanceContext] = useState<number>(() => loadStateValue('distanceContext', 5.0));

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg_welcome',
      sender: 'bot',
      text: `Hello! I'm EcoGuide, your personal mobility advisor. 🌿\n\nI assess your simulated active environmental variables (like the Weather and distance sliders in the sidebar) to guide you toward carbon-neutral commuting.\n\nWhere are you traveling today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const [chatInput, setChatInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  const [gameScore, setGameScore] = useState<number>(() => loadStateValue('gameScore', 0));
  const [gameStreak, setGameStreak] = useState<number>(() => loadStateValue('gameStreak', 0));
  const [gameActive, setGameActive] = useState<boolean>(false);
  
  const [cardA, setCardA] = useState<GameItem | null>(null);
  const [cardB, setCardB] = useState<GameItem | null>(null);
  const [guessMade, setGuessMade] = useState<boolean>(false);
  const [guessResult, setGuessResult] = useState<{ correct: boolean; explanation: string } | null>(null);
  
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(() => loadStateValue('unlockedBadges', []));
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);
  const [floatingPoints, setFloatingPoints] = useState<string | null>(null);
  
  const [formCategory, setFormCategory] = useState<Category>('transport');
  const [formType, setFormType] = useState<string>('car_petrol');
  const [formDistance, setFormDistance] = useState<string>('');
  const [formPassengers, setFormPassengers] = useState<number>(1);
  const [formRepeat, setFormRepeat] = useState<number>(1);
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [formNote, setFormNote] = useState<string>('');

  // Daily Eco-Actions Checklist state
  const [dailyActions, setDailyActions] = useState<DailyAction[]>(() => {
    const saved = localStorage.getItem('ecosphere_actions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading actions", e);
      }
    }
    return [
      { id: 'reusable_bag', text: 'Used reusable shopping bags today', completed: false, pts: 5 },
      { id: 'unplug_idle', text: 'Unplugged idle electronics & chargers', completed: false, pts: 5 },
      { id: 'short_shower', text: 'Reduced shower time by 3 minutes', completed: false, pts: 5 },
      { id: 'no_single_use', text: 'Avoided single-use plastics entirely', completed: false, pts: 5 },
      { id: 'walk_short', text: 'Walked or cycled for a short trip (<1 mile)', completed: false, pts: 10 }
    ];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Helper to render specific log icons dynamically
  const renderLogIcon = (type: string) => {
    switch (type) {
      case 'walk_bike':
      case 'bike_walk':
        return <Bike className="w-4 h-4 text-emerald-400" />;
      case 'escooter':
        return <Sparkle className="w-4 h-4 text-teal-400" />;
      case 'transit_bus':
      case 'bus':
        return <Bus className="w-4 h-4 text-indigo-400" />;
      case 'transit_train':
      case 'train':
        return <Train className="w-4 h-4 text-purple-400" />;
      case 'electric_car':
      case 'car_electric':
        return <Car className="w-4 h-4 text-cyan-400" />;
      case 'flight_short':
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
      case 'electricity':
      case 'natural_gas':
        return <Droplet className="w-4 h-4 text-amber-500" />;
      case 'meal_beef':
      case 'meal_poultry':
      case 'meal_vegetarian':
      case 'meal_vegan':
        return <UtensilsCrossed className="w-4 h-4 text-rose-400" />;
      case 'clothing_item':
        return <Shirt className="w-4 h-4 text-pink-500" />;
      case 'electronics_spend':
        return <ShoppingBag className="w-4 h-4 text-teal-500" />;
      default:
        return <Car className="w-4 h-4 text-rose-400" />;
    }
  };

  // Helper to render game item icons dynamically
  const renderGameIcon = (iconName: string) => {
    switch (iconName) {
      case 'Tv': return <Tv className="w-12 h-12 text-cyan-400" />;
      case 'ShoppingBag': return <ShoppingBag className="w-12 h-12 text-purple-400" />;
      case 'Utensils': return <UtensilsCrossed className="w-12 h-12 text-rose-400" />;
      case 'Leaf': return <Leaf className="w-12 h-12 text-emerald-400" />;
      case 'Plane': return <Sparkles className="w-12 h-12 text-indigo-400" />;
      case 'Car': return <Car className="w-12 h-12 text-amber-500" />;
      case 'Shirt': return <Shirt className="w-12 h-12 text-teal-400" />;
      case 'Droplet': return <Droplet className="w-12 h-12 text-blue-400" />;
      case 'Mail': return <Mail className="w-12 h-12 text-gray-400" />;
      default: return <Sparkles className="w-12 h-12 text-yellow-400" />;
    }
  };

  // ==========================================================================
  // SYNC WITH LOCAL STORAGE
  // ==========================================================================

  const saveToLocal = (updatedLogs: LogEntry[], updatedPoints: number, updatedStreak: number, updatedLastDate: string, updatedBadges: string[], uScore: number, uStreak: number) => {
    const stateObj = {
      logs: updatedLogs,
      ecoPoints: updatedPoints,
      streak: updatedStreak,
      lastLogDate: updatedLastDate,
      unlockedBadges: updatedBadges,
      gameScore: uScore,
      gameStreak: uStreak,
      weatherContext,
      distanceContext,
      formType
    };
    localStorage.setItem('ecosphere_react_state', JSON.stringify(stateObj));
  };

  const toggleAction = (id: string) => {
    const updated = dailyActions.map(action => {
      if (action.id === id) {
        const newCompleted = !action.completed;
        const pointsDiff = newCompleted ? action.pts : -action.pts;
        const nextPoints = Math.max(0, ecoPoints + pointsDiff);
        setEcoPoints(nextPoints);
        triggerFloatingText(pointsDiff > 0 ? pointsDiff : 0);
        saveToLocal(logs, nextPoints, streak, lastLogDate, unlockedBadges, gameScore, gameStreak);
        return { ...action, completed: newCompleted };
      }
      return action;
    });
    setDailyActions(updated);
    localStorage.setItem('ecosphere_actions', JSON.stringify(updated));
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);

  // ==========================================================================
  // UTILITIES & CALCULATIONS
  // ==========================================================================
  
  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  const triggerFloatingText = (pts: number) => {
    setFloatingPoints(`+${pts} 🌱`);
    setTimeout(() => {
      setFloatingPoints(null);
    }, 1200);
  };

  const showAchievementToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // ==========================================================================
  // STATS & BADGES TRIGGER
  // ==========================================================================

  const checkAndUnlockBadges = (currentLogs: LogEntry[], currentPoints: number, currentStreak: number, quizScore: number) => {
    const totalSavings = currentLogs.reduce((sum, log) => sum + log.savings, 0);
    const activeTrips = currentLogs.filter(log => log.type === 'walk_bike').length;
    const updatedBadges = [...unlockedBadges];
    let newlyUnlocked = false;

    BADGES.forEach(badge => {
      if (updatedBadges.includes(badge.id)) return;
      
      let eligible = false;
      if (badge.id === 'first_step' && currentLogs.length >= 1) eligible = true;
      if (badge.id === 'streak_3' && currentStreak >= 3) eligible = true;
      if (badge.id === 'streak_7' && currentStreak >= 7) eligible = true;
      if (badge.id === 'points_200' && currentPoints >= 200) eligible = true;
      if (badge.id === 'quiz_5' && quizScore >= 5) eligible = true;
      if (badge.id === 'saving_50' && totalSavings >= 50.0) eligible = true;
      if (badge.id === 'zero_emissions' && activeTrips >= 3) eligible = true;
      if (badge.id === 'carpool_master' && currentLogs.some(log => log.passengers >= 3)) eligible = true;

      if (eligible) {
        updatedBadges.push(badge.id);
        newlyUnlocked = true;
        showAchievementToast(badge.title, badge.desc);
        currentPoints += 100; // award 100 points per achievement
      }
    });

    if (newlyUnlocked) {
      setUnlockedBadges(updatedBadges);
      setEcoPoints(currentPoints);
      triggerFloatingText(100);
    }
    return { updatedPoints: currentPoints, updatedBadges, newlyUnlocked };
  };

  const updateStreakOnLog = () => {
    const today = getTodayDateString();
    let newStreak = streak;

    if (!lastLogDate) {
      newStreak = 1;
    } else {
      const diffTime = Math.abs(new Date(today).getTime() - new Date(lastLogDate).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) newStreak += 1;
      else if (diffDays > 1) newStreak = 1;
    }
    
    setStreak(newStreak);
    setLastLogDate(today);
    return { newStreak, today };
  };

  // ==========================================================================
  // CORE FUNCTIONS
  // ==========================================================================

  const addLog = (type: string, dist: number, pass: number, date?: string, note?: string) => {
    const emissions = calculateEmissions(type, dist, pass);
    const savings = calculateSavings(type, dist, pass);
    const points = calculatePoints(type, dist, streak);

    const { newStreak, today } = updateStreakOnLog();
    const logDate = date || today;

    const newEntry: LogEntry & { note?: string } = {
      id: generateUniqueId("log"),
      date: logDate,
      type,
      distance: dist,
      passengers: pass,
      emissions,
      savings,
      note
    };

    const updatedLogs = [...logs, newEntry];
    const updatedPoints = ecoPoints + points;

    setLogs(updatedLogs);
    setEcoPoints(updatedPoints);
    triggerFloatingText(points);

    // Badge Check
    const quizWins = gameScore; // total correct answers
    const badgeCheckResult = checkAndUnlockBadges(updatedLogs, updatedPoints, newStreak, quizWins);
    const finalPoints = badgeCheckResult.newlyUnlocked ? badgeCheckResult.updatedPoints : updatedPoints;
    const finalBadges = badgeCheckResult.newlyUnlocked ? badgeCheckResult.updatedBadges : unlockedBadges;

    saveToLocal(updatedLogs, finalPoints, newStreak, logDate, finalBadges, gameScore, gameStreak);
  };

  const deleteLog = (id: string) => {
    const updated = logs.filter(l => l.id !== id);
    setLogs(updated);
    saveToLocal(updated, ecoPoints, streak, lastLogDate, unlockedBadges, gameScore, gameStreak);
  };

  // ==========================================================================
  // FORM HANDLING
  // ==========================================================================
  
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dist = parseFloat(formDistance);
    if (isNaN(dist) || dist <= 0) return;

    addLog(formType, dist * formRepeat, formPassengers, formDate, formNote || undefined);
    
    // reset form
    setFormDistance('');
    setFormPassengers(1);
    setFormRepeat(1);
    setFormNote('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setActiveTab('dashboard');
  };

  const getFormPreview = () => {
    const dist = parseFloat(formDistance) || 0;
    const totalDist = dist * formRepeat;
    const em = calculateEmissions(formType, totalDist, formPassengers);
    const sav = calculateSavings(formType, totalDist, formPassengers);
    const pts = calculatePoints(formType, totalDist, streak);
    return { em, sav, pts };
  };

  const formPreview = getFormPreview();

  // ==========================================================================
  // CHAT ASSISTANT LOGIC
  // ==========================================================================

  const getAssistantRecommendation = (weather: string, dist: number) => {
    let text: string;
    let options: Array<{ type: string; distance: number }>;

    if (weather === 'sunny') {
      if (dist <= 3.0) {
        text = `☀️ **Sunny Weather & Short Commute Alert** (${dist.toFixed(1)} miles)!\n\nIt is beautiful outside and your journey is short. Active transit is your absolute best option. Riding a bicycle or walking produces **zero emissions** and unlocks a **+50 Eco-Point active transit bonus**!`;
        options = [
          { type: 'walk_bike', distance: dist },
          { type: 'escooter', distance: dist },
          { type: 'transit_bus', distance: dist }
        ];
      } else if (dist <= 10.0) {
        text = `☀️ **Sunny & Moderate Commute** (${dist.toFixed(1)} miles).\n\nActive travel by e-bike/scooter is still viable. Otherwise, public transit keeps your carbon footprint extremely low compared to a standard gasoline car.`;
        options = [
          { type: 'transit_train', distance: dist },
          { type: 'transit_bus', distance: dist },
          { type: 'electric_car', distance: dist }
        ];
      } else {
        text = `☀️ **Sunny & Long Highway Journey** (${dist.toFixed(1)} miles).\n\nFor highway commutes, I recommend taking the **Commuter Train** to completely bypass gridlock and emit only a fraction of the emissions. If driving, please carpool or choose an EV!`;
        options = [
          { type: 'transit_train', distance: dist },
          { type: 'electric_car', distance: dist },
          { type: 'hybrid_car', distance: dist }
        ];
      }
    } else if (weather === 'rainy') {
      if (dist <= 3.0) {
        text = `🌧️ **Rainy Weather Commute** (${dist.toFixed(1)} miles).\n\nActive biking/walking is uncomfortable right now. To stay dry and maintain a low footprint, choose the **Public Bus** or an **Electric Vehicle** ride pool.`;
        options = [
          { type: 'transit_bus', distance: dist },
          { type: 'electric_car', distance: dist },
          { type: 'gas_car', distance: dist }
        ];
      } else {
        text = `🌧️ **Rainy & Long Trip** (${dist.toFixed(1)} miles).\n\nWet roads increase highway fuel consumption. Taking the **Commuter Train** is the safest and lowest-carbon option in this downpour.`;
        options = [
          { type: 'transit_train', distance: dist },
          { type: 'electric_car', distance: dist },
          { type: 'hybrid_car', distance: dist }
        ];
      }
    } else { // snowy
      text = `❄️ **Freezing Cold / Snowy Commute** (${dist.toFixed(1)} miles).\n\nActive transit is unsafe due to ice. I suggest the **Commuter Train** as tracks are cleared regularly. Alternatively, carpool to divide highway emissions.`;
      options = [
        { type: 'transit_train', distance: dist },
        { type: 'transit_bus', distance: dist },
        { type: 'electric_car', distance: dist }
      ];
    }

    return { text, options };
  };

  const handleSendChat = (text: string) => {
    if (!text.trim()) return;

    // User Message
    const userMsg: ChatMessage = {
      id: generateUniqueId("msg_user"),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const query = text.toLowerCase();
      let botText = "";
      let botOptions: Array<{ type: string; distance: number }> = [];

      if (query.includes('average') || query.includes('footprint') || query.includes('biggest') || query.includes('source')) {
        const topCat = footprintAnalysis.topCategory;
        botText = topCat
          ? `📊 **Carbon Footprint Summary**:\n\nYour biggest emission source is **${topCat.category === 'energy' ? 'Home energy' : topCat.category.charAt(0).toUpperCase() + topCat.category.slice(1)}**, representing **${topCat.share}%** of your total footprint.\n\nYour daily average footprint is **${footprintAnalysis.dailyAverageKg.toFixed(2)} kg CO₂e**, which is **${Math.abs(footprintAnalysis.vsGlobalPct)}% ${footprintAnalysis.vsGlobalPct >= 0 ? 'above' : 'below'}** the global average of ${BENCHMARKS.globalDailyAvg} kg/day.`
          : `You haven't logged any activities yet! Start by logging a trip, energy usage, meal, or purchase.`;
      } else if (query.includes('plan') || query.includes('commute') || query.includes('travel') || query.includes('go to') || query.includes('office') || query.includes('work')) {
        let dist = distanceContext;
        const match = query.match(/\b\d+(\.\d+)?\b/);
        if (match) dist = parseFloat(match[0]);
        
        const rec = getAssistantRecommendation(weatherContext, dist);
        botText = rec.text;
        botOptions = rec.options;
      } else if (query.includes('budget') || query.includes('limit') || query.includes('goal')) {
        const total = logs.reduce((sum, log) => sum + log.emissions, 0);
        const rem = Math.max(0, WEEKLY_BUDGET_LIMIT - total);
        botText = `📊 **Carbon Budget Update**:\n\n*   **Total Emitted**: ${total.toFixed(2)} kg CO₂e\n*   **Weekly Limit**: ${WEEKLY_BUDGET_LIMIT} kg\n*   **Remaining**: ${rem.toFixed(2)} kg\n\n${rem > 10 ? 'You are doing great! Keep it up.' : '⚠️ You are running tight on budget. Consider active transit or train rides!'}`;
      } else if (query.includes('tips') || query.includes('how to')) {
        botText = `💡 **Quick Carbon Reduction Tips**:\n\n1.  **Walk or Bike short trips** (< 3 km) — it represents 50% of urban car trips!\n2.  **Use commuter rail** — trains cut emissions by 75% vs single occupancy cars.\n3.  **Swap beef meals** for poultry or vegan alternatives to save ~4.8 kg to ~5.9 kg CO₂e per meal.`;
      } else if (query.includes('points') || query.includes('streak') || query.includes('badges')) {
        botText = `🏆 **Your Achievements Dashboard**:\n\n*   **Total Eco-Points**: ${ecoPoints} 🌱\n*   **Current Streak**: ${streak} Days 🔥\n*   **Unlocked Badges**: ${unlockedBadges.length} / ${BADGES.length}\n\nKeep active and log trips daily to build multipliers and claim more rewards!`;
      } else {
        botText = `I can help you plan green journeys! Based on your active context variables (Weather: **${weatherContext.toUpperCase()}**, Distance: **${distanceContext.toFixed(1)} km**), here are the best routes to log:`;
        botOptions = [
          { type: 'bike_walk', distance: distanceContext },
          { type: 'train', distance: distanceContext },
          { type: 'bus', distance: distanceContext }
        ];
      }

      setChatMessages(prev => [...prev, {
        id: generateUniqueId("msg_bot"),
        sender: 'bot',
        text: botText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionOptions: botOptions
      }]);
    }, 1000);
  };

  const handleChatLog = (type: string, dist: number, messageId: string) => {
    // Add log
    addLog(type, dist, 1);

    // Disable action buttons on this message by marking it logged
    setChatMessages(prev =>
      prev.map(msg => {
        if (msg.id === messageId) {
          return { ...msg, actionOptions: [] }; // Clear options
        }
        return msg;
      })
    );

    // Send chatbot success text
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: generateUniqueId("msg_bot_success"),
        sender: 'bot',
        text: `✅ **Logged activity!** Logged **${dist.toFixed(1)}** of **${MODE_NAMES[type] || type}**.\n\nStats and charts on your dashboard have been updated.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 500);
  };

  // ==========================================================================
  // CARBON CLASH GAME ENGINE
  // ==========================================================================

  const startNewGame = () => {
    setGameActive(true);
    setGuessMade(false);
    setGuessResult(null);

    // Select two random unique items
    const indexA = Math.floor(Math.random() * GAME_ITEMS.length);
    let indexB = Math.floor(Math.random() * GAME_ITEMS.length);
    while (indexA === indexB) {
      indexB = Math.floor(Math.random() * GAME_ITEMS.length);
    }

    setCardA(GAME_ITEMS[indexA]);
    setCardB(GAME_ITEMS[indexB]);
  };

  const handleGuess = (guess: 'higher' | 'lower') => {
    if (guessMade) return;
    if (!cardA || !cardB) return;
    setGuessMade(true);

    const co2A = cardA.co2;
    const co2B = cardB.co2;
    let correct = false;

    if (guess === 'higher' && co2B >= co2A) correct = true;
    if (guess === 'lower' && co2B <= co2A) correct = true;

    let newScore = gameScore;
    let newStreak = gameStreak;

    if (correct) {
      newScore += 1;
      newStreak += 1;
      setGameScore(newScore);
      setGameStreak(newStreak);
      setGuessResult({
        correct: true,
        explanation: `Correct! ${cardB.title} emits ${co2B.toFixed(2)} kg CO₂e, which is ${guess === 'higher' ? 'higher' : 'lower'} than ${cardA.title} (${co2A.toFixed(2)} kg).\n\n${cardB.explanation}`
      });
      
      // Award points
      setEcoPoints(prev => {
        const updated = prev + 10;
        checkAndUnlockBadges(logs, updated, streak, newScore);
        return updated;
      });
      triggerFloatingText(10);
    } else {
      newStreak = 0;
      setGameStreak(0);
      setGuessResult({
        correct: false,
        explanation: `Incorrect. ${cardB.title} actually emits ${co2B.toFixed(2)} kg CO₂e, which is ${guess === 'higher' ? 'lower' : 'higher'} than ${cardA.title} (${co2A.toFixed(2)} kg).\n\n${cardB.explanation}`
      });
    }

    saveToLocal(logs, ecoPoints, streak, lastLogDate, unlockedBadges, newScore, newStreak);
  };

  // ==========================================================================
  // DASHBOARD DATA PREPARATION
  // ==========================================================================

  const totalEmitted = logs.reduce((sum, log) => sum + log.emissions, 0);
  const totalSaved = logs.reduce((sum, log) => sum + log.savings, 0);
  const footprintAnalysis = analyzeCommuteFootprint(logs, weatherContext);
  
  const budgetRemaining = Math.max(0, WEEKLY_BUDGET_LIMIT - totalEmitted);
  const budgetPct = Math.round((budgetRemaining / WEEKLY_BUDGET_LIMIT) * 100);
  const progressPct = Math.min(100, (totalEmitted / WEEKLY_BUDGET_LIMIT) * 100);

  // Group emissions by category for charts
  const categoryChartData = (['transport', 'energy', 'diet', 'shopping'] as Category[]).map(cat => {
    const sum = logs.filter(log => getCategoryForType(log.type) === cat).reduce((s, log) => s + log.emissions, 0);
    return { category: cat, value: sum };
  });
  const maxCategoryValue = Math.max(...categoryChartData.map(d => d.value), 5.0);

  const CATEGORY_COLORS: Record<string, string> = {
    transport: "#3b82f6", // blue
    energy: "#f59e0b",    // amber
    diet: "#10b981",      // emerald
    shopping: "#ec4899"   // pink
  };

  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen flex flex-col md:flex-row bg-[#080b13] text-slate-100 font-sans antialiased overflow-hidden">
        {/* Left Side: Form Fields */}
        <div className="w-full md:w-[42%] flex flex-col justify-center px-8 sm:px-16 md:px-12 lg:px-20 py-12 bg-[#0d1222]/95 z-10 border-r border-slate-800/80 shadow-2xl shrink-0">
          <div className="max-w-md w-full mx-auto flex flex-col gap-6">
            {/* Logo area */}
            <div className="flex">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#14532d] border border-emerald-800/40 shadow-sm shadow-emerald-950/20">
                <CustomLogo className="w-4 h-4 shrink-0" />
                <span className="font-sans font-semibold text-slate-100 text-[14px] leading-none">carbon</span>
              </div>
            </div>

            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">Welcome back</h1>
              <p className="text-slate-400 text-[13px] mt-1.5">Log in to track, analyze, and trim your transit footprint.</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-5 mt-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="login-email" className="text-[13px] font-semibold text-slate-300">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="e.g. eco@ecosphere.com"
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-cyan-500 text-slate-100 placeholder-slate-600 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="login-password" className="text-[13px] font-semibold text-slate-300">Password</label>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="••••••••"
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-cyan-500 text-slate-100 placeholder-slate-600 transition-colors"
                />
              </div>

              {loginError && (
                <span className="text-rose-400 text-[12.5px] font-semibold mt-1 flex items-center gap-1.5 animate-pulse">
                  <Info className="w-4 h-4 shrink-0" />
                  {loginError}
                </span>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-[14px] tracking-wide mt-2 cursor-pointer"
              >
                Log In
              </button>
            </form>

            {/* Form is automatically filled for immediate workspace testing */}
          </div>
        </div>

        {/* Right Side: Visual Panel */}
        <div className="hidden md:flex md:w-[58%] relative items-center justify-center bg-[#070a13] p-12 overflow-hidden flex-col gap-6">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
          
          <div className="relative w-72 h-72 rounded-full bg-gradient-to-tr from-emerald-500/10 to-cyan-500/20 border border-slate-800 flex items-center justify-center animate-pulse shadow-[0_0_80px_rgba(6,182,212,0.1)]">
            <Leaf className="w-24 h-24 text-emerald-400/30 rotate-12" />
            <div className="absolute inset-0 border border-dashed border-slate-800/40 rounded-full scale-125 animate-[spin_40s_linear_infinite]" />
            <div className="absolute inset-0 border border-dashed border-slate-800/20 rounded-full scale-150 animate-[spin_60s_linear_infinite]" />
            <Sparkles className="absolute top-10 right-10 text-cyan-400/40 w-6 h-6" />
            <Award className="absolute bottom-10 left-10 text-amber-500/30 w-6 h-6" />
          </div>

          <div className="max-w-md text-center z-10">
            <h3 className="font-display font-extrabold text-xl mb-2.5 bg-gradient-to-r from-slate-100 to-emerald-400 bg-clip-text text-transparent">
              Small actions. Global impact.
            </h3>
            <p className="text-[13px] text-slate-400 leading-relaxed">
              Every travel choice counts. EcoSphere enables individuals to track transit footprints, obtain intelligent travel guidance, and master carbon values through visual clash games.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col md:flex-row bg-[#080b13] font-sans antialiased">
      
      {/* Floating Points Indicator */}
      {floatingPoints && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 animate-bounce bg-emerald-500/20 backdrop-blur-md border border-emerald-500 px-6 py-3 rounded-full text-emerald-400 font-extrabold text-xl shadow-lg">
          {floatingPoints}
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161e31] border border-amber-500/60 shadow-2xl rounded-xl p-5 max-w-sm animate-bounce">
          <div className="flex items-center gap-3">
            <Award className="text-amber-500 w-8 h-8" />
            <div>
              <h4 className="text-[14px] font-bold text-slate-100">Achievement Unlocked! (+100🌱)</h4>
              <p className="text-[12px] text-slate-400 mt-1">{toastMessage.title} - {toastMessage.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-[260px] shrink-0 border-b md:border-b-0 md:border-r border-slate-800 bg-[#0d1222] p-6 flex flex-col justify-between sticky top-0 md:h-screen z-20">
        <div>
          {/* Logo */}
          <div className="flex mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#14532d] border border-emerald-800/40 shadow-sm shadow-emerald-950/20">
              <CustomLogo className="w-4 h-4 shrink-0" />
              <span className="font-sans font-semibold text-slate-100 text-[14px] leading-none">carbon</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav role="tablist" aria-label="Main Navigation" className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-3 md:pb-0">
            <button
              role="tab"
              aria-selected={activeTab === 'dashboard'}
              aria-label="Navigate to Dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all shrink-0 ${activeTab === 'dashboard' ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'log'}
              aria-label="Navigate to Log Activity"
              onClick={() => setActiveTab('log')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all shrink-0 ${activeTab === 'log' ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}
            >
              <Plus className="w-5 h-5" />
              <span>Log Activity</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'assistant'}
              aria-label="Navigate to EcoGuide AI"
              onClick={() => setActiveTab('assistant')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all shrink-0 relative ${activeTab === 'assistant' ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}
            >
              <Sparkle className="w-5 h-5 animate-pulse" />
              <span>EcoGuide AI</span>
              <span className="absolute top-3 right-4 w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'game'}
              aria-label="Navigate to Carbon Clash Game"
              onClick={() => setActiveTab('game')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all shrink-0 ${activeTab === 'game' ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}
            >
              <Gamepad2 className="w-5 h-5" />
              <span>Carbon Clash</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'badges'}
              aria-label="Navigate to Badges"
              onClick={() => setActiveTab('badges')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all shrink-0 ${activeTab === 'badges' ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}
            >
              <Award className="w-5 h-5" />
              <span>Badges</span>
            </button>
          </nav>
        </div>

        {/* Footer stats summary */}
        <div className="hidden md:flex flex-col gap-3.5 border-t border-slate-800 pt-5 mt-5">
          <div className="flex justify-between items-center text-[13px]">
            <div className="flex items-center gap-2 text-slate-400">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Logging Streak</span>
            </div>
            <span className="font-bold text-slate-100">{streak} Days</span>
          </div>
          <div className="flex justify-between items-center text-[13px]">
            <div className="flex items-center gap-2 text-slate-400">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>Eco-Points</span>
            </div>
            <span className="font-extrabold text-emerald-400">{ecoPoints}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 mt-4 py-2 border border-slate-800 hover:border-rose-500/40 hover:bg-rose-500/5 text-slate-400 hover:text-rose-400 text-[12px] font-semibold rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto p-4 md:p-8">
        
        {/* Header Summary */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-5 mb-8 gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">EcoSphere Carbon Companion</h1>
            <p className="text-slate-400 text-[13px] mt-1">Understand, track, and reduce your transit footprint.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <div className="bg-[#0d1222] border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3">
              <Car className="text-emerald-400 w-6 h-6" />
              <div>
                <span className="block font-bold text-[15px]">{totalSaved.toFixed(1)} kg</span>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">CO₂ Saved</span>
              </div>
            </div>
            <div className="bg-[#0d1222] border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3">
              <Sparkles className="text-cyan-400 w-6 h-6 animate-pulse" />
              <div>
                <span className="block font-bold text-[15px]">{budgetPct}%</span>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Budget Left</span>
              </div>
            </div>
          </div>
        </header>

        {/* ==========================================================================
           TAB PANEL: DASHBOARD
           ========================================================================== */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-6 animate-[fadeIn_0.4s_ease-out]">
            {/* Budget Hero Panel */}
            <div className="bg-[#161e31]/55 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-emerald-400 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex-1 w-full">
                <h3 className="font-display font-bold text-lg">Weekly Carbon Footprint Budget</h3>
                <p className="text-slate-400 text-[13px] mt-1 mb-6">
                  Target: <strong className="text-emerald-400">40.0 kg CO₂e</strong>. Keep weekly travel emissions below this threshold.
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span>{totalEmitted.toFixed(1)} kg emitted</span>
                    <span>40.0 kg Limit</span>
                  </div>
                  <div className="h-2.5 bg-slate-800/80 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${progressPct}%`,
                        background: progressPct >= 90 ? '#f43f5e' : progressPct >= 70 ? '#eab308' : 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Radial remaining score */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke={budgetPct <= 10 ? '#f43f5e' : budgetPct <= 30 ? '#eab308' : '#06b6d4'}
                    strokeWidth="3"
                    strokeDasharray={`${budgetPct}, 100`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="text-center z-10 flex flex-col">
                  <span className="font-display font-extrabold text-xl leading-none">{budgetPct}%</span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Remaining</span>
                </div>
              </div>
            </div>

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#161e31]/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between min-h-[120px]">
                <div className="flex items-center gap-2 text-slate-400 text-[13px]">
                  <TrendingUp className="w-4 h-4 text-rose-400" />
                  <h4>Total Emitted</h4>
                </div>
                <h2 className="font-display font-extrabold text-3xl mt-4">{totalEmitted.toFixed(2)} kg</h2>
                <span className="text-[11px] text-slate-400 mt-2">Cumulative CO₂e log</span>
              </div>

              <div className="bg-[#161e31]/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between min-h-[120px]">
                <div className="flex items-center gap-2 text-slate-400 text-[13px]">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <h4>Equivalent Trees</h4>
                </div>
                {/* 1 mature tree absorbs ~22kg of CO2 per year */}
                <h2 className="font-display font-extrabold text-3xl mt-4">{(totalSaved / 22.0).toFixed(2)}</h2>
                <span className="text-[11px] text-slate-400 mt-2">Annual absorption equivalent</span>
              </div>

              <div className="bg-[#161e31]/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between min-h-[120px]">
                <div className="flex items-center gap-2 text-slate-400 text-[13px]">
                  <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                  <h4>Streak Multiplier</h4>
                </div>
                <h2 className="font-display font-extrabold text-3xl mt-4">
                  {streak >= 7 ? '1.5x' : streak >= 3 ? '1.2x' : '1.0x'}
                </h2>
                <span className="text-[11px] text-slate-400 mt-2">Streak bonus applied to points</span>
              </div>
            </div>

            {/* Daily Actions & Personalized Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Action Checklist */}
              <div className="bg-[#161e31]/40 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-base flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-400" />
                    Daily Eco-Actions Checklist
                  </h3>
                  <p className="text-slate-400 text-[12px] mt-1 mb-4">Complete daily habits to earn extra Eco-Points.</p>
                </div>
                <div className="flex flex-col gap-3">
                  {dailyActions.map(action => (
                    <label
                      key={action.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${action.completed ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300'}`}
                    >
                      <input
                        type="checkbox"
                        checked={action.completed}
                        onChange={() => toggleAction(action.id)}
                        className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 accent-emerald-500"
                      />
                      <span className="text-[13px] flex-1 font-medium">{action.text}</span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${action.completed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                        +{action.pts} pts
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Personalized Insights */}
              <div className="bg-[#161e31]/40 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-display font-bold text-base flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                      Personalized Insights
                    </h3>
                    <p className="text-slate-400 text-[12px] mt-0.5">Commute metrics compared to global sustainability benchmarks.</p>
                  </div>
                  {logs.length > 0 && (
                    <div className="text-right">
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Daily Average</span>
                      <span className={`font-extrabold text-base ${footprintAnalysis.dailyAverageKg <= BENCHMARKS.sustainableDailyTarget ? 'text-emerald-400' : 'text-amber-500'}`}>
                        {footprintAnalysis.dailyAverageKg.toFixed(2)} kg
                      </span>
                    </div>
                  )}
                </div>

                {logs.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 mb-4 text-[12.5px]">
                    <span className="font-bold text-slate-200 block mb-1">Benchmark Comparison</span>
                    <span className="text-slate-400">
                      {footprintAnalysis.vsGlobalPct <= 0 ? (
                        <span className="text-emerald-400 font-semibold">
                          Excellent! Your daily average footprint is {Math.abs(footprintAnalysis.vsGlobalPct)}% below the global average ({BENCHMARKS.globalDailyAvg} kg/day).
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold">
                          Your daily average footprint is {footprintAnalysis.vsGlobalPct}% above the global average ({BENCHMARKS.globalDailyAvg} kg/day).
                        </span>
                      )}{' '}
                      You are currently{' '}
                      <span className={footprintAnalysis.vsTarget === 'under' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {footprintAnalysis.vsTarget === 'under' ? 'under' : 'over'}
                      </span>{' '}
                      the Paris-aligned sustainable target of {BENCHMARKS.sustainableDailyTarget} kg/day.
                    </span>
                  </div>
                )}

                <div className="flex-1 flex flex-col gap-3">
                  {footprintAnalysis.insights.map((insight: Insight) => {
                    let levelIcon = <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />;
                    let cardClass = "bg-slate-900/60 border-slate-800/80 text-slate-300";
                    if (insight.level === 'win') {
                      levelIcon = <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
                      cardClass = "bg-emerald-500/5 border-emerald-500/20 text-emerald-300";
                    } else if (insight.level === 'opportunity') {
                      levelIcon = <TrendingDown className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
                      cardClass = "bg-amber-500/5 border-amber-500/20 text-amber-300";
                    }

                    return (
                      <div key={insight.id} className={`p-3.5 rounded-xl border flex gap-3 text-[12.5px] leading-relaxed ${cardClass}`}>
                        {levelIcon}
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-semibold block text-slate-200">{insight.title}</span>
                            {insight.potentialSavingKg !== undefined && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 shrink-0">
                                Save {insight.potentialSavingKg} kg CO₂
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400 text-[12px] block mt-0.5">{insight.detail}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Charts & Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dynamic SVG bar chart */}
              <div className="bg-[#161e31]/40 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-base">Emissions Breakdown</h3>
                  <p className="text-slate-400 text-[12px] mt-1">Carbon impact per category (kg CO₂e)</p>
                </div>
                
                {/* Bars */}
                <div className="flex justify-around items-end h-[160px] border-b border-slate-800 pb-2 mt-8">
                  {categoryChartData.map(d => {
                    const pct = (d.value / maxCategoryValue) * 100;
                    const catLabel = d.category === 'energy' ? 'Energy' : d.category.charAt(0).toUpperCase() + d.category.slice(1);
                    return (
                      <div key={d.category} className="flex flex-col items-center gap-2 w-14 group relative">
                        <div
                          className="w-8 rounded-t transition-all duration-500 cursor-pointer"
                          style={{
                            height: `${Math.max(4, pct)}%`,
                            backgroundColor: CATEGORY_COLORS[d.category] || '#06b6d4'
                          }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1 bg-slate-900 border border-slate-700 text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                          {d.value.toFixed(1)} kg
                        </div>
                        <span className="text-[10px] text-slate-400 truncate w-full text-center">
                          {catLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Logs list */}
              <div className="bg-[#161e31]/40 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-bold text-base">Recent Travel Logs</h3>
                  <button onClick={() => setActiveTab('log')} className="text-cyan-400 font-semibold text-[13px] hover:underline">
                    Add Log
                  </button>
                </div>
                <div className="overflow-y-auto max-h-[180px] pr-1">
                  {logs.length === 0 ? (
                    <div className="text-slate-400 text-center py-10 text-[13px]">
                      No logged trips yet. Add one in the "Log Activity" or chat with "EcoGuide AI"!
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {[...logs].reverse().slice(0, 5).map(log => {
                        const isLegacy = ['gas_car', 'hybrid_car', 'electric_car', 'transit_bus', 'transit_train', 'escooter', 'walk_bike'].includes(log.type);
                        const unit = isLegacy ? 'miles' : (EMISSION_FACTORS_LIST.find(f => f.id === log.type)?.unit ?? 'units');
                        const noteString = log.note ? ` · ${log.note}` : '';
                        const passengerString = log.passengers > 1 ? ` · ${log.passengers} passengers` : '';
                        return (
                          <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[13px]">
                            <div className="flex items-center gap-2.5">
                              <span className="p-1.5 rounded-lg bg-slate-800">
                                {renderLogIcon(log.type)}
                              </span>
                              <div>
                                <span className="font-semibold block">{MODE_NAMES[log.type] || log.type}</span>
                                <span className="text-[11px] text-slate-400">
                                  {log.distance} {unit}{passengerString}{noteString}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className="text-rose-400 block font-bold">{log.emissions.toFixed(1)} kg</span>
                                <span className="text-emerald-400 block text-[10px] font-bold">-{log.savings.toFixed(1)} kg</span>
                              </div>
                              <button onClick={() => deleteLog(log.id)} className="text-rose-400 hover:bg-rose-500/10 p-1 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================================
           TAB PANEL: LOG ACTIVITY FORM
           ========================================================================== */}
        {activeTab === 'log' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-[fadeIn_0.4s_ease-out]">
            {/* Form */}
            <div className="lg:col-span-2 bg-[#161e31]/40 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
              <h2 className="font-display font-bold text-xl mb-1">Log Daily Activity</h2>
              <p className="text-slate-400 text-[13px] mb-6 font-medium">Record travel, energy, meals, or shopping to see your instant footprint calculation.</p>

              <form onSubmit={handleManualSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Category Tabs inside form */}
                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <span className="text-[13px] font-semibold text-slate-300">Activity Category</span>
                    <div className="flex gap-2 bg-slate-900/60 p-1 border border-slate-800 rounded-xl">
                      {(['transport', 'energy', 'diet', 'shopping'] as Category[]).map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setFormCategory(cat);
                            const factors = EMISSION_FACTORS_LIST.filter(f => f.category === cat);
                            if (factors.length > 0) {
                              setFormType(factors[0].id);
                            }
                          }}
                          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                            formCategory === cat 
                              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 shadow-md'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {cat === 'energy' ? 'Home energy' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activity Type Selection */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="log-transit-mode" className="text-[13px] font-semibold text-slate-300">Activity Type</label>
                    <select
                      id="log-transit-mode"
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-cyan-500"
                    >
                      {EMISSION_FACTORS_LIST.filter(f => f.category === formCategory).map(f => (
                        <option key={f.id} value={f.id}>{f.label}</option>
                      ))}
                      {/* For compatibility with legacy test selectors */}
                      {formCategory === 'transport' && (
                        <>
                          <option value="gas_car">Gasoline Car (Avg)</option>
                          <option value="hybrid_car">Hybrid Vehicle</option>
                          <option value="electric_car">Electric Vehicle (EV)</option>
                          <option value="transit_bus">Public Transit (Bus)</option>
                          <option value="transit_train">Public Transit (Train)</option>
                          <option value="escooter">Electric Scooter</option>
                          <option value="walk_bike">Bicycle / Walking</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Amount (Unit) Input */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="log-distance" className="text-[13px] font-semibold text-slate-300">
                      Amount ({EMISSION_FACTORS_LIST.find(f => f.id === formType)?.unit || (['gas_car', 'hybrid_car', 'electric_car', 'transit_bus', 'transit_train', 'escooter', 'walk_bike'].includes(formType) ? 'miles' : 'units')})
                    </label>
                    <input
                      id="log-distance"
                      type="number"
                      min="0.1"
                      step="any"
                      required
                      value={formDistance}
                      placeholder="e.g. 5.5"
                      onChange={(e) => setFormDistance(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  {/* Carpooling Passengers (Transport only) */}
                  {['car_petrol', 'car_electric', 'bus', 'train', 'gas_car', 'hybrid_car', 'electric_car', 'transit_bus', 'transit_train'].includes(formType) ? (
                    <div className="flex flex-col gap-2 animate-[fadeIn_0.3s_ease-out]">
                      <label htmlFor="log-passengers" className="text-[13px] font-semibold text-slate-300">Carpooling (Passengers)</label>
                      <input
                        id="log-passengers"
                        type="number"
                        min="1"
                        max="8"
                        value={formPassengers}
                        onChange={(e) => setFormPassengers(parseInt(e.target.value) || 1)}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  ) : null}

                  {/* Log Frequency */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="log-frequency" className="text-[13px] font-semibold text-slate-300">Log Frequency</label>
                    <select
                      id="log-frequency"
                      value={formRepeat}
                      onChange={(e) => setFormRepeat(parseInt(e.target.value) || 1)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-cyan-500"
                    >
                      <option value="1">One-time Entry</option>
                      <option value="5">Recurring Commute (5x Week)</option>
                      <option value="7">Recurring Daily (7x Week)</option>
                    </select>
                  </div>

                  {/* Custom Date Selection */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="log-date" className="text-[13px] font-semibold text-slate-300">Date</label>
                    <input
                      id="log-date"
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  {/* Optional Note */}
                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <label htmlFor="log-note" className="text-[13px] font-semibold text-slate-300">Note (Optional)</label>
                    <input
                      id="log-note"
                      type="text"
                      maxLength={280}
                      value={formNote}
                      placeholder="e.g. Commute to office, Dinner at restaurant, natural gas heating"
                      onChange={(e) => setFormNote(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Preview Box */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 mt-4 flex flex-col gap-4">
                  <div className="flex justify-around items-center text-center">
                    <div>
                      <span className="block font-display font-extrabold text-xl text-rose-400">{formPreview.em.toFixed(2)} kg</span>
                      <span className="block text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-semibold">Estimated CO₂</span>
                    </div>
                    <div className="w-px h-10 bg-slate-800"></div>
                    <div>
                      <span className="block font-display font-extrabold text-xl text-emerald-400">{formPreview.sav.toFixed(2)} kg</span>
                      <span className="block text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-semibold">CO₂ Saved</span>
                    </div>
                  </div>
                  <div className="text-[12px] text-emerald-400 font-semibold flex items-center justify-center gap-1.5 border-t border-slate-850 pt-3">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>+{formPreview.pts} Eco-Points earned on logging</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Log Activity
                  </button>
                </div>
              </form>
            </div>

            {/* Informational Panel */}
            <div className="bg-[#0d1222] border border-slate-800 rounded-2xl p-6 self-start flex flex-col gap-4">
              <h3 className="font-display font-bold text-base">Emissions Reference Index</h3>
              <p className="text-slate-400 text-[12px] leading-relaxed">
                Documented per-unit emissions factors derived from verified UK DEFRA 2024, US EPA, and Poore & Nemecek datasets:
              </p>
              <div className="flex flex-col gap-3.5 mt-2 text-[12.5px] max-h-[400px] overflow-y-auto pr-1">
                {EMISSION_FACTORS_LIST.map(f => (
                  <div key={f.id} className="flex flex-col gap-0.5 border-b border-slate-850 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200 font-semibold">{f.label}</span>
                      <span className="text-cyan-400 font-mono font-bold">{f.perUnitKg.toFixed(3)} kg/{f.unit}</span>
                    </div>
                    <span className="text-[10px] text-slate-450 italic">{f.hint}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================================
           TAB PANEL: ECOGUIDE AI ASSISTANT
           ========================================================================== */}
        {activeTab === 'assistant' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-160px)] items-stretch animate-[fadeIn_0.4s_ease-out]">
            {/* Sidebar Context */}
            <div className="bg-[#0d1222] border border-slate-800 rounded-2xl p-5 flex flex-col gap-6 lg:h-full overflow-y-auto">
              <div>
                <h3 className="font-display font-bold text-base">Active Context</h3>
                <p className="text-slate-400 text-[12px] mt-1">Set variables to feed the AI advice engine.</p>
              </div>

              {/* Weather selector */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Weather Conditions</span>
                <div className="flex flex-col gap-2" role="group" aria-label="Simulated weather context selection">
                  <button
                    onClick={() => setWeatherContext('sunny')}
                    aria-label="Sunny weather context"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] border transition-all ${weatherContext === 'sunny' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-100'}`}
                  >
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Sunny</span>
                  </button>
                  <button
                    onClick={() => setWeatherContext('rainy')}
                    aria-label="Rainy weather context"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] border transition-all ${weatherContext === 'rainy' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-100'}`}
                  >
                    <CloudRain className="w-4 h-4 text-indigo-400" />
                    <span>Rainy</span>
                  </button>
                  <button
                    onClick={() => setWeatherContext('snowy')}
                    aria-label="Cold or Snowy weather context"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] border transition-all ${weatherContext === 'snowy' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-100'}`}
                  >
                    <Snowflake className="w-4 h-4 text-cyan-400" />
                    <span>Cold / Snow</span>
                  </button>
                </div>
              </div>

              {/* Distance Slider */}
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <label htmlFor="chat-distance-slider">Trip Distance</label>
                  <span className="text-cyan-400 font-bold">{distanceContext.toFixed(1)} mi</span>
                </div>
                <input
                  id="chat-distance-slider"
                  type="range"
                  min="0.5"
                  max="30"
                  step="0.5"
                  value={distanceContext}
                  onChange={(e) => setDistanceContext(parseFloat(e.target.value) || 5.0)}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Logic rules */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 mt-auto">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span className="text-[12px] font-bold">How it thinks:</span>
                </div>
                <ul className="list-disc pl-4 text-[10.5px] text-slate-400 flex flex-col gap-2">
                  <li>Sunny & short distances trigger Bike/Walk tips.</li>
                  <li>Rain blocks active transit, encouraging Buses & Trains.</li>
                  <li>Long distance recommendations prioritize high-capacity rail.</li>
                </ul>
              </div>
            </div>

            {/* Chat Workspace */}
            <div className="lg:col-span-3 bg-[#161e31]/40 border border-slate-800 rounded-2xl flex flex-col justify-between overflow-hidden shadow-xl lg:h-full">
              {/* Chat Header */}
              <div className="bg-[#0d1222] border-b border-slate-800 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold">
                    AI
                  </div>
                  <div>
                    <h4 className="font-bold text-[14px]">EcoGuide AI</h4>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Online Context Engine
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setChatMessages([])}
                  className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Messages viewport */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                    <span className="text-[10px] text-slate-500 mb-1">{msg.sender === 'bot' ? 'EcoGuide' : 'You'}</span>
                    
                    <div className={`p-4 rounded-2xl text-[13.5px] leading-relaxed shadow-md whitespace-pre-line ${msg.sender === 'user' ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-tr-none' : 'bg-slate-900/90 border border-slate-800 rounded-tl-none text-slate-100'}`}>
                      {msg.text}
                    </div>

                    {/* Action button stubs if returned */}
                    {msg.actionOptions && msg.actionOptions.length > 0 && (
                      <div className="w-full mt-3 p-4 bg-cyan-950/20 border border-cyan-900/60 rounded-xl flex flex-col gap-2">
                        <span className="text-[10.5px] uppercase font-bold tracking-wider text-cyan-400 block mb-1">Click to Log instantly:</span>
                        {msg.actionOptions.map((opt) => (
                          <button
                            key={opt.type}
                            onClick={() => handleChatLog(opt.type, opt.distance, msg.id)}
                            className="w-full bg-slate-900 hover:bg-emerald-500/10 border border-slate-850 hover:border-emerald-500/40 rounded-xl px-4 py-2.5 flex items-center justify-between text-[12.5px] transition-all text-slate-200"
                          >
                            <span className="font-semibold flex items-center gap-2">
                              {renderLogIcon(opt.type)}
                              {MODE_NAMES[opt.type]}
                            </span>
                            <span className="font-bold text-emerald-400">+{calculatePoints(opt.type, opt.distance, streak)} pts</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="self-start flex gap-1 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Suggestions replies */}
              <div className="bg-slate-900/30 border-t border-slate-800 px-6 py-2.5 flex flex-wrap gap-2">
                <button
                  onClick={() => handleSendChat(`Plan trip for ${distanceContext.toFixed(1)} miles`)}
                  className="bg-slate-900 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/30 rounded-full px-4 py-1.5 text-[11.5px] transition-all text-slate-400 hover:text-cyan-400"
                >
                  Plan commute
                </button>
                <button
                  onClick={() => handleSendChat("Check weekly budget")}
                  className="bg-slate-900 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/30 rounded-full px-4 py-1.5 text-[11.5px] transition-all text-slate-400 hover:text-cyan-400"
                >
                  Check budget
                </button>
                <button
                  onClick={() => handleSendChat("Give me carbon tips")}
                  className="bg-slate-900 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/30 rounded-full px-4 py-1.5 text-[11.5px] transition-all text-slate-400 hover:text-cyan-400"
                >
                  Carbon tips
                </button>
              </div>

              {/* Chat Input form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat(chatInput);
                }}
                className="bg-[#0d1222] border-t border-slate-800 px-6 py-4 flex gap-3"
              >
                <input
                  id="chat-text-input"
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask EcoGuide something (e.g. 'I want to go to the office')"
                  aria-label="Chat message input"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-[13.5px] outline-none focus:border-cyan-500 text-slate-100"
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold hover:scale-105 transition-transform"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==========================================================================
           TAB PANEL: CARBON CLASH GAME
           ========================================================================== */}
        {activeTab === 'game' && (
          <div className="flex items-center justify-center min-h-[calc(100vh-220px)] animate-[fadeIn_0.4s_ease-out]">
            {!gameActive || !cardA || !cardB ? (
              <div className="bg-[#161e31]/40 border border-slate-800 rounded-2xl p-8 max-w-lg text-center flex flex-col items-center gap-5 shadow-xl">
                <Gamepad2 className="w-16 h-16 text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.25)] animate-bounce" />
                <h2 className="font-display font-bold text-xl">Carbon Clash: Higher or Lower?</h2>
                <p className="text-slate-400 text-[13.5px] leading-relaxed">
                  Test your carbon knowledge! We will show two daily activities or items. Guess which one emits the higher amount of CO₂ equivalents.
                </p>
                <div className="w-full text-left bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-2 text-[12.5px] text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Earn +10 Eco-points per correct answer.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Correct answers increase streak multipliers.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Unlock badges in the Achievements tab.</span>
                  </div>
                </div>
                <button
                  onClick={startNewGame}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all hover:scale-103 shadow-lg shadow-emerald-500/10 mt-2"
                >
                  Start Playing
                </button>
              </div>
            ) : (
              <div className="w-full max-w-3xl flex flex-col items-center gap-6 relative">
                
                {/* HUD */}
                <div className="flex gap-8 bg-[#0d1222] border border-slate-800 px-6 py-2 rounded-full text-[13px] font-bold text-slate-300">
                  <span>Score: <span className="text-cyan-400">{gameScore}</span></span>
                  <span>Streak: <span className="text-amber-500">🔥 {gameStreak}</span></span>
                </div>

                {/* Cards */}
                <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 mt-4">
                  {/* Card A (Left - Revealed) */}
                  <div className="w-full md:w-[45%] bg-[#0d1222] border border-slate-800 rounded-2xl overflow-hidden min-h-[300px] flex flex-col">
                    <div className="h-32 bg-slate-900/60 border-b border-slate-800 flex items-center justify-center">
                      {renderGameIcon(cardA.iconName)}
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between items-center text-center">
                      <div>
                        <h3 className="font-display font-bold text-[16px] text-slate-200">{cardA.title}</h3>
                        <span className="text-[12px] text-slate-400 mt-1 block">{cardA.desc}</span>
                      </div>
                      <div className="mt-4 bg-slate-900/80 border border-slate-850 px-5 py-2.5 rounded-xl">
                        <span className="font-display font-extrabold text-2xl text-slate-100">{cardA.co2.toFixed(2)} kg</span>
                        <span className="block text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">CO₂e</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-slate-400 text-[12px]">
                    VS
                  </div>

                  {/* Card B (Right - Hidden emissions) */}
                  <div className="w-full md:w-[45%] bg-[#0d1222] border border-slate-800 rounded-2xl overflow-hidden min-h-[300px] flex flex-col">
                    <div className="h-32 bg-slate-900/60 border-b border-slate-800 flex items-center justify-center">
                      {renderGameIcon(cardB.iconName)}
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between items-center text-center">
                      <div>
                        <h3 className="font-display font-bold text-[16px] text-slate-200">{cardB.title}</h3>
                        <span className="text-[12px] text-slate-400 mt-1 block">{cardB.desc}</span>
                      </div>

                      {/* Decision buttons */}
                      {!guessMade ? (
                        <div className="flex flex-col gap-2.5 w-full mt-4">
                          <button
                            onClick={() => handleGuess('higher')}
                            className="border border-amber-500 hover:bg-amber-500/10 text-amber-500 font-bold py-2 px-4 rounded-xl text-[12.5px] transition-all flex items-center justify-center gap-1.5"
                          >
                            <TrendingUp className="w-4 h-4" /> Higher Footprint
                          </button>
                          <button
                            onClick={() => handleGuess('lower')}
                            className="border border-cyan-500 hover:bg-cyan-500/10 text-cyan-500 font-bold py-2 px-4 rounded-xl text-[12.5px] transition-all flex items-center justify-center gap-1.5"
                          >
                            <TrendingDown className="w-4 h-4" /> Lower Footprint
                          </button>
                        </div>
                      ) : (
                        <div className="mt-4 bg-slate-900/80 border border-slate-850 px-5 py-2.5 rounded-xl">
                          <span className="font-display font-extrabold text-2xl text-rose-400">{cardB.co2.toFixed(2)} kg</span>
                          <span className="block text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">CO₂e</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Feedback Dialog Card overlay */}
                {guessMade && guessResult && (
                  <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 bg-[#0d1222]/95 backdrop-blur-md border rounded-2xl p-6 text-center max-w-md shadow-2xl flex flex-col items-center gap-3 z-30 animate-[slideDown_0.3s_cubic-bezier(0.19,1,0.22,1)] ${guessResult.correct ? 'border-emerald-500' : 'border-rose-500'}`}>
                    <h3 className="font-display font-bold text-xl">{guessResult.correct ? 'Correct! 🎉' : 'Incorrect 😅'}</h3>
                    <p className="text-[12.5px] text-slate-300 leading-relaxed whitespace-pre-line mt-1">{guessResult.explanation}</p>
                    <button
                      onClick={startNewGame}
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold px-6 py-2 rounded-xl text-[12px] transition-all hover:scale-103 shadow-lg shadow-emerald-500/10 mt-3"
                    >
                      Next Round
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==========================================================================
           TAB PANEL: ACHIEVEMENTS / BADGES
           ========================================================================== */}
        {activeTab === 'badges' && (
          <div className="flex flex-col gap-6 animate-[fadeIn_0.4s_ease-out]">
            <div className="mb-2">
              <h2 className="font-display font-bold text-xl">Achievements Locker</h2>
              <p className="text-slate-400 text-[13px] mt-1">Earn Eco-Points by logging trips and building streaking habits to claim locked badges.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {BADGES.map(b => {
                const unlocked = unlockedBadges.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className={`border rounded-2xl p-5 text-center flex flex-col items-center gap-3 shadow-lg transition-all ${unlocked ? 'bg-[#161e31]/80 border-emerald-500/20 hover:scale-103 hover:border-emerald-500' : 'bg-[#161e31]/30 border-slate-800 opacity-40'}`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${unlocked ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)]' : 'bg-slate-800 text-slate-400'}`}>
                      <Award className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[14px]">{b.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-normal mt-1">{b.desc}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mt-2 block border-t border-slate-800/80 pt-2 w-full">
                      {unlocked ? 'Unlocked ✓' : 'Locked'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
