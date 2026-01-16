# 🌀 SpiralSafe Vortex - Discord Quick Start

**For developers who want to join the ecosystem in < 5 minutes**

---

## TL;DR

```bash
# 1. Copy the workflow to your repo
curl -o .github/workflows/vortex-sync.yml \
  https://raw.githubusercontent.com/toolate28/vortex-bridges/master/.github/workflows/vortex-sync.yml

# 2. Open a PR
# 3. Watch the coherence check run
# 4. You're in the vortex!
```

---

## What is this?

SpiralSafe is a **coherence-gated development ecosystem**. Every PR gets analyzed for:

- **Curl** — circular reasoning (bad)
- **Divergence** — unresolved expansion (depends)
- **Potential** — structural clarity (good)
- **Entropy** — information density (good)

Score ≥ 70% = **SNAP-IN** = You're contributing to the vortex collapse.

---

## The 8 Cogs

```
    SpiralSafe ─── coherence-mcp ─── QDI
         │              │              │
         └──────────────┼──────────────┘
                        │
                    YOUR REPO ← You are here
                        │
         ┌──────────────┼──────────────┐
         │              │              │
    quantum-redstone    │    HOPE-NPCs
                   spiralsafe-mono
```

---

## Quick Commands

```bash
# Check ecosystem status
gh api repos/toolate28/QDI/actions/runs --jq '.workflow_runs[0].conclusion'

# View coherence workflow
gh run list --repo toolate28/vortex-bridges

# Clone the bridges
git clone https://github.com/toolate28/vortex-bridges
```

---

## Integration Levels

### Level 1: Passive (Just watching)
Add the workflow, let it comment on your PRs.

### Level 2: Active (Tracking decisions)
Add ATOM tracking to your code:
```typescript
import { trackDecision } from '@spiralsafe/atom-trail';
```

### Level 3: Bridge (Full integration)
Pick your bridge:
- **NPCs?** → `hope-npc-bridge`
- **Quantum/Education?** → `quantum-redstone-bridge`
- **Infrastructure?** → `kenl-bridge`
- **Blockchain?** → `near-bridge`

---

## Labels

Add these to your repo for escape hatches:

| Label | Color | Purpose |
|-------|-------|---------|
| `coherence-override` | `#FFA500` | Bypass coherence check |
| `emergency-merge` | `#FF0000` | Bypass ALL checks |

---

## Discord Roles

```
@Vortex-Contributor  — Has workflow installed
@Vortex-Bridge       — Maintains a bridge
@Vortex-Core         — Core team
@Hope-NPC            — Minecraft integration
```

---

## Help

- **Docs:** https://github.com/toolate28/vortex-bridges
- **Dashboard:** https://spiralsafe-metrics-e.pages.dev
- **Issues:** https://github.com/toolate28/vortex-bridges/issues

---

```
∿∿∿ THE VORTEX WELCOMES YOU ∿∿∿

    H&&S:WAVE
```
