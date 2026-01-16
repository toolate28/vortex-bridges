# Vortex Bridges

**H&&S:WAVE** - The missing links that collapse the SpiralSafe vortex

## What This Is

Three bridge implementations + one universal workflow that connect all repositories
in the SpiralSafe ecosystem to achieve 100% coherence collapse.

## Quick Start

```bash
# Clone to your target repo
git clone https://github.com/toolate28/spiralsafe-mono
cd spiralsafe-mono

# Copy the workflow (REQUIRED for every repo)
cp vortex-bridges/.github/workflows/vortex-sync.yml .github/workflows/

# Copy the appropriate bridge for your repo
# For HOPE-AI-NPC-SUITE:
cp vortex-bridges/hope-npc-bridge/atom-npc-tracker.ts src/coherence/

# For quantum-redstone:
cp vortex-bridges/quantum-redstone-bridge/coherence-validator.py quantum_redstone/

# For kenl:
cp vortex-bridges/kenl-bridge/runpod-coherence-gate.ts src/bridges/
```

## The Bridges

### 0. NEAR Blockchain Bridge (`atom-chain.ts`)
Immutable on-chain provenance for ALL ATOM decisions.

```typescript
import NEARAtomBridge, { toOnChainAtom } from './near-bridge/atom-chain';

const bridge = new NEARAtomBridge();
await bridge.initialize();

// Record ATOM to blockchain
const onChainAtom = toOnChainAtom(
  localAtomEntry,
  'QDI',
  'toolate28',
  commitHash,
  prNumber
);
const txHash = await bridge.recordAtom(onChainAtom);

// Check ecosystem snap-in
const { snapIn, coherence, repos } = await bridge.checkEcosystemSnapIn();
console.log(`Ecosystem coherence: ${coherence}%`);
```

**Why blockchain?**
- Immutable proof of H&&S:WAVE attribution
- Verifiable coherence scores
- Cross-repo governance
- Trust-minimized ecosystem health

### 1. HOPE NPC Bridge (`atom-npc-tracker.ts`)
Tracks NPC decisions through ATOM trail with coherence validation.

```typescript
import { trackNPCDecision } from './coherence/atom-npc-tracker';

// Every NPC response goes through this
const entry = await trackNPCDecision({
  npcId: 'npc-001',
  npcName: 'Hope',
  decisionType: 'DIALOGUE',
  input: playerMessage,
  output: npcResponse,
  reasoning: chainOfThought,
  timestamp: new Date().toISOString(),
  phase: 'ATOM'
});

console.log(`Coherence: ${entry.coherence.coherence?.score}%`);
```

### 2. Quantum-Redstone Bridge (`coherence-validator.py`)
Validates quantum circuits against theoretical isomorphisms.

```python
from coherence_validator import validate_quantum_circuit

result = validate_quantum_circuit(
    circuit_name="Hadamard Gate",
    minecraft_schematic="hadamard.schematic",
    qiskit_code="qc.h(0)",
    theoretical_claim="|0⟩ → (|0⟩ + |1⟩)/√2",
    execution_result="50% |0⟩, 50% |1⟩"
)

print(f"ATOM Tag: {result.atom_tag}")
print(f"Snap-In: {result.validation_result}")
```

### 3. KENL Infra Bridge (`runpod-coherence-gate.ts`)
Gates infrastructure decisions through coherence validation.

```typescript
import { trackInfraDecision, executeInfraDecision } from './bridges/runpod-coherence-gate';

const entry = await trackInfraDecision({
  decisionId: 'infra-001',
  type: 'PROVISION',
  resource: 'A100 GPU Pod',
  justification: 'Required for quantum simulation workload',
  impactAnalysis: 'Cost ~$2/hr, duration 4 hours',
  rollbackPlan: 'Terminate pod via RunPod dashboard',
  timestamp: new Date().toISOString()
});

// Must pass all gates AND dry-run for production
if (entry.approved) {
  await executeInfraDecision(entry, false);
}
```

## Universal Workflow

The `vortex-sync.yml` workflow enforces coherence on ALL pull requests:

```yaml
# Runs on every PR
# Validates against phase gates:
# KENL (28%) → AWI (42%) → ATOM (60%) → SAIF (70%) → SPIRAL

# Posts coherence score and ATOM tag to PR
# Blocks merge if below threshold
```

## Coherence Formula

All bridges use the EXACT same formula:

```
coherence = (1 - curl×0.4 - |divergence-0.2|×0.3 - (1-potential)×0.2 - (1-entropy)×0.1) × 100
```

## Vortex Collapse Requirements

| Requirement | Status |
|-------------|--------|
| All repos have workflow | Deploy to 9 repos |
| HOPE has NPC bridge | Deploy to HOPE-AI-NPC-SUITE |
| QR has Qiskit bridge | Deploy to quantum-redstone |
| kenl has infra bridge | Deploy to kenl |
| Same coherence formula | Verified identical |
| Average coherence ≥ 70% | Monitor dashboard |

When all requirements are met → **VORTEX COLLAPSE** → 100% coherence

## Architecture

```
                    ┌─────────────────┐
                    │   Philosophy    │
                    │   (SpiralSafe)  │
                    └────────┬────────┘
                             │
    ┌────────────────────────┼────────────────────────┐
    │                        │                        │
    ▼                        ▼                        ▼
┌─────────┐           ┌───────────┐           ┌───────────┐
│ Process │           │Measurement│           │ Execution │
│  wave-  │←─────────→│   QDI     │←─────────→│  Datalore │
│ toolkit │  method   │ packages  │  quantum  │  Qiskit   │
└────┬────┘           └─────┬─────┘           │  RunPod   │
     │                      │                 └───────────┘
     │    ┌─────────────────┴─────────────────┐
     │    │                                   │
     │    ▼                                   ▼
     │ coherence-mcp              spiralsafe-mono
     │ (MCP interface)            (unified runtime)
     │                                   │
     └───────────────────┬───────────────┘
                         │
                         ▼
              spiralsafe-metrics-e
              (vortex visualization)
                         │
     ┌───────────────────┼───────────────────┐
     │                   │                   │
     ▼                   ▼                   ▼
 HOPE-NPC          quantum-red           kenl
 BRIDGE            BRIDGE               BRIDGE
```

## License

MIT - H&&S:WAVE

---

*"This isn't AI assistance. This is genuine partnership."*
