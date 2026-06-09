export type Category = "transport" | "energy" | "diet" | "shopping";

export interface EmissionFactor {
  readonly id: string;
  readonly category: Category;
  readonly label: string;
  readonly unit: string;
  readonly perUnitKg: number;
  readonly hint: string;
  readonly source: string;
}

export const EMISSION_FACTORS_LIST: readonly EmissionFactor[] = [
  // ---- Transport (per km unless noted) ----
  {
    id: "car_petrol",
    category: "transport",
    label: "Petrol car",
    unit: "km",
    perUnitKg: 0.17,
    hint: "Average petrol car, per km driven (single occupant).",
    source: "UK DEFRA 2024 average petrol car",
  },
  {
    id: "car_electric",
    category: "transport",
    label: "Electric car",
    unit: "km",
    perUnitKg: 0.05,
    hint: "Battery electric car, per km, grid-average electricity.",
    source: "UK DEFRA 2024 battery electric vehicle",
  },
  {
    id: "bus",
    category: "transport",
    label: "Bus",
    unit: "km",
    perUnitKg: 0.1,
    hint: "Local bus, per passenger-km.",
    source: "UK DEFRA 2024 average local bus",
  },
  {
    id: "train",
    category: "transport",
    label: "Train",
    unit: "km",
    perUnitKg: 0.035,
    hint: "National rail, per passenger-km.",
    source: "UK DEFRA 2024 national rail",
  },
  {
    id: "flight_short",
    category: "transport",
    label: "Short-haul flight",
    unit: "km",
    perUnitKg: 0.246,
    hint: "Short-haul flight, per passenger-km (incl. radiative forcing).",
    source: "UK DEFRA 2024 short-haul, with RF uplift",
  },
  {
    id: "bike_walk",
    category: "transport",
    label: "Bike / walk",
    unit: "km",
    perUnitKg: 0,
    hint: "Human-powered travel. Zero operational emissions.",
    source: "No direct combustion emissions",
  },

  // ---- Home energy ----
  {
    id: "electricity",
    category: "energy",
    label: "Electricity",
    unit: "kWh",
    perUnitKg: 0.4,
    hint: "Grid electricity, per kWh (grid-average mix).",
    source: "EPA / DEFRA 2024 grid-average electricity",
  },
  {
    id: "natural_gas",
    category: "energy",
    label: "Natural gas",
    unit: "kWh",
    perUnitKg: 0.18,
    hint: "Natural gas heating, per kWh of gas burned.",
    source: "UK DEFRA 2024 natural gas",
  },

  // ---- Diet (per meal) ----
  {
    id: "meal_beef",
    category: "diet",
    label: "Beef / lamb meal",
    unit: "meal",
    perUnitKg: 6.6,
    hint: "A meal centred on red meat.",
    source: "Poore & Nemecek 2018, ruminant meat per serving",
  },
  {
    id: "meal_poultry",
    category: "diet",
    label: "Poultry / pork meal",
    unit: "meal",
    perUnitKg: 1.8,
    hint: "A meal centred on white meat.",
    source: "Poore & Nemecek 2018, poultry per serving",
  },
  {
    id: "meal_vegetarian",
    category: "diet",
    label: "Vegetarian meal",
    unit: "meal",
    perUnitKg: 0.9,
    hint: "A plant-based meal with dairy or eggs.",
    source: "Poore & Nemecek 2018, vegetarian per serving",
  },
  {
    id: "meal_vegan",
    category: "diet",
    label: "Vegan meal",
    unit: "meal",
    perUnitKg: 0.7,
    hint: "An entirely plant-based meal.",
    source: "Poore & Nemecek 2018, vegan per serving",
  },

  // ---- Shopping (per item / per USD) ----
  {
    id: "clothing_item",
    category: "shopping",
    label: "New clothing item",
    unit: "item",
    perUnitKg: 15,
    hint: "An average new garment, cradle-to-gate.",
    source: "Industry LCA average, new garment",
  },
  {
    id: "electronics_spend",
    category: "shopping",
    label: "Electronics spend",
    unit: "USD",
    perUnitKg: 0.5,
    hint: "Consumer electronics, per USD spent.",
    source: "EEIO spend-based estimate, electronics",
  },
];

export const EMISSION_FACTORS: Record<string, number> = {
  car_petrol: 0.17,
  car_electric: 0.05,
  bus: 0.10,
  train: 0.035,
  flight_short: 0.246,
  bike_walk: 0,
  electricity: 0.40,
  natural_gas: 0.18,
  meal_beef: 6.6,
  meal_poultry: 1.8,
  meal_vegetarian: 0.9,
  meal_vegan: 0.7,
  clothing_item: 15,
  electronics_spend: 0.5,
  // Legacy / Compatibility fallback values:
  gas_car: 0.20,
  hybrid_car: 0.11,
  electric_car: 0.04,
  transit_bus: 0.08,
  transit_train: 0.05,
  escooter: 0.01,
  walk_bike: 0.00
};

export const MODE_NAMES: Record<string, string> = {
  car_petrol: "Petrol Car",
  car_electric: "Electric Car",
  bus: "Bus",
  train: "Train",
  flight_short: "Short-haul Flight",
  bike_walk: "Bike / Walk",
  electricity: "Grid Electricity",
  natural_gas: "Natural Gas",
  meal_beef: "Beef / Lamb Meal",
  meal_poultry: "Poultry / Pork Meal",
  meal_vegetarian: "Vegetarian Meal",
  meal_vegan: "Vegan Meal",
  clothing_item: "New Clothing Item",
  electronics_spend: "Electronics Spend",
  // Legacy / Compatibility fallback names:
  gas_car: "Gasoline Car",
  hybrid_car: "Hybrid Car",
  electric_car: "Electric Vehicle (EV)",
  transit_bus: "Public Transit (Bus)",
  transit_train: "Public Transit (Train)",
  escooter: "Electric Scooter",
  walk_bike: "Bicycle / Walking"
};

export interface Insight {
  id: string;
  level: 'win' | 'opportunity' | 'info';
  title: string;
  detail: string;
  potentialSavingKg?: number;
  category?: Category;
}

export interface FootprintAnalysis {
  dailyAverageKg: number;
  vsGlobalPct: number;
  vsTarget: 'under' | 'over';
  comparison: {
    vsGlobalPct: number;
    vsTarget: 'under' | 'over';
  };
  insights: Insight[];
  totalKg: number;
  byCategory: Record<Category, number>;
  activityCount: number;
  topCategory: { category: Category; kg: number; share: number } | null;
}

export const BENCHMARKS = {
  globalDailyAvg: 10.96, // kg CO2 per day per person (~4 t/yr)
  sustainableDailyTarget: 5.48, // kg CO2 per day per person (~2 t/yr)
};

export const getCategoryForType = (type: string): Category => {
  const factor = EMISSION_FACTORS_LIST.find(f => f.id === type);
  if (factor) return factor.category;
  if (['gas_car', 'hybrid_car', 'electric_car', 'transit_bus', 'transit_train', 'escooter', 'walk_bike'].includes(type)) {
    return 'transport';
  }
  return 'transport'; // Fallback
};

export const calculateEmissions = (type: string, quantity: number, pass: number): number => {
  const factor = type in EMISSION_FACTORS ? EMISSION_FACTORS[type] : 0.20;
  const category = getCategoryForType(type);
  const isCarOrTransit = ['car_petrol', 'car_electric', 'bus', 'train', 'gas_car', 'hybrid_car', 'electric_car', 'transit_bus', 'transit_train'].includes(type);
  const divisor = (category === 'transport' && isCarOrTransit && pass > 0) ? pass : 1;
  return (factor * quantity) / divisor;
};

export const calculateSavings = (type: string, quantity: number, pass: number): number => {
  if (type === 'gas_car' || type === 'car_petrol') return 0;
  const category = getCategoryForType(type);

  if (category === 'transport') {
    const isLegacy = ['hybrid_car', 'electric_car', 'transit_bus', 'transit_train', 'escooter', 'walk_bike'].includes(type);
    const baselineFactor = isLegacy ? EMISSION_FACTORS.gas_car : EMISSION_FACTORS.car_petrol;
    const baselineEmissions = (baselineFactor * quantity) / pass;
    const currentEmissions = calculateEmissions(type, quantity, pass);
    return Math.max(0, baselineEmissions - currentEmissions);
  }

  if (category === 'diet') {
    // Baseline is beef serving
    const baselineEmissions = EMISSION_FACTORS.meal_beef * quantity;
    const currentEmissions = calculateEmissions(type, quantity, 1);
    return Math.max(0, baselineEmissions - currentEmissions);
  }

  return 0;
};

export const calculatePoints = (type: string, quantity: number, streak: number): number => {
  const base = 10;
  let bonus = 0;
  
  if (type === 'walk_bike' || type === 'bike_walk') bonus = 50;
  else if (type === 'escooter') bonus = 20;
  else if (type === 'transit_bus' || type === 'transit_train' || type === 'bus' || type === 'train') bonus = 15;
  else if (type === 'electric_car' || type === 'car_electric') bonus = 10;
  else if (type === 'meal_vegan') bonus = 30;
  else if (type === 'meal_vegetarian') bonus = 20;
  else if (type === 'meal_poultry') bonus = 10;
  
  const distBonus = Math.floor(quantity);
  let multiplier = 1.0;
  if (streak >= 7) multiplier = 1.5;
  else if (streak >= 3) multiplier = 1.2;
  
  return Math.round((base + bonus + distBonus) * multiplier);
};

export const generateUniqueId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
};

export const analyzeCommuteFootprint = (
  logs: Array<{ type: string; distance: number; passengers: number; emissions: number; savings: number; date: string; note?: string }>,
  weatherContext: string
): FootprintAnalysis => {
  const activityCount = logs.length;
  
  // Calculate total by category
  const byCategory: Record<Category, number> = {
    transport: 0,
    energy: 0,
    diet: 0,
    shopping: 0
  };
  
  let totalKg = 0;
  
  for (const log of logs) {
    const category = getCategoryForType(log.type);
    byCategory[category] += log.emissions;
    totalKg += log.emissions;
  }
  
  // Round category totals
  for (const cat of ['transport', 'energy', 'diet', 'shopping'] as Category[]) {
    byCategory[cat] = Math.round(byCategory[cat] * 100) / 100;
  }
  totalKg = Math.round(totalKg * 100) / 100;
  
  const distinctDays = new Set(logs.map(log => log.date)).size || 1;
  const dailyAverageKg = Math.round((totalKg / distinctDays) * 100) / 100;
  
  const vsGlobalPct = BENCHMARKS.globalDailyAvg > 0 
    ? Math.round(((dailyAverageKg - BENCHMARKS.globalDailyAvg) / BENCHMARKS.globalDailyAvg) * 100)
    : 0;
    
  const vsTarget = dailyAverageKg <= BENCHMARKS.sustainableDailyTarget ? 'under' : 'over';
  
  // Find top contributing category
  let topCategory: FootprintAnalysis["topCategory"] = null;
  for (const [category, kg] of Object.entries(byCategory) as [Category, number][]) {
    if (kg <= 0) continue;
    if (!topCategory || kg > topCategory.kg) {
      topCategory = {
        category,
        kg,
        share: totalKg > 0 ? Math.round((kg / totalKg) * 100) : 0
      };
    }
  }
  
  const insights: Insight[] = [];
  
  if (activityCount === 0) {
    insights.push({
      id: 'empty',
      level: 'info',
      title: 'Log your first activity',
      detail: 'Add a trip, meal, energy use, or shopping item to see your footprint analysis.'
    });
    return {
      dailyAverageKg,
      vsGlobalPct,
      vsTarget,
      comparison: {
        vsGlobalPct,
        vsTarget
      },
      insights,
      totalKg,
      byCategory,
      activityCount,
      topCategory
    };
  }
  
  // Rule 1: Diet Red Meat swap
  const beefCount = logs.filter(l => l.type === 'meal_beef').reduce((sum, l) => sum + l.distance, 0); // distance represents quantity here
  if (beefCount >= 1) {
    const saving = Math.round(beefCount * (6.6 - 1.8) * 100) / 100;
    insights.push({
      id: 'diet-redmeat',
      level: 'opportunity',
      category: 'diet',
      title: 'Swap a few red-meat meals',
      detail: `You logged ${beefCount} red-meat meal${beefCount === 1 ? '' : 's'}. Swapping them for poultry or plant-based meals would cut about ${saving} kg CO2e.`,
      potentialSavingKg: saving
    });
  }
  
  // Rule 2: Shift drive trips to transit
  const petrolCarDist = logs.filter(l => l.type === 'car_petrol' || l.type === 'gas_car').reduce((sum, l) => sum + l.distance, 0);
  if (petrolCarDist >= 20) {
    const shifted = petrolCarDist * 0.3;
    const factorDiff = (EMISSION_FACTORS.car_petrol - EMISSION_FACTORS.train);
    const saving = Math.round(shifted * factorDiff * 100) / 100;
    insights.push({
      id: 'transport-modeshift',
      level: 'opportunity',
      category: 'transport',
      title: 'Shift some car trips to transit',
      detail: `You drove ${petrolCarDist.toFixed(1)} km by petrol car. Moving even a third of that to train or bus could save roughly ${saving} kg CO2e.`,
      potentialSavingKg: saving
    });
  }
  
  // Rule 3: Home energy efficiency
  if (byCategory.energy >= 5) {
    const saving = Math.round(byCategory.energy * 0.15 * 100) / 100;
    insights.push({
      id: 'energy-efficiency',
      level: 'opportunity',
      category: 'energy',
      title: 'Trim home energy use',
      detail: `Home energy is ${byCategory.energy.toFixed(1)} kg CO2e of your total. Lowering heating by 1°C and switching to efficient appliances can typically shave ~15% (about ${saving} kg).`,
      potentialSavingKg: saving
    });
  }
  
  // Rule 4: Recognise low-carbon transport choices as a win
  const greenKm = logs.filter(l => ['bike_walk', 'walk_bike', 'train', 'transit_train'].includes(l.type)).reduce((sum, l) => sum + l.distance, 0);
  if (greenKm >= 10) {
    insights.push({
      id: 'transport-win',
      level: 'win',
      category: 'transport',
      title: 'Nice low-carbon travel',
      detail: `You covered ${greenKm.toFixed(1)} km by train, bike, or on foot. That's a meaningfully lower-carbon choice than driving — keep it up.`,
    });
  }
  
  // Rule 5: Carpooling Opportunity (from original engine)
  const singleOccupantCarDist = logs
    .filter(l => (l.type === 'gas_car' || l.type === 'car_petrol' || l.type === 'hybrid_car') && l.passengers === 1)
    .reduce((s, l) => s + l.distance, 0);
  if (singleOccupantCarDist > 10) {
    const factor = logs.some(l => l.type === 'gas_car' || l.type === 'car_petrol') ? EMISSION_FACTORS.car_petrol : EMISSION_FACTORS.hybrid_car;
    const saving = Math.round(singleOccupantCarDist * (factor - factor / 2) * 100) / 100;
    insights.push({
      id: 'transport-carpool',
      level: 'opportunity',
      category: 'transport',
      title: 'Share rides with others',
      detail: `You drove ${singleOccupantCarDist.toFixed(1)} km alone. Sharing rides with just one passenger could save up to ${saving} kg CO2e.`,
      potentialSavingKg: saving
    });
  }
  
  // Rule 6: Active Transit Choice Win (from original engine)
  const activeDist = logs.filter(l => l.type === 'walk_bike' || l.type === 'bike_walk').reduce((s, l) => s + l.distance, 0);
  if (activeDist > 5 && greenKm < 10) { // Only add if not already covered by low-carbon travel win
    insights.push({
      id: 'transport-active-win',
      level: 'win',
      category: 'transport',
      title: 'Excellent active travel choices',
      detail: `You covered ${activeDist.toFixed(1)} km by bicycle or foot. This active transit choice kept your emissions at zero.`
    });
  }
  
  // Rule 7: Short Trip Swap Opportunity (Sunny Weather Context)
  if (weatherContext === 'sunny') {
    const shortDriveTrips = logs.filter(l => (l.type === 'gas_car' || l.type === 'car_petrol') && l.distance <= 3);
    if (shortDriveTrips.length > 0) {
      const shortDist = shortDriveTrips.reduce((s, l) => s + l.distance, 0);
      const saving = Math.round(shortDist * EMISSION_FACTORS.car_petrol * 100) / 100;
      insights.push({
        id: 'transport-sunny-swap',
        level: 'opportunity',
        category: 'transport',
        title: 'Walk or bike short trips',
        detail: `The weather is sunny. Swapping your short driving trips (<3 km) for biking or walking could save up to ${saving} kg CO2e.`,
        potentialSavingKg: saving
      });
    }
  }

  // Headline Insight
  if (topCategory) {
    const catLabel = topCategory.category === 'energy' ? 'Home energy' : topCategory.category.charAt(0).toUpperCase() + topCategory.category.slice(1);
    insights.unshift({
      id: 'headline',
      level: 'info',
      category: topCategory.category,
      title: `${catLabel} is your biggest source`,
      detail: `${catLabel} makes up ${topCategory.share}% of your logged footprint. Focusing here gives you the most leverage.`
    });
  }

  // Sort by impact: larger savings first, info headline stays on top.
  insights.sort((a, b) => {
    if (a.id === 'headline') return -1;
    if (b.id === 'headline') return 1;
    return (b.potentialSavingKg ?? 0) - (a.potentialSavingKg ?? 0);
  });
  
  return {
    dailyAverageKg,
    vsGlobalPct,
    vsTarget,
    comparison: {
      vsGlobalPct,
      vsTarget
    },
    insights,
    totalKg,
    byCategory,
    activityCount,
    topCategory
  };
};

export interface Badge {
  id: string;
  title: string;
  desc: string;
  criteria: string;
}

export const BADGES: Badge[] = [
  { id: "first_step", title: "First Step", desc: "Logged your first travel activity", criteria: "Log any trip" },
  { id: "streak_3", title: "Consistent Eco-Friend", desc: "Reach a 3-day travel logging streak", criteria: "3-day streak" },
  { id: "streak_7", title: "Green Champion", desc: "Reach a 7-day travel logging streak", criteria: "7-day streak" },
  { id: "points_200", title: "Eco Enthusiast", desc: "Earn a total of 200 Eco-Points", criteria: "200 points" },
  { id: "quiz_5", title: "Carbon Scholar", desc: "Get 5 correct answers in Carbon Clash", criteria: "5 quiz wins" },
  { id: "saving_50", title: "Planet Protector", desc: "Save 50.0 kg of CO₂ vs gasoline car", criteria: "50kg saved" },
  { id: "zero_emissions", title: "Pedal Powerhouse", desc: "Log 3 active zero-emission trips (Bicycle/Walk)", criteria: "3 active trips" },
  { id: "carpool_master", title: "Carpool Pioneer", desc: "Log a trip sharing a ride with 3+ passengers", criteria: "3+ passengers log" }
];

export interface GameItem {
  title: string;
  desc: string;
  co2: number;
  iconName: string;
  explanation: string;
}

export const GAME_ITEMS: GameItem[] = [
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

