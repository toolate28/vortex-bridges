/**
 * Comprehensive Gate Tests for Vortex Bridges
 *
 * H&&S:WAVE - Tests BOTH sides:
 * - Pass conditions (happy path)
 * - Fail conditions (gate blocks)
 * - Escape hatches (Penrose step prevention)
 */

import { describe, test, expect, beforeAll } from 'bun:test';

// Mock wave-toolkit for testing without dependency
const mockAnalyzeWave = (text: string, overrideScore?: number) => {
  const words = text.split(/\s+/).filter(w => w);
  const uniqueWords = new Set(words);

  // Simplified coherence calculation
  const curl = words.length > 10 ? 0.2 : 0.5;
  const divergence = 0.2;
  const potential = uniqueWords.size / Math.max(words.length, 1);
  const entropy = 0.7;

  const score = overrideScore ??
    (1 - curl * 0.4 - Math.abs(divergence - 0.2) * 0.3 - (1 - potential) * 0.2 - (1 - entropy) * 0.1) * 100;

  return {
    coherence: {
      curl,
      divergence,
      potential,
      entropy,
      score: Math.max(0, Math.min(100, score))
    },
    metrics: {
      wordCount: words.length,
      uniqueWords: uniqueWords.size
    }
  };
};

// Phase gate thresholds
const THRESHOLDS = {
  KENL: 28,   // 70% * 0.4
  AWI: 42,    // 70% * 0.6
  ATOM: 60,   // 70% * 0.85
  SAIF: 70,   // Snap-in threshold
  SPIRAL: 70,
  PRODUCTION: 85
};

// Escape hatch labels
const ESCAPE_HATCHES = {
  COHERENCE_OVERRIDE: 'coherence-override',
  EMERGENCY_MERGE: 'emergency-merge'
};

type Phase = 'KENL' | 'AWI' | 'ATOM' | 'SAIF' | 'SPIRAL';

interface GateContext {
  coherenceScore: number;
  hasIntent: boolean;
  hasRollback: boolean;
  isProduction: boolean;
  labels: string[];
}

function validateGate(phase: Phase, context: GateContext): {
  passed: boolean;
  reason: string;
  escapedVia?: string;
} {
  // Check escape hatches first (Penrose step prevention)
  if (context.labels.includes(ESCAPE_HATCHES.EMERGENCY_MERGE)) {
    return { passed: true, reason: 'Emergency merge override', escapedVia: 'emergency-merge' };
  }
  if (context.labels.includes(ESCAPE_HATCHES.COHERENCE_OVERRIDE)) {
    return { passed: true, reason: 'Coherence override', escapedVia: 'coherence-override' };
  }

  const threshold = context.isProduction ? THRESHOLDS.PRODUCTION : THRESHOLDS[phase];

  switch (phase) {
    case 'KENL':
      if (context.coherenceScore < THRESHOLDS.KENL) {
        return { passed: false, reason: `Coherence ${context.coherenceScore}% < ${THRESHOLDS.KENL}% (KENL threshold)` };
      }
      return { passed: true, reason: 'Knowledge context verified' };

    case 'AWI':
      if (!context.hasIntent) {
        return { passed: false, reason: 'Intent documentation missing (PR description < 5 words)' };
      }
      if (context.coherenceScore < THRESHOLDS.AWI) {
        return { passed: false, reason: `Coherence ${context.coherenceScore}% < ${THRESHOLDS.AWI}% (AWI threshold)` };
      }
      return { passed: true, reason: 'Intent documented and coherent' };

    case 'ATOM':
      if (context.coherenceScore < THRESHOLDS.ATOM) {
        return { passed: false, reason: `Coherence ${context.coherenceScore}% < ${THRESHOLDS.ATOM}% (ATOM threshold)` };
      }
      return { passed: true, reason: 'Execution gate passed' };

    case 'SAIF':
      const saifThreshold = context.isProduction ? THRESHOLDS.PRODUCTION : THRESHOLDS.SAIF;
      if (context.coherenceScore < saifThreshold) {
        return { passed: false, reason: `Coherence ${context.coherenceScore}% < ${saifThreshold}% (${context.isProduction ? 'PRODUCTION' : 'SAIF'} threshold)` };
      }
      return { passed: true, reason: 'SNAP-IN ACHIEVED' };

    case 'SPIRAL':
      if (!context.hasRollback) {
        return { passed: false, reason: 'Rollback plan missing for learning gate' };
      }
      if (context.coherenceScore < THRESHOLDS.SPIRAL) {
        return { passed: false, reason: `Coherence ${context.coherenceScore}% < ${THRESHOLDS.SPIRAL}% (SPIRAL threshold)` };
      }
      return { passed: true, reason: 'Ready for next cycle' };
  }
}

// ==================== TEST SUITE ====================

describe('Gate Tests - Pass Conditions', () => {
  test('KENL gate passes with 30% coherence', () => {
    const result = validateGate('KENL', {
      coherenceScore: 30,
      hasIntent: false,
      hasRollback: false,
      isProduction: false,
      labels: []
    });
    expect(result.passed).toBe(true);
  });

  test('AWI gate passes with 50% coherence and intent', () => {
    const result = validateGate('AWI', {
      coherenceScore: 50,
      hasIntent: true,
      hasRollback: false,
      isProduction: false,
      labels: []
    });
    expect(result.passed).toBe(true);
  });

  test('ATOM gate passes with 65% coherence', () => {
    const result = validateGate('ATOM', {
      coherenceScore: 65,
      hasIntent: true,
      hasRollback: false,
      isProduction: false,
      labels: []
    });
    expect(result.passed).toBe(true);
  });

  test('SAIF gate passes with 75% coherence (SNAP-IN)', () => {
    const result = validateGate('SAIF', {
      coherenceScore: 75,
      hasIntent: true,
      hasRollback: true,
      isProduction: false,
      labels: []
    });
    expect(result.passed).toBe(true);
    expect(result.reason).toContain('SNAP-IN');
  });

  test('SPIRAL gate passes with rollback plan', () => {
    const result = validateGate('SPIRAL', {
      coherenceScore: 75,
      hasIntent: true,
      hasRollback: true,
      isProduction: false,
      labels: []
    });
    expect(result.passed).toBe(true);
  });
});

describe('Gate Tests - Fail Conditions', () => {
  test('KENL gate blocks with 20% coherence', () => {
    const result = validateGate('KENL', {
      coherenceScore: 20,
      hasIntent: false,
      hasRollback: false,
      isProduction: false,
      labels: []
    });
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('KENL threshold');
  });

  test('AWI gate blocks without intent', () => {
    const result = validateGate('AWI', {
      coherenceScore: 50,
      hasIntent: false,  // No intent!
      hasRollback: false,
      isProduction: false,
      labels: []
    });
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('Intent documentation missing');
  });

  test('AWI gate blocks with low coherence despite intent', () => {
    const result = validateGate('AWI', {
      coherenceScore: 35,  // Below 42%
      hasIntent: true,
      hasRollback: false,
      isProduction: false,
      labels: []
    });
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('AWI threshold');
  });

  test('ATOM gate blocks with 55% coherence', () => {
    const result = validateGate('ATOM', {
      coherenceScore: 55,  // Below 60%
      hasIntent: true,
      hasRollback: false,
      isProduction: false,
      labels: []
    });
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('ATOM threshold');
  });

  test('SAIF gate blocks with 65% coherence (no snap-in)', () => {
    const result = validateGate('SAIF', {
      coherenceScore: 65,  // Below 70%
      hasIntent: true,
      hasRollback: true,
      isProduction: false,
      labels: []
    });
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('SAIF threshold');
  });

  test('SAIF gate blocks production with 80% (needs 85%)', () => {
    const result = validateGate('SAIF', {
      coherenceScore: 80,  // Below 85% production threshold
      hasIntent: true,
      hasRollback: true,
      isProduction: true,
      labels: []
    });
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('PRODUCTION threshold');
  });

  test('SPIRAL gate blocks without rollback plan', () => {
    const result = validateGate('SPIRAL', {
      coherenceScore: 75,
      hasIntent: true,
      hasRollback: false,  // No rollback!
      isProduction: false,
      labels: []
    });
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('Rollback plan missing');
  });
});

describe('Penrose Step Prevention - Escape Hatches', () => {
  test('coherence-override escapes blocked SAIF gate', () => {
    const result = validateGate('SAIF', {
      coherenceScore: 50,  // Would normally block
      hasIntent: true,
      hasRollback: true,
      isProduction: false,
      labels: ['coherence-override']
    });
    expect(result.passed).toBe(true);
    expect(result.escapedVia).toBe('coherence-override');
  });

  test('emergency-merge escapes all gates', () => {
    const phases: Phase[] = ['KENL', 'AWI', 'ATOM', 'SAIF', 'SPIRAL'];

    for (const phase of phases) {
      const result = validateGate(phase, {
        coherenceScore: 10,  // Very low
        hasIntent: false,
        hasRollback: false,
        isProduction: true,
        labels: ['emergency-merge']
      });
      expect(result.passed).toBe(true);
      expect(result.escapedVia).toBe('emergency-merge');
    }
  });

  test('emergency-merge takes precedence over coherence-override', () => {
    const result = validateGate('SAIF', {
      coherenceScore: 0,
      hasIntent: false,
      hasRollback: false,
      isProduction: true,
      labels: ['coherence-override', 'emergency-merge']
    });
    expect(result.escapedVia).toBe('emergency-merge');
  });

  test('escape hatches prevent Penrose infinite loop', () => {
    // Simulate the Penrose staircase scenario:
    // Developer keeps adding detail but coherence stays low

    let attempt = 1;
    const maxAttempts = 5;
    let coherence = 50;  // Stuck below threshold

    while (attempt <= maxAttempts) {
      const result = validateGate('SAIF', {
        coherenceScore: coherence,
        hasIntent: true,
        hasRollback: true,
        isProduction: false,
        labels: attempt === maxAttempts ? ['coherence-override'] : []
      });

      if (result.passed) {
        // Escaped via override on final attempt
        expect(attempt).toBe(maxAttempts);
        expect(result.escapedVia).toBe('coherence-override');
        break;
      }

      // Simulate: adding more detail doesn't help
      coherence = 50 + Math.random() * 10;  // Still below 70%
      attempt++;
    }
  });
});

describe('Full Pipeline Tests', () => {
  test('Full pass through all gates', () => {
    const phases: Phase[] = ['KENL', 'AWI', 'ATOM', 'SAIF', 'SPIRAL'];
    const passed: Phase[] = [];

    const context: GateContext = {
      coherenceScore: 80,
      hasIntent: true,
      hasRollback: true,
      isProduction: false,
      labels: []
    };

    for (const phase of phases) {
      const result = validateGate(phase, context);
      if (result.passed) {
        passed.push(phase);
      } else {
        break;
      }
    }

    expect(passed.length).toBe(5);
    expect(passed).toEqual(['KENL', 'AWI', 'ATOM', 'SAIF', 'SPIRAL']);
  });

  test('Partial pass - blocked at SAIF', () => {
    const phases: Phase[] = ['KENL', 'AWI', 'ATOM', 'SAIF', 'SPIRAL'];
    const passed: Phase[] = [];

    const context: GateContext = {
      coherenceScore: 65,  // Passes KENL, AWI, ATOM but not SAIF
      hasIntent: true,
      hasRollback: true,
      isProduction: false,
      labels: []
    };

    for (const phase of phases) {
      const result = validateGate(phase, context);
      if (result.passed) {
        passed.push(phase);
      } else {
        break;
      }
    }

    expect(passed.length).toBe(3);
    expect(passed).toEqual(['KENL', 'AWI', 'ATOM']);
  });

  test('Production requires higher threshold', () => {
    // 80% passes normal, fails production
    const normalResult = validateGate('SAIF', {
      coherenceScore: 80,
      hasIntent: true,
      hasRollback: true,
      isProduction: false,
      labels: []
    });
    expect(normalResult.passed).toBe(true);

    const prodResult = validateGate('SAIF', {
      coherenceScore: 80,
      hasIntent: true,
      hasRollback: true,
      isProduction: true,
      labels: []
    });
    expect(prodResult.passed).toBe(false);

    // 90% passes both
    const highResult = validateGate('SAIF', {
      coherenceScore: 90,
      hasIntent: true,
      hasRollback: true,
      isProduction: true,
      labels: []
    });
    expect(highResult.passed).toBe(true);
  });
});

describe('Wave Analysis Integration', () => {
  test('High quality text achieves snap-in', () => {
    const highQualityText = `
      This implementation provides clear separation of concerns with
      well-defined interfaces. The architecture follows established
      patterns for maintainability. Each component has a single
      responsibility and communicates through typed contracts.
    `;

    const result = mockAnalyzeWave(highQualityText);
    expect(result.coherence.score).toBeGreaterThan(60);
  });

  test('Repetitive text has high curl (circular reasoning)', () => {
    const repetitiveText = `
      The thing is the thing that does the thing.
      We need the thing to do the thing for the thing.
      The thing thing thing thing thing.
    `;

    const result = mockAnalyzeWave(repetitiveText);
    // High curl indicates circular reasoning
    expect(result.coherence.curl).toBeGreaterThan(0.3);
  });

  test('Score override for testing', () => {
    const result = mockAnalyzeWave('any text', 85);
    expect(result.coherence.score).toBe(85);
  });
});

// ==================== NPC-SPECIFIC TESTS ====================

describe('NPC Decision Tracking', () => {
  interface NPCDecision {
    npcId: string;
    npcName: string;
    input: string;
    output: string;
    phase: Phase;
  }

  function trackNPCDecision(decision: NPCDecision): {
    atomTag: string;
    coherence: number;
    gatesPassed: Phase[];
    markers: string[];
  } {
    const analysis = mockAnalyzeWave(`${decision.input}\n${decision.output}`);
    const coherence = analysis.coherence.score;

    const phases: Phase[] = ['KENL', 'AWI', 'ATOM', 'SAIF', 'SPIRAL'];
    const gatesPassed: Phase[] = [];
    const markers: string[] = [];

    const context: GateContext = {
      coherenceScore: coherence,
      hasIntent: decision.input.length > 10,
      hasRollback: true,
      isProduction: false,
      labels: []
    };

    for (const phase of phases) {
      const result = validateGate(phase, context);
      if (result.passed) {
        gatesPassed.push(phase);
      } else {
        markers.push('BLOCK');
        break;
      }
    }

    if (gatesPassed.length === 5) {
      markers.push('WAVE', 'PASS', 'SYNC');
    } else if (gatesPassed.length >= 3) {
      markers.push('WAVE', 'PING');
    }

    return {
      atomTag: `ATOM-NPC-${Date.now()}-${decision.npcName}`,
      coherence,
      gatesPassed,
      markers
    };
  }

  test('NPC with coherent dialogue passes gates', () => {
    const result = trackNPCDecision({
      npcId: 'npc-001',
      npcName: 'Hope',
      input: 'Hello Hope, can you help me find the village?',
      output: 'Of course! The village is north of here, past the forest. Follow the river and you will find it within five minutes walk.',
      phase: 'ATOM'
    });

    expect(result.gatesPassed.length).toBeGreaterThanOrEqual(3);
    expect(result.markers).toContain('WAVE');
  });

  test('NPC with short response gets blocked', () => {
    const result = trackNPCDecision({
      npcId: 'npc-002',
      npcName: 'Guard',
      input: 'What is your purpose?',
      output: 'Hmm.',  // Too short
      phase: 'ATOM'
    });

    // Low coherence from minimal content
    expect(result.coherence).toBeLessThan(70);
  });
});

console.log('Gate tests loaded. Run with: bun test');
