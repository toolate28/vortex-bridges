/**
 * HOPE-AI-NPC-SUITE Bridge: ATOM Tracking for NPC Decisions
 *
 * H&&S:WAVE - This bridge connects NPC dialogue and decision-making
 * to the SpiralSafe coherence ecosystem via ATOM trail.
 *
 * COM: This file IS the Center of Mass for HOPE-AI-NPC-SUITE
 */

import { analyzeWave, WaveAnalysisResult } from '@spiralsafe/wave-toolkit';

// Phase gates for NPC decision tracking
type Phase = 'KENL' | 'AWI' | 'ATOM' | 'SAIF' | 'SPIRAL';

interface NPCDecision {
  npcId: string;
  npcName: string;
  decisionType: 'DIALOGUE' | 'ACTION' | 'MEMORY' | 'RELATIONSHIP';
  input: string;        // Player input or context
  output: string;       // NPC response or action
  reasoning?: string;   // Chain-of-thought if available
  timestamp: string;
  phase: Phase;
}

interface ATOMEntry {
  atomTag: string;
  decision: NPCDecision;
  coherence: WaveAnalysisResult;
  gatesPassed: Phase[];
  markers: string[];    // H&&S markers: WAVE, PASS, PING, SYNC, BLOCK
}

// ATOM tag generator following ecosystem convention
function generateAtomTag(decision: NPCDecision): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const hash = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `ATOM-NPC-${date}-${hash}-${decision.npcName.toLowerCase()}`;
}

// Coherence gate validation (70% threshold for snap-in)
const SNAP_IN_THRESHOLD = 70;

function validateGate(coherence: WaveAnalysisResult, phase: Phase): boolean {
  const score = coherence.coherence?.score ?? 0;

  switch (phase) {
    case 'KENL':
      // Knowledge gate: context must exist
      return score >= 0; // Always passes if we have input
    case 'AWI':
      // Intent gate: reasoning must be coherent
      return score >= SNAP_IN_THRESHOLD * 0.6; // 42%
    case 'ATOM':
      // Execution gate: output must be coherent with input
      return score >= SNAP_IN_THRESHOLD * 0.85; // 59.5%
    case 'SAIF':
      // Assessment gate: full coherence check
      return score >= SNAP_IN_THRESHOLD; // 70%
    case 'SPIRAL':
      // Learning gate: ready for next cycle
      return score >= SNAP_IN_THRESHOLD;
    default:
      return false;
  }
}

// Main tracking function - called for every NPC decision
export async function trackNPCDecision(decision: NPCDecision): Promise<ATOMEntry> {
  // Analyze coherence of the NPC's output
  const textToAnalyze = [
    decision.input,
    decision.output,
    decision.reasoning ?? ''
  ].join('\n\n');

  const coherence = analyzeWave(textToAnalyze);

  // Run through phase gates
  const phases: Phase[] = ['KENL', 'AWI', 'ATOM', 'SAIF', 'SPIRAL'];
  const gatesPassed: Phase[] = [];
  const markers: string[] = [];

  for (const phase of phases) {
    if (validateGate(coherence, phase)) {
      gatesPassed.push(phase);
    } else {
      markers.push('BLOCK');
      break;
    }
  }

  // Determine H&&S markers
  if (gatesPassed.length === phases.length) {
    markers.push('WAVE', 'PASS', 'SYNC');
  } else if (gatesPassed.length >= 3) {
    markers.push('WAVE', 'PING');
  }

  const entry: ATOMEntry = {
    atomTag: generateAtomTag(decision),
    decision,
    coherence,
    gatesPassed,
    markers
  };

  // Persist to ATOM trail (append to JSONL)
  await persistATOMEntry(entry);

  return entry;
}

// Persist to local ATOM trail file
async function persistATOMEntry(entry: ATOMEntry): Promise<void> {
  const fs = await import('fs/promises');
  const path = await import('path');

  const trailDir = path.join(process.cwd(), '.atom-trail');
  const trailFile = path.join(trailDir, 'npc-decisions.jsonl');

  try {
    await fs.mkdir(trailDir, { recursive: true });
    await fs.appendFile(trailFile, JSON.stringify(entry) + '\n');
  } catch (error) {
    console.error('[ATOM-NPC] Failed to persist entry:', error);
  }
}

// Query vortex health for all NPC decisions
export async function getVortexHealth(): Promise<{
  totalDecisions: number;
  averageCoherence: number;
  snapInAchieved: boolean;
  phaseDistribution: Record<Phase, number>;
}> {
  const fs = await import('fs/promises');
  const path = await import('path');
  const readline = await import('readline');

  const trailFile = path.join(process.cwd(), '.atom-trail', 'npc-decisions.jsonl');

  try {
    const fileStream = await fs.open(trailFile, 'r');
    const rl = readline.createInterface({ input: fileStream.createReadStream() });

    let total = 0;
    let coherenceSum = 0;
    const phaseCount: Record<Phase, number> = {
      KENL: 0, AWI: 0, ATOM: 0, SAIF: 0, SPIRAL: 0
    };

    for await (const line of rl) {
      if (!line.trim()) continue;
      const entry: ATOMEntry = JSON.parse(line);
      total++;
      coherenceSum += entry.coherence.coherence?.score ?? 0;

      for (const phase of entry.gatesPassed) {
        phaseCount[phase]++;
      }
    }

    const avgCoherence = total > 0 ? coherenceSum / total : 0;

    return {
      totalDecisions: total,
      averageCoherence: avgCoherence,
      snapInAchieved: avgCoherence >= SNAP_IN_THRESHOLD,
      phaseDistribution: phaseCount
    };
  } catch {
    return {
      totalDecisions: 0,
      averageCoherence: 0,
      snapInAchieved: false,
      phaseDistribution: { KENL: 0, AWI: 0, ATOM: 0, SAIF: 0, SPIRAL: 0 }
    };
  }
}

// Export for Citizens/ClaudeNPC plugin integration
export const NPCBridge = {
  trackNPCDecision,
  getVortexHealth,
  SNAP_IN_THRESHOLD,
  generateAtomTag
};
