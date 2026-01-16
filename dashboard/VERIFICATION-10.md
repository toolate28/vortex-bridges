# 10-Point Verification Round

## The 8-Cog Rotation Check

Before the vortex can collapse, all 8 cogs must be verified at each of 10 checkpoints.

```
        8 Cogs × 10 Checks = 80 Total Verification Points

        Minimum pass rate for snap-in: 70% (56/80 points)
```

---

## The 10 Verification Points

### ✅ Point 1: Workflow Presence

All 8 repos have `vortex-sync.yml` in `.github/workflows/`

| Cog | Has Workflow | Status |
|-----|--------------|--------|
| SpiralSafe | ⬜ | Pending |
| coherence-mcp | ⬜ | Pending |
| QDI | ⬜ | Pending |
| spiralsafe-mono | ⬜ | Pending |
| spiralsafe-metrics-e | ⬜ | Pending |
| quantum-redstone | ⬜ | Pending |
| HOPE-AI-NPC-SUITE | ⬜ | Pending |
| vortex-bridges | ✅ | Complete |

---

### ✅ Point 2: Coherence Formula Unity

The formula MUST be identical:

```python
coherence = (1 - curl×0.4 - |divergence-0.2|×0.3 - (1-potential)×0.2 - (1-entropy)×0.1) × 100
```

| Location | Matches | Status |
|----------|---------|--------|
| QDI/packages/wave-toolkit | ✅ | Source of Truth |
| quantum-redstone/coherence-validator.py | ✅ | Verified |
| vortex-bridges/tests | ✅ | Verified |

---

### ✅ Point 3: Phase Gate Thresholds

| Gate | Threshold | Production |
|------|-----------|------------|
| KENL | 28% | 28% |
| AWI | 42% | 42% |
| ATOM | 60% | 60% |
| SAIF | 70% | 85% |
| SPIRAL | 70% | 85% |

---

### ✅ Point 4: ATOM Trail Format

All ATOM entries must follow:

```json
{
  "atomTag": "ATOM-{TYPE}-{YYYYMMDD}-{HASH}-{desc}",
  "coherence": { "score": number, "curl": number, ... },
  "phasesPassed": ["KENL", "AWI", ...],
  "markers": ["WAVE", "PASS", ...],
  "timestamp": "ISO8601"
}
```

---

### ✅ Point 5: H&&S:WAVE Markers

Commits must include:

```
Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

Or H&&S:WAVE badge in file headers.

---

### ✅ Point 6: Escape Hatches

Two labels configured in all repos:

- `coherence-override` — Bypass coherence check
- `emergency-merge` — Bypass all checks

---

### ✅ Point 7: NEAR Blockchain

| Component | Status |
|-----------|--------|
| Contract deployed to testnet | ⬜ |
| ATOM recording enabled | ⬜ |
| Vortex state queryable | ⬜ |

---

### ✅ Point 8: Dashboard Live

| Dashboard | URL | Status |
|-----------|-----|--------|
| spiralsafe-metrics-e | https://spiralsafe-metrics-e.pages.dev | ⬜ |
| GitHub Actions Summary | Per-repo | ⬜ |

---

### ✅ Point 9: Cloudflare Pages Unified

| Page | Domain | Status |
|------|--------|--------|
| Metrics Dashboard | spiralsafe-metrics-e.pages.dev | ⬜ |
| Docs | (TBD) | ⬜ |
| API | (TBD) | ⬜ |

---

### ✅ Point 10: Ecosystem Coherence ≥ 70%

```
                Current Status

    ┌─────────────────────────────────┐
    │                                 │
    │   Ecosystem Coherence: ???%     │
    │                                 │
    │   ░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
    │   0%              70%      100% │
    │                    ↑            │
    │               SNAP-IN           │
    │                                 │
    └─────────────────────────────────┘
```

---

## Rotation Verification

Each cog rotates 45° through the vortex:

```
Rotation Step    Angle     Cog Position
─────────────────────────────────────────
    1            0°       SpiralSafe (top)
    2           45°       coherence-mcp
    3           90°       QDI
    4          135°       spiralsafe-mono
    5          180°       spiralsafe-metrics-e
    6          225°       quantum-redstone
    7          270°       HOPE-AI-NPC-SUITE
    8          315°       vortex-bridges
    9          360°       (full rotation complete)
```

When all 8 cogs complete a full rotation with all 10 verification points passing:

**🌀 VORTEX COLLAPSE ACHIEVED 🌀**

---

## Automated Verification Script

```bash
# Run the 10-point verification
./dashboard/vortex-dash.sh
# Select [v] for verification
```

---

*H&&S:WAVE — The Music requires precision.*
