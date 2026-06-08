# EcoSphere | Personal Carbon & Mobility Companion

EcoSphere is a sleek, premium, and interactive Single Page Application (SPA) designed to help individuals track, understand, and reduce their carbon footprint, focusing on the **Sustainable Mobility & Travel (The Eco-Commuter)** vertical. 

---

## 🚀 Chosen Vertical & Target Persona

### **Vertical: Sustainable Mobility & Travel**
Transportation is one of the leading contributors to individual carbon emissions. EcoSphere addresses this hotspot by helping users optimize their daily transit choices.

### **Persona: Alex, the Urban Commuter**
*   **Background**: A busy urban professional who commutes daily, values efficiency, and wants to live sustainably.
*   **Pain Point**: Standard carbon calculators are boring, manual, and offer preachy advice without factoring in daily context.
*   **EcoSphere Solution**: Alex gets real-time transit guidance. When it's sunny, EcoSphere nudges active transit. When it rains, it suggests low-carbon public transit or EV pooling to keep Alex dry. Alex logs commutes with a single click inside a smart chatbot and competes in educational games to earn points and unlock badges.

---

## 🧠 Approach & Logic Engine

EcoSphere's core feature is a **Context-Aware Logic Engine** that dynamically evaluates variables to make intelligent commuting recommendations:

1.  **Simulated Context**:
    *   **Weather**: Sunny, Rainy, Cold/Snow.
    *   **Distance**: Short (0.5 – 3 miles), Moderate (3 – 10 miles), or Long (10 – 30 miles).
2.  **Logic Matrix**:
    *   `Sunny` + `Short (<3 miles)` ➔ **Bicycle / Walk** recommended. High calorie burn, zero emissions, and a **+50 Eco-Point active transit bonus**.
    *   `Rainy/Cold` + `Short` ➔ Active travel is uncomfortable/unsafe. **Public Bus** or **Electric Vehicle** recommended to keep dry and low-emissions.
    *   `Rainy/Cold` + `Long (>10 miles)` ➔ **Commuter Train** strongly recommended. Trains are safe, bypass highway congestion, and emit minimal CO₂ per passenger mile.
3.  **Frictionless Log-from-Chat**:
    *   The assistant does not just suggest routes; it provides interactive action buttons directly within the conversation window. Clicking "Log Walking" or "Log Transit" logs the activity instantly to the database, fires a points animation, and triggers confirmation.

---

## 🛠️ How It Works

*   **Analytics Dashboard**: Visualizes weekly carbon limits (40 kg CO₂e) against actual emissions. Includes radial meters, Tree Equivalents saved (offset metrics), recent logs, and mode breakdown charts.
*   **Log Travel Form**: Allows manual entries of vehicle types, passenger size (emissions are divided among carpool members), and frequency, featuring live carbon and savings previews.
*   **EcoGuide AI Assistant**: Conversational assistant displaying proactive prompts, parsing user intent, and outputting contextual recommendations.
*   **Carbon Clash Game**: A "Higher or Lower" card guessing game comparing daily activities (e.g. streaming HD video vs. buying a cotton T-shirt) to teach carbon values through gamification.
*   **Achievement Locker**: Unlocks glowing badges (e.g., "Pedal Powerhouse", "Streak Champion") based on logs, streak milestones, and game score.

---

## 🎯 Evaluation Focus Areas

### 1. Code Quality
*   **Structure**: Clean separation of concerns with standard `index.html` (semantic layout), `style.css` (reusable utility classes and token design system), and `app.js` (clean JS module managing state, DOM updates, and games).
*   **Maintainability**: Clean documentation, descriptive function names, and pure utility functions (`calculateEmissions`, `calculateSavings`, `calculatePointsGained`) isolated from UI updates.

### 2. Security
*   **XSS Mitigation**: Raw user inputs (like chat text messages) are sanitized and inserted using `textContent` rather than `innerHTML` to block potential Cross-Site Scripting (XSS) vectors.
*   **Static Conversational Data**: Chat suggestions and bot responses are selected from pre-authored templates, ensuring no arbitrary execution of unsanitized strings.
*   **Zero-Dependency Sandbox**: No external dependencies or node packages are used, eliminating supply-chain vulnerabilities.

### 3. Efficiency
*   **SPA Structure**: Runs entirely client-side. Loads instantaneously, consumes negligible memory, and stores user data locally via `localStorage`.
*   **OLED-Friendly Dark Theme**: Uses deep blues and dark greys (`#070a13`), reducing device power consumption on OLED screens.
*   **Optimal DOM Manipulation**: Updates are targeted (e.g. only rendering updated tables or bars in chart) to minimize layout thrashing.

### 4. Testing
*   **Built-in Test Suite**: A standalone unit testing suite is provided at [test.html](file:///Users/anishanan/Carbon%20Footprint/test.html).
*   **What it does**: Stubs all DOM elements required by `app.js` to run in a sandbox, then runs automated assertions to verify:
    1. Carbon emissions equations for different modes and carpooling sizes.
    2. Savings calculations compared to gasoline vehicles.
    3. Multiplier points and active transit green bonuses.
*   **How to run**: Open [test.html](file:///Users/anishanan/Carbon%20Footprint/test.html) directly in any web browser to see test case indicators turn green.

### 5. Accessibility (a11y)
*   **Color Contrast**: Met and exceeded WCAG AAA contrast guidelines with light off-white text (`#f3f4f6`) against dark backdrops.
*   **Screen-Reader Support**: Semantic HTML5 elements (`<aside>`, `<main>`, `<header>`, `<nav>`) are used throughout, with descriptive titles on navigation and icon buttons.
*   **No Color-Only Cues**: Success/error states (like in the Carbon Clash game or budget bar warnings) utilize distinct icons (e.g. checkmarks, warning icons) rather than relying solely on color variations.

---

## 📋 Assumptions Made
1.  **Weekly Carbon Target**: Set at **40.0 kg CO₂e**, representing a target aligned with personal contributions to global Net-Zero pathways.
2.  **Conversion Factors**: GHG Protocol standard coefficients are used:
    *   Gasoline Car: `0.20` kg CO₂/passenger-mile.
    *   Hybrid Car: `0.11` kg CO₂/passenger-mile.
    *   Electric Vehicle: `0.04` kg CO₂/passenger-mile.
    *   Public Bus: `0.08` kg CO₂/passenger-mile.
    *   Commuter Train: `0.05` kg CO₂/passenger-mile.
    *   E-Scooter: `0.01` kg CO₂/passenger-mile.
    *   Active Transit (Biking/Walking): `0.00` kg CO₂/passenger-mile.
3.  **Trees Equivalence**: 1 mature tree absorbs ~22.0 kg CO₂ per year.
