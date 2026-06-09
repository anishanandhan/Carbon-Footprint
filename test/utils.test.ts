import { describe, it, expect } from 'vitest';
import {
  calculateEmissions,
  calculateSavings,
  calculatePoints,
  generateUniqueId,
  EMISSION_FACTORS,
  analyzeCommuteFootprint
} from '../src/utils';
import {
  stripControlCharacters,
  escapeHtml,
  redactSecrets,
  normalizeUnicode
} from '../src/lib/security/sanitize';

describe('EcoSphere Core Emission Utility Tests', () => {
  describe('calculateEmissions calculations', () => {
    it('should compute normal gasoline car emissions correctly', () => {
      // 10 miles, 1 passenger
      expect(calculateEmissions('gas_car', 10, 1)).toBe(2.0);
    });

    it('should compute bus emissions divided by passengers correctly', () => {
      // 10 miles, 2 passengers
      expect(calculateEmissions('transit_bus', 10, 2)).toBe(0.4);
    });

    it('should calculate zero emissions for biking/walking', () => {
      expect(calculateEmissions('walk_bike', 25, 2)).toBe(0);
    });

    it('should default to gasoline car factor for unknown transit modes', () => {
      expect(calculateEmissions('unidentified_mode', 10, 1)).toBe(2.0);
    });

    it('should handle zero distance gracefully returning zero emissions', () => {
      expect(calculateEmissions('gas_car', 0, 1)).toBe(0);
    });

    it('should handle division by zero or negative passenger counts by treating passengers as 1', () => {
      // Division by zero is prevented; passengers defaults to 1.
      const result = calculateEmissions('gas_car', 10, 0);
      expect(result).toBe(2.0);
    });

    it('should handle negative distance inputs correctly', () => {
      expect(calculateEmissions('gas_car', -10, 1)).toBe(-2.0);
    });
  });

  describe('calculateSavings calculations', () => {
    it('should return 0 savings for gasoline car mode baseline', () => {
      expect(calculateSavings('gas_car', 15, 1)).toBe(0);
    });

    it('should return max savings for walk/bike active travel modes', () => {
      const gasEmissions = (EMISSION_FACTORS.gas_car * 10) / 1;
      expect(calculateSavings('walk_bike', 10, 1)).toBe(gasEmissions);
    });

    it('should compute partial savings for hybrid commuter cars correctly', () => {
      const gasEmissions = (EMISSION_FACTORS.gas_car * 20) / 1;
      const hybridEmissions = (EMISSION_FACTORS.hybrid_car * 20) / 1;
      expect(calculateSavings('hybrid_car', 20, 1)).toBeCloseTo(gasEmissions - hybridEmissions, 5);
    });

    it('should return 0 savings if custom emissions exceed baseline gas emissions (edge case)', () => {
      // If a mode has high emissions, calculateSavings returns Math.max(0, gas - current)
      // If we pass an unknown factor or very high factor:
      // Wait, let's test if savings is never negative
      expect(calculateSavings('heavy_polluter_doesnt_exist_but_defaults_to_gas', 10, 1)).toBe(0);
    });

    it('should handle zero distance by returning zero savings', () => {
      expect(calculateSavings('electric_car', 0, 1)).toBe(0);
    });
  });

  describe('calculatePoints algorithms', () => {
    it('should return base points plus distance bonus for zero-streak gas car trip', () => {
      // base=10, bonus=0, distBonus=5. points = (10 + 5) * 1.0 = 15
      expect(calculatePoints('gas_car', 5.8, 1)).toBe(15);
    });

    it('should include full transit bonus of +50 for walking/biking', () => {
      // base=10, bonus=50, distBonus=4. points = (10 + 50 + 4) * 1.0 = 64
      expect(calculatePoints('walk_bike', 4.1, 1)).toBe(64);
    });

    it('should apply 1.2x multiplier for consistent 3-day logging streaks', () => {
      // transit_bus bonus=15. base=10, dist=10 -> distBonus=10. points = (10 + 15 + 10) * 1.2 = 42
      expect(calculatePoints('transit_bus', 10.2, 3)).toBe(42);
    });

    it('should apply 1.5x multiplier for high 7-day logging streaks', () => {
      // electric_car bonus=10. base=10, dist=5 -> distBonus=5. points = (10 + 10 + 5) * 1.5 = 38 (37.5 rounded up to 38)
      expect(calculatePoints('electric_car', 5, 7)).toBe(38);
    });

    it('should handle boundary streaks of 2 or less without applying multiplier', () => {
      // base=10, electric_car bonus=10, dist=10 -> distBonus=10. points = (10 + 10 + 10) * 1.0 = 30
      expect(calculatePoints('electric_car', 10, 2)).toBe(30);
    });
  });

  describe('generateUniqueId utility format', () => {
    it('should contain prefix and random timestamp sequences', () => {
      const id = generateUniqueId('test');
      expect(id).toMatch(/^test_\d+_\d+$/);
    });

    it('should produce distinct IDs for sequential calls', () => {
      const setOfIds = new Set();
      for (let i = 0; i < 50; i++) {
        setOfIds.add(generateUniqueId('log'));
      }
      expect(setOfIds.size).toBe(50);
    });
  });

  describe('input sanitization utilities', () => {
    it('should strip control characters and zero-width spaces', () => {
      const input = 'hello\x07world\u200B!';
      expect(stripControlCharacters(input)).toBe('helloworld!');
    });

    it('should escape HTML tags and quotes', () => {
      const input = '<script>alert("XSS")</script>';
      expect(escapeHtml(input)).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    });

    it('should redact emails and passwords from strings', () => {
      const log1 = 'user logged in with email: eco@ecosphere.com and password: "greenfuture"';
      expect(redactSecrets(log1)).toBe('user logged in with email: [EMAIL_REDACTED] and password: "[REDACTED]"');

      const log2 = 'GET /api?token=secret123&user=admin';
      expect(redactSecrets(log2)).toBe('GET /api?token=[REDACTED]&user=admin');
    });

    it('should normalize unicode to NFC form', () => {
      const input = 'cafe\u0301'; // cafe + combining accent
      expect(normalizeUnicode(input)).toBe('café');
    });
  });

  describe('analyzeCommuteFootprint insights rules engine', () => {
    const today = '2026-06-09';
    
    it('returns an onboarding insight if there are no logs', () => {
      const analysis = analyzeCommuteFootprint([], 'sunny');
      expect(analysis.dailyAverageKg).toBe(0);
      expect(analysis.insights).toHaveLength(1);
      expect(analysis.insights[0].id).toBe('empty');
    });

    it('identifies top emissions contributor mode and shares share share', () => {
      const logs = [
        { id: '1', type: 'gas_car', distance: 10, passengers: 1, emissions: 2.0, savings: 0, date: today }, // 2.0 kg
        { id: '2', type: 'transit_bus', distance: 5, passengers: 1, emissions: 0.4, savings: 0.6, date: today } // 0.4 kg
      ];
      const analysis = analyzeCommuteFootprint(logs, 'sunny');
      expect(analysis.insights[0].id).toBe('headline');
      expect(analysis.insights[0].title).toBe('Transport is your biggest source');
      // Category total is 2.4, which represents 100% of logged footprint
      expect(analysis.insights[0].detail).toContain('100%');
    });

    it('recommends transport mode shift opportunity for petrol car use', () => {
      const logs = [
        { id: '1', type: 'gas_car', distance: 20, passengers: 1, emissions: 4.0, savings: 0, date: today }
      ];
      const analysis = analyzeCommuteFootprint(logs, 'sunny');
      const modeshift = analysis.insights.find(i => i.id === 'transport-modeshift');
      expect(modeshift).toBeDefined();
      expect(modeshift?.level).toBe('opportunity');
      // 20 * 0.3 * (0.17 - 0.035) = 6 * 0.135 = 0.81 kg
      expect(modeshift?.potentialSavingKg).toBe(0.81);
    });

    it('recommends carpooling opportunity for single occupant driving', () => {
      const logs = [
        { id: '1', type: 'gas_car', distance: 20, passengers: 1, emissions: 4.0, savings: 0, date: today }
      ];
      const analysis = analyzeCommuteFootprint(logs, 'sunny');
      const carpool = analysis.insights.find(i => i.id === 'transport-carpool');
      expect(carpool).toBeDefined();
      expect(carpool?.potentialSavingKg).toBe(1.7); // 20 * (0.17 - 0.085) = 1.7
    });

    it('celebrates active travel choices as a win', () => {
      const logs = [
        { id: '1', type: 'walk_bike', distance: 6, passengers: 1, emissions: 0, savings: 1.2, date: today }
      ];
      const analysis = analyzeCommuteFootprint(logs, 'sunny');
      const activeWin = analysis.insights.find(i => i.id === 'transport-active-win');
      expect(activeWin).toBeDefined();
      expect(activeWin?.level).toBe('win');
    });

    it('suggests short trip active transit swaps during sunny weather', () => {
      const logs = [
        { id: '1', type: 'gas_car', distance: 2, passengers: 1, emissions: 0.4, savings: 0, date: today }
      ];
      const analysis = analyzeCommuteFootprint(logs, 'sunny');
      const sunnySwap = analysis.insights.find(i => i.id === 'transport-sunny-swap');
      expect(sunnySwap).toBeDefined();
      expect(sunnySwap?.potentialSavingKg).toBe(0.34); // 2 * 0.17 = 0.34
    });

    it('compares daily average emissions vs global average and sustainable targets', () => {
      const lowLogs = [
        { id: '1', type: 'walk_bike', distance: 10, passengers: 1, emissions: 0, savings: 2.0, date: today }
      ];
      const lowAnalysis = analyzeCommuteFootprint(lowLogs, 'sunny');
      expect(lowAnalysis.vsTarget).toBe('under');
      expect(lowAnalysis.vsGlobalPct).toBeLessThan(0);
      expect(lowAnalysis.comparison.vsTarget).toBe('under');
      expect(lowAnalysis.comparison.vsGlobalPct).toBeLessThan(0);

      const highLogs = [
        { id: '1', type: 'gas_car', distance: 100, passengers: 1, emissions: 20.0, savings: 0, date: today }
      ];
      const highAnalysis = analyzeCommuteFootprint(highLogs, 'sunny');
      expect(highAnalysis.vsTarget).toBe('over');
      expect(highAnalysis.vsGlobalPct).toBeGreaterThan(0);
      expect(highAnalysis.comparison.vsTarget).toBe('over');
      expect(highAnalysis.comparison.vsGlobalPct).toBeGreaterThan(0);
    });
  });
});
