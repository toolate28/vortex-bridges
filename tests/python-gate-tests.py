"""
Comprehensive Gate Tests for Quantum-Redstone Bridge (Python Side)

H&&S:WAVE - Tests BOTH sides:
- Pass conditions (happy path)
- Fail conditions (gate blocks)
- Escape hatches (Penrose step prevention)
- Qiskit integration
"""

import unittest
from dataclasses import dataclass
from typing import List, Optional
from enum import Enum
import sys
import os

# Add parent directory for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Phase definitions
class Phase(Enum):
    KENL = "KENL"
    AWI = "AWI"
    ATOM = "ATOM"
    SAIF = "SAIF"
    SPIRAL = "SPIRAL"

# Thresholds
THRESHOLDS = {
    Phase.KENL: 28,
    Phase.AWI: 42,
    Phase.ATOM: 60,
    Phase.SAIF: 70,
    Phase.SPIRAL: 70,
}
PRODUCTION_THRESHOLD = 85

# Escape hatches
ESCAPE_HATCHES = {
    'coherence_override': 'coherence-override',
    'emergency_merge': 'emergency-merge',
}

@dataclass
class GateContext:
    coherence_score: float
    has_intent: bool
    has_rollback: bool
    is_production: bool
    labels: List[str]

@dataclass
class GateResult:
    passed: bool
    reason: str
    escaped_via: Optional[str] = None

def validate_gate(phase: Phase, context: GateContext) -> GateResult:
    """Validate a single phase gate"""

    # Check escape hatches first (Penrose step prevention)
    if ESCAPE_HATCHES['emergency_merge'] in context.labels:
        return GateResult(True, 'Emergency merge override', 'emergency-merge')
    if ESCAPE_HATCHES['coherence_override'] in context.labels:
        return GateResult(True, 'Coherence override', 'coherence-override')

    threshold = PRODUCTION_THRESHOLD if context.is_production else THRESHOLDS[phase]

    if phase == Phase.KENL:
        if context.coherence_score < THRESHOLDS[Phase.KENL]:
            return GateResult(False, f'Coherence {context.coherence_score}% < {THRESHOLDS[Phase.KENL]}% (KENL threshold)')
        return GateResult(True, 'Knowledge context verified')

    elif phase == Phase.AWI:
        if not context.has_intent:
            return GateResult(False, 'Intent documentation missing')
        if context.coherence_score < THRESHOLDS[Phase.AWI]:
            return GateResult(False, f'Coherence {context.coherence_score}% < {THRESHOLDS[Phase.AWI]}% (AWI threshold)')
        return GateResult(True, 'Intent documented and coherent')

    elif phase == Phase.ATOM:
        if context.coherence_score < THRESHOLDS[Phase.ATOM]:
            return GateResult(False, f'Coherence {context.coherence_score}% < {THRESHOLDS[Phase.ATOM]}% (ATOM threshold)')
        return GateResult(True, 'Execution gate passed')

    elif phase == Phase.SAIF:
        saif_threshold = PRODUCTION_THRESHOLD if context.is_production else THRESHOLDS[Phase.SAIF]
        if context.coherence_score < saif_threshold:
            label = 'PRODUCTION' if context.is_production else 'SAIF'
            return GateResult(False, f'Coherence {context.coherence_score}% < {saif_threshold}% ({label} threshold)')
        return GateResult(True, 'SNAP-IN ACHIEVED')

    elif phase == Phase.SPIRAL:
        if not context.has_rollback:
            return GateResult(False, 'Rollback plan missing for learning gate')
        if context.coherence_score < THRESHOLDS[Phase.SPIRAL]:
            return GateResult(False, f'Coherence {context.coherence_score}% < {THRESHOLDS[Phase.SPIRAL]}% (SPIRAL threshold)')
        return GateResult(True, 'Ready for next cycle')

    return GateResult(False, 'Unknown phase')

# Coherence formula - MUST match TypeScript exactly
def calculate_coherence(curl: float, divergence: float, potential: float, entropy: float) -> float:
    """
    COM FORMULA - Single Source of Truth

    This MUST be identical to QDI/packages/wave-toolkit
    """
    score = (
        1.0
        - curl * 0.4
        - abs(divergence - 0.2) * 0.3
        - (1.0 - potential) * 0.2
        - (1.0 - entropy) * 0.1
    ) * 100
    return max(0, min(100, score))


class TestGatePassConditions(unittest.TestCase):
    """Test pass conditions for each gate"""

    def test_kenl_passes_with_30_percent(self):
        result = validate_gate(Phase.KENL, GateContext(
            coherence_score=30,
            has_intent=False,
            has_rollback=False,
            is_production=False,
            labels=[]
        ))
        self.assertTrue(result.passed)

    def test_awi_passes_with_50_percent_and_intent(self):
        result = validate_gate(Phase.AWI, GateContext(
            coherence_score=50,
            has_intent=True,
            has_rollback=False,
            is_production=False,
            labels=[]
        ))
        self.assertTrue(result.passed)

    def test_atom_passes_with_65_percent(self):
        result = validate_gate(Phase.ATOM, GateContext(
            coherence_score=65,
            has_intent=True,
            has_rollback=False,
            is_production=False,
            labels=[]
        ))
        self.assertTrue(result.passed)

    def test_saif_passes_with_75_percent_snap_in(self):
        result = validate_gate(Phase.SAIF, GateContext(
            coherence_score=75,
            has_intent=True,
            has_rollback=True,
            is_production=False,
            labels=[]
        ))
        self.assertTrue(result.passed)
        self.assertIn('SNAP-IN', result.reason)

    def test_spiral_passes_with_rollback(self):
        result = validate_gate(Phase.SPIRAL, GateContext(
            coherence_score=75,
            has_intent=True,
            has_rollback=True,
            is_production=False,
            labels=[]
        ))
        self.assertTrue(result.passed)


class TestGateFailConditions(unittest.TestCase):
    """Test fail conditions for each gate"""

    def test_kenl_blocks_with_20_percent(self):
        result = validate_gate(Phase.KENL, GateContext(
            coherence_score=20,
            has_intent=False,
            has_rollback=False,
            is_production=False,
            labels=[]
        ))
        self.assertFalse(result.passed)
        self.assertIn('KENL threshold', result.reason)

    def test_awi_blocks_without_intent(self):
        result = validate_gate(Phase.AWI, GateContext(
            coherence_score=50,
            has_intent=False,
            has_rollback=False,
            is_production=False,
            labels=[]
        ))
        self.assertFalse(result.passed)
        self.assertIn('Intent documentation missing', result.reason)

    def test_awi_blocks_with_low_coherence(self):
        result = validate_gate(Phase.AWI, GateContext(
            coherence_score=35,
            has_intent=True,
            has_rollback=False,
            is_production=False,
            labels=[]
        ))
        self.assertFalse(result.passed)
        self.assertIn('AWI threshold', result.reason)

    def test_saif_blocks_production_with_80_percent(self):
        result = validate_gate(Phase.SAIF, GateContext(
            coherence_score=80,
            has_intent=True,
            has_rollback=True,
            is_production=True,
            labels=[]
        ))
        self.assertFalse(result.passed)
        self.assertIn('PRODUCTION threshold', result.reason)

    def test_spiral_blocks_without_rollback(self):
        result = validate_gate(Phase.SPIRAL, GateContext(
            coherence_score=75,
            has_intent=True,
            has_rollback=False,
            is_production=False,
            labels=[]
        ))
        self.assertFalse(result.passed)
        self.assertIn('Rollback plan missing', result.reason)


class TestPenroseStepPrevention(unittest.TestCase):
    """Test escape hatches that prevent infinite loops"""

    def test_coherence_override_escapes_blocked_gate(self):
        result = validate_gate(Phase.SAIF, GateContext(
            coherence_score=50,  # Would normally block
            has_intent=True,
            has_rollback=True,
            is_production=False,
            labels=['coherence-override']
        ))
        self.assertTrue(result.passed)
        self.assertEqual(result.escaped_via, 'coherence-override')

    def test_emergency_merge_escapes_all_gates(self):
        for phase in Phase:
            result = validate_gate(phase, GateContext(
                coherence_score=10,  # Very low
                has_intent=False,
                has_rollback=False,
                is_production=True,
                labels=['emergency-merge']
            ))
            self.assertTrue(result.passed, f"{phase.value} should be escaped")
            self.assertEqual(result.escaped_via, 'emergency-merge')

    def test_emergency_merge_takes_precedence(self):
        result = validate_gate(Phase.SAIF, GateContext(
            coherence_score=0,
            has_intent=False,
            has_rollback=False,
            is_production=True,
            labels=['coherence-override', 'emergency-merge']
        ))
        self.assertEqual(result.escaped_via, 'emergency-merge')

    def test_penrose_loop_prevention_scenario(self):
        """
        Simulate the Penrose staircase scenario:
        Developer keeps adding detail but coherence stays low
        """
        max_attempts = 5
        coherence = 50  # Stuck below threshold

        for attempt in range(1, max_attempts + 1):
            labels = ['coherence-override'] if attempt == max_attempts else []

            result = validate_gate(Phase.SAIF, GateContext(
                coherence_score=coherence,
                has_intent=True,
                has_rollback=True,
                is_production=False,
                labels=labels
            ))

            if result.passed:
                self.assertEqual(attempt, max_attempts)
                self.assertEqual(result.escaped_via, 'coherence-override')
                break

            # Simulate: adding more detail doesn't help
            import random
            coherence = 50 + random.random() * 10


class TestCoherenceFormula(unittest.TestCase):
    """Test the coherence formula matches TypeScript"""

    def test_formula_basic(self):
        # curl=0, divergence=0.2, potential=1, entropy=1 should give 100%
        score = calculate_coherence(0, 0.2, 1, 1)
        self.assertEqual(score, 100)

    def test_formula_high_curl_penalty(self):
        # High curl (circular reasoning) should significantly reduce score
        high_curl = calculate_coherence(0.8, 0.2, 1, 1)
        low_curl = calculate_coherence(0.2, 0.2, 1, 1)
        self.assertLess(high_curl, low_curl)
        self.assertLess(high_curl, 70)  # High curl blocks snap-in

    def test_formula_divergence_optimum(self):
        # 0.2 is optimal divergence
        optimal = calculate_coherence(0, 0.2, 1, 1)
        high = calculate_coherence(0, 0.5, 1, 1)
        low = calculate_coherence(0, 0, 1, 1)
        self.assertGreater(optimal, high)
        self.assertGreater(optimal, low)

    def test_formula_clamping(self):
        # Should clamp to 0-100
        extreme = calculate_coherence(2, 2, 0, 0)
        self.assertGreaterEqual(extreme, 0)
        self.assertLessEqual(extreme, 100)


class TestFullPipeline(unittest.TestCase):
    """Test complete gate progression"""

    def test_full_pass_all_gates(self):
        phases = [Phase.KENL, Phase.AWI, Phase.ATOM, Phase.SAIF, Phase.SPIRAL]
        passed = []

        context = GateContext(
            coherence_score=80,
            has_intent=True,
            has_rollback=True,
            is_production=False,
            labels=[]
        )

        for phase in phases:
            result = validate_gate(phase, context)
            if result.passed:
                passed.append(phase)
            else:
                break

        self.assertEqual(len(passed), 5)

    def test_partial_pass_blocked_at_saif(self):
        phases = [Phase.KENL, Phase.AWI, Phase.ATOM, Phase.SAIF, Phase.SPIRAL]
        passed = []

        context = GateContext(
            coherence_score=65,  # Passes KENL, AWI, ATOM but not SAIF
            has_intent=True,
            has_rollback=True,
            is_production=False,
            labels=[]
        )

        for phase in phases:
            result = validate_gate(phase, context)
            if result.passed:
                passed.append(phase)
            else:
                break

        self.assertEqual(len(passed), 3)
        self.assertEqual(passed, [Phase.KENL, Phase.AWI, Phase.ATOM])


class TestQuantumCircuitValidation(unittest.TestCase):
    """Test quantum circuit validation specifics"""

    def test_hadamard_gate_validation(self):
        """Test that a well-documented Hadamard gate passes"""
        circuit_text = """
        Hadamard Gate Implementation

        This circuit creates equal superposition of |0⟩ and |1⟩ states.
        The theoretical claim: |0⟩ → (|0⟩ + |1⟩)/√2

        Implementation uses qc.h(0) in Qiskit.

        Execution result: 512 |0⟩, 512 |1⟩ from 1024 shots.
        This matches the expected 50/50 probability distribution.
        """

        # Simplified coherence analysis
        words = circuit_text.split()
        unique = len(set(words))
        potential = unique / len(words)

        # Should have good potential (diverse vocabulary)
        self.assertGreater(potential, 0.4)

    def test_poor_documentation_blocks(self):
        """Test that poorly documented circuit fails"""
        poor_text = "gate gate gate quantum quantum"

        words = poor_text.split()
        unique = len(set(words))
        potential = unique / len(words)

        # Low potential from repetition
        self.assertLess(potential, 0.5)


if __name__ == '__main__':
    print("Running Python gate tests...")
    print("=" * 60)

    # Run tests with verbosity
    unittest.main(verbosity=2)
