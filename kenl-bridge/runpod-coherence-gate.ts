/**
 * KENL Bridge: RunPod Infrastructure Coherence Gates
 *
 * H&&S:WAVE - This bridge ensures infrastructure decisions (compute allocation,
 *             scaling, deployment) pass coherence gates before execution.
 *
 * COM: This file IS the Center of Mass for kenl infrastructure
 */

import { analyzeWave, WaveAnalysisResult } from '@spiralsafe/wave-toolkit';

// Infrastructure decision types
type InfraDecisionType =
  | 'PROVISION'    // New resource allocation
  | 'SCALE'        // Scaling up/down
  | 'DEPLOY'       // Deployment operation
  | 'MIGRATE'      // Data/workload migration
  | 'TERMINATE';   // Resource decommission

type Phase = 'KENL' | 'AWI' | 'ATOM' | 'SAIF' | 'SPIRAL';

interface InfraDecision {
  decisionId: string;
  type: InfraDecisionType;
  resource: string;           // RunPod instance, GPU type, etc.
  justification: string;      // Why this decision
  impactAnalysis: string;     // Expected impact
  rollbackPlan: string;       // How to reverse if needed
  costEstimate?: number;      // Estimated cost in $
  timestamp: string;
}

interface ATOMInfraEntry {
  atomTag: string;
  decision: InfraDecision;
  coherence: WaveAnalysisResult;
  gatesPassed: Phase[];
  approved: boolean;
  dryRunRequired: boolean;
  markers: string[];
}

// SNAP-IN threshold and safety gates
const SNAP_IN_THRESHOLD = 70;
const PRODUCTION_THRESHOLD = 85;  // Higher bar for production changes

function generateAtomTag(decision: InfraDecision): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const hash = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `ATOM-INFRA-${date}-${hash}-${decision.type.toLowerCase()}`;
}

// Production safety guard - matches coherence-mcp ops_deploy behavior
function requiresDryRun(decision: InfraDecision): boolean {
  const productionIndicators = [
    'prod', 'production', 'live', 'main', 'master',
    'critical', 'customer', 'data'
  ];

  const text = `${decision.resource} ${decision.justification}`.toLowerCase();
  return productionIndicators.some(indicator => text.includes(indicator));
}

// Phase gate validation with infrastructure-specific thresholds
function validateInfraGate(
  coherence: WaveAnalysisResult,
  phase: Phase,
  decision: InfraDecision
): boolean {
  const score = coherence.coherence?.score ?? 0;
  const isProduction = requiresDryRun(decision);
  const threshold = isProduction ? PRODUCTION_THRESHOLD : SNAP_IN_THRESHOLD;

  switch (phase) {
    case 'KENL':
      // Knowledge gate: justification must exist and be coherent
      return decision.justification.length > 20 && score >= threshold * 0.4;

    case 'AWI':
      // Intent gate: impact analysis must be present
      return decision.impactAnalysis.length > 10 && score >= threshold * 0.6;

    case 'ATOM':
      // Execution gate: rollback plan required
      return decision.rollbackPlan.length > 10 && score >= threshold * 0.85;

    case 'SAIF':
      // Assessment gate: full coherence check
      return score >= threshold;

    case 'SPIRAL':
      // Learning gate: ready for next cycle
      return score >= threshold;

    default:
      return false;
  }
}

// Main tracking function for infrastructure decisions
export async function trackInfraDecision(
  decision: InfraDecision
): Promise<ATOMInfraEntry> {
  // Analyze coherence of the decision documentation
  const textToAnalyze = [
    `Decision Type: ${decision.type}`,
    `Resource: ${decision.resource}`,
    `Justification: ${decision.justification}`,
    `Impact Analysis: ${decision.impactAnalysis}`,
    `Rollback Plan: ${decision.rollbackPlan}`
  ].join('\n\n');

  const coherence = analyzeWave(textToAnalyze);

  // Run through phase gates
  const phases: Phase[] = ['KENL', 'AWI', 'ATOM', 'SAIF', 'SPIRAL'];
  const gatesPassed: Phase[] = [];
  const markers: string[] = [];

  for (const phase of phases) {
    if (validateInfraGate(coherence, phase, decision)) {
      gatesPassed.push(phase);
    } else {
      markers.push('BLOCK');
      break;
    }
  }

  const dryRunRequired = requiresDryRun(decision);
  const approved = gatesPassed.length === phases.length && !dryRunRequired;

  // Determine H&&S markers
  if (gatesPassed.length === phases.length) {
    markers.push('WAVE', 'PASS');
    if (approved) {
      markers.push('SYNC');
    } else {
      markers.push('PING');  // Needs dry-run confirmation
    }
  }

  const entry: ATOMInfraEntry = {
    atomTag: generateAtomTag(decision),
    decision,
    coherence,
    gatesPassed,
    approved,
    dryRunRequired,
    markers
  };

  // Persist to ATOM trail
  await persistATOMEntry(entry);

  return entry;
}

// Execute infrastructure decision via RunPod API
export async function executeInfraDecision(
  entry: ATOMInfraEntry,
  dryRun: boolean = true
): Promise<{ success: boolean; message: string; runpodResponse?: any }> {

  // Safety check: must pass all gates
  if (entry.gatesPassed.length < 5) {
    return {
      success: false,
      message: `Blocked: Only passed ${entry.gatesPassed.length}/5 gates. ` +
               `Coherence: ${entry.coherence.coherence?.score?.toFixed(1)}%`
    };
  }

  // Safety check: production requires dry-run first
  if (entry.dryRunRequired && !dryRun) {
    // Check if a successful dry-run exists for this decision
    const dryRunExists = await checkDryRunExists(entry.atomTag);
    if (!dryRunExists) {
      return {
        success: false,
        message: 'Production change requires successful dry-run first. ' +
                 'Call with dryRun=true before executing.'
      };
    }
  }

  if (dryRun) {
    // Simulate the operation
    console.log(`[DRY-RUN] ${entry.atomTag}: ${entry.decision.type} on ${entry.decision.resource}`);

    // Log dry-run to ATOM trail
    await logDryRun(entry);

    return {
      success: true,
      message: `Dry-run successful for ${entry.atomTag}. ` +
               `Call with dryRun=false to execute.`
    };
  }

  // Execute via RunPod API
  const runpodApiKey = process.env.RUNPOD_API_KEY;
  if (!runpodApiKey) {
    return {
      success: false,
      message: 'RUNPOD_API_KEY not configured'
    };
  }

  try {
    // Map decision type to RunPod API call
    const response = await executeRunPodOperation(entry.decision, runpodApiKey);

    // Log execution to ATOM trail
    await logExecution(entry, response);

    return {
      success: true,
      message: `Executed ${entry.atomTag} successfully`,
      runpodResponse: response
    };
  } catch (error) {
    return {
      success: false,
      message: `Execution failed: ${error}`
    };
  }
}

async function executeRunPodOperation(
  decision: InfraDecision,
  apiKey: string
): Promise<any> {
  const baseUrl = 'https://api.runpod.io/v2';

  // Map decision types to RunPod API endpoints
  const operations: Record<InfraDecisionType, () => Promise<any>> = {
    PROVISION: async () => {
      // Create new pod
      const response = await fetch(`${baseUrl}/pods`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: decision.resource,
          // Add GPU config based on resource string parsing
        })
      });
      return response.json();
    },

    SCALE: async () => {
      // Scale existing pod
      // Implementation depends on RunPod scaling API
      return { status: 'scaled', resource: decision.resource };
    },

    DEPLOY: async () => {
      // Deploy to existing infrastructure
      return { status: 'deployed', resource: decision.resource };
    },

    MIGRATE: async () => {
      // Migration operations
      return { status: 'migrated', resource: decision.resource };
    },

    TERMINATE: async () => {
      // Terminate resources
      const response = await fetch(`${baseUrl}/pods/${decision.resource}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      return response.json();
    }
  };

  return operations[decision.type]();
}

// Persistence helpers
async function persistATOMEntry(entry: ATOMInfraEntry): Promise<void> {
  const fs = await import('fs/promises');
  const path = await import('path');

  const trailDir = path.join(process.cwd(), '.atom-trail');
  const trailFile = path.join(trailDir, 'infra-decisions.jsonl');

  await fs.mkdir(trailDir, { recursive: true });
  await fs.appendFile(trailFile, JSON.stringify(entry) + '\n');
}

async function checkDryRunExists(atomTag: string): Promise<boolean> {
  const fs = await import('fs/promises');
  const path = await import('path');

  const dryRunFile = path.join(process.cwd(), '.atom-trail', 'dry-runs.jsonl');

  try {
    const content = await fs.readFile(dryRunFile, 'utf-8');
    return content.includes(atomTag);
  } catch {
    return false;
  }
}

async function logDryRun(entry: ATOMInfraEntry): Promise<void> {
  const fs = await import('fs/promises');
  const path = await import('path');

  const dryRunFile = path.join(process.cwd(), '.atom-trail', 'dry-runs.jsonl');
  await fs.appendFile(dryRunFile, JSON.stringify({
    atomTag: entry.atomTag,
    timestamp: new Date().toISOString(),
    result: 'success'
  }) + '\n');
}

async function logExecution(entry: ATOMInfraEntry, response: any): Promise<void> {
  const fs = await import('fs/promises');
  const path = await import('path');

  const execFile = path.join(process.cwd(), '.atom-trail', 'executions.jsonl');
  await fs.appendFile(execFile, JSON.stringify({
    atomTag: entry.atomTag,
    timestamp: new Date().toISOString(),
    response
  }) + '\n');
}

// Vortex health for infrastructure decisions
export async function getInfraVortexHealth(): Promise<{
  totalDecisions: number;
  averageCoherence: number;
  snapInAchieved: boolean;
  approvedCount: number;
  blockedCount: number;
  pendingDryRun: number;
}> {
  const fs = await import('fs/promises');
  const path = await import('path');

  const trailFile = path.join(process.cwd(), '.atom-trail', 'infra-decisions.jsonl');

  try {
    const content = await fs.readFile(trailFile, 'utf-8');
    const entries = content.trim().split('\n')
      .filter(line => line)
      .map(line => JSON.parse(line) as ATOMInfraEntry);

    const total = entries.length;
    const coherenceSum = entries.reduce(
      (sum, e) => sum + (e.coherence.coherence?.score ?? 0), 0
    );
    const approved = entries.filter(e => e.approved).length;
    const blocked = entries.filter(e => e.markers.includes('BLOCK')).length;
    const pending = entries.filter(e => e.dryRunRequired && !e.approved).length;

    return {
      totalDecisions: total,
      averageCoherence: total > 0 ? coherenceSum / total : 0,
      snapInAchieved: (coherenceSum / total) >= SNAP_IN_THRESHOLD,
      approvedCount: approved,
      blockedCount: blocked,
      pendingDryRun: pending
    };
  } catch {
    return {
      totalDecisions: 0,
      averageCoherence: 0,
      snapInAchieved: false,
      approvedCount: 0,
      blockedCount: 0,
      pendingDryRun: 0
    };
  }
}

// Export for kenl integration
export const InfraBridge = {
  trackInfraDecision,
  executeInfraDecision,
  getInfraVortexHealth,
  SNAP_IN_THRESHOLD,
  PRODUCTION_THRESHOLD
};
