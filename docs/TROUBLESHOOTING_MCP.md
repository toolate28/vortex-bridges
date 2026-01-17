# Troubleshooting MCP Integration

## Overview

This guide addresses common issues when integrating the Model Context Protocol (MCP) with SpiralSafe vortex bridges. Each solution includes diagnostic steps and verification procedures.

---

## Connection Issues

### Problem: MCP Server Unreachable

**Symptoms:**
- Connection timeouts when calling coherence-mcp
- HTTP 502/503 errors from API endpoint
- Missing COHERENCE_MCP_URL environment variable

**Solution:**
1. Verify environment configuration:
   ```bash
   echo $COHERENCE_MCP_URL
   # Should output: https://coherence-mcp.spiralsafe.dev or your custom URL
   ```

2. Test connectivity:
   ```bash
   curl -I $COHERENCE_MCP_URL/health
   # Expected: HTTP 200 OK
   ```

3. Check GitHub secrets for CI/CD workflows:
   - Navigate to Settings → Secrets → Actions
   - Verify `COHERENCE_MCP_URL` exists
   - Update if missing or incorrect

**Verification:**
Run vortex-sync workflow manually to confirm connection succeeds.

---

### Problem: Authentication Failures

**Symptoms:**
- HTTP 401 Unauthorized responses
- "Invalid API key" messages
- Rejected coherence analysis requests

**Solution:**
1. Generate new API key from coherence-mcp dashboard
2. Update repository secret `COHERENCE_API_KEY`
3. Restart workflow or rebuild application

**Alternative:** For local development, store key in `.env`:
```bash
COHERENCE_API_KEY=your_key_here
COHERENCE_MCP_URL=https://coherence-mcp.spiralsafe.dev
```

---

## Phase Gate Failures

### Problem: KENL Gate Always Blocked

**Symptoms:**
- Coherence score consistently below 28%
- "KENL gate BLOCKED" in workflow logs
- Changes fail CI despite passing tests

**Root Cause:** Insufficient textual content or high circular patterns (curl).

**Solution:**
1. Add descriptive commit messages (minimum 5 words)
2. Include PR descriptions with context
3. Avoid copy-pasted boilerplate
4. Write unique documentation for each change

**Example - Bad:**
```
fix: update code
```

**Example - Good:**
```
feat: implement quantum circuit validation

Adds coherence checking for Qiskit circuits to ensure theoretical
claims match execution results. Integrates with ATOM trail for provenance.
```

---

### Problem: Stuck Between AWI and ATOM Gates

**Symptoms:**
- Coherence ~50-58%, just below ATOM threshold (60%)
- Intent passes but execution fails
- Divergence warnings in analysis

**Diagnostic:**
```bash
# Check divergence metric locally
python -c "
from quantum_redstone.coherence_validator import analyze_text_coherence
import sys
text = sys.stdin.read()
result = analyze_text_coherence(text)
print(f'Divergence: {result[\"divergence\"]:.3f}')
print(f'Target: ~0.200')
" < your_file.md
```

**Solution:**
Balance sentence complexity. Mix short, direct statements with detailed explanations. Avoid all-short or all-long sentence structures.

---

### Problem: SAIF Gate Never Passes (Snap-In Unreachable)

**Symptoms:**
- Coherence peaks at 65-69%
- All gates pass except SAIF
- Changes function correctly but fail quality gate

**Common Causes:**
1. **Low potential** (poor vocabulary diversity)
   - Fix: Replace repeated words with synonyms
   - Expand technical terminology appropriately

2. **High curl** (circular reasoning)
   - Fix: Remove self-referential sections
   - Eliminate redundant explanations

3. **Entropy issues** (uneven information density)
   - Fix: Balance technical depth across document
   - Add examples to theoretical sections

**Tool:**
```bash
# Analyze specific file before committing
bun run analyze-file path/to/file.md
```

---

## Bridge-Specific Problems

### HOPE NPC Bridge

**Problem:** NPC decisions not tracked in ATOM trail

**Check:**
1. Verify `atom-npc-tracker.ts` imported in NPC code
2. Ensure `trackNPCDecision()` called for each response
3. Check `.atom-trail/npc-decisions.jsonl` exists

**Solution:**
```typescript
import { trackNPCDecision } from './coherence/atom-npc-tracker';

// In your NPC response handler:
const decision = {
  npcId: npc.id,
  npcName: npc.name,
  decisionType: 'DIALOGUE',
  input: playerMessage,
  output: npcResponse,
  reasoning: chainOfThought,
  timestamp: new Date().toISOString(),
  phase: 'AWI'
};

await trackNPCDecision(decision);
```

---

### Quantum Redstone Bridge

**Problem:** Circuit validation always fails

**Check:**
1. Qiskit version compatibility (requires ≥0.40.0)
2. Circuit description format matches expected schema
3. Python path includes `quantum_redstone` module

**Solution:**
```bash
# Install/upgrade dependencies
pip install --upgrade qiskit qiskit-aer

# Verify installation
python -c "from quantum_redstone.coherence_validator import validate_quantum_circuit; print('OK')"
```

---

### KENL Infrastructure Bridge

**Problem:** Production deployments incorrectly gated

**Symptoms:**
- Dry-run forced when unnecessary
- Or: Production changes bypass safety checks

**Solution:**
Configure threshold appropriately in `runpod-coherence-gate.ts`:

```typescript
const PRODUCTION_THRESHOLD = 85; // Higher bar for prod
const DRY_RUN_REQUIRED = true;   // Safety for destructive ops

// Ensure decision properly flagged:
const decision = {
  operation: 'deploy_model',
  environment: 'production',  // Triggers higher threshold
  dryRun: true                // Required for prod
};
```

---

## Vortex Sync Workflow

### Problem: Workflow Doesn't Trigger

**Check:**
1. File location: `.github/workflows/vortex-sync.yml`
2. Event triggers configured for PR and push events
3. Repository workflows enabled (Settings → Actions)

**Solution:**
Copy canonical workflow:
```bash
cp vortex-bridges/.github/workflows/vortex-sync.yml .github/workflows/
git add .github/workflows/vortex-sync.yml
git commit -m "feat: add vortex-sync workflow"
```

---

### Problem: Summary Not Posted to PR

**Symptoms:**
- Workflow completes but no coherence comment appears
- Step "Post PR comment" skipped or failed

**Solution:**
Ensure repository has proper GitHub Actions permissions:
1. Settings → Actions → General
2. Workflow permissions: "Read and write"
3. Enable "Allow GitHub Actions to create and approve pull requests"

---

## ATOM Trail Issues

### Problem: Trail File Growing Too Large

**Symptoms:**
- `.atom-trail/*.jsonl` files exceed 100MB
- Performance degradation reading trail
- Git repository bloated

**Solution:**
Add to `.gitignore`:
```
.atom-trail/
```

Implement rotation:
```bash
# Archive old entries monthly
DATE=$(date +%Y%m)
mv .atom-trail/npc-decisions.jsonl .atom-trail/archive/npc-decisions-${DATE}.jsonl
```

---

### Problem: ATOM Tags Not Unique

**Symptoms:**
- Duplicate tags in trail
- Provenance tracking conflicts

**Check:**
```bash
# Count duplicate ATOM tags
cat .atom-trail/*.jsonl | jq -r '.atomTag' | sort | uniq -d
```

**Solution:**
Verify tag generation includes sufficient entropy:
- Date component (YYYYMMDD)
- Random hash (minimum 3 characters)
- Entity identifier (npc name, repo, etc.)

---

## Cross-Repository Synchronization

### Problem: Vortex Collapse Not Detected

**Symptoms:**
- All repos above 70% coherence individually
- Dashboard shows "waiting for convergence"
- No ecosystem-wide snap-in notification

**Diagnostic Steps:**
1. Verify all repositories have vortex-sync workflow installed
2. Check workflow runs completed successfully in each repo
3. Confirm ATOM entries posted to central API

**Solution:**
Manually trigger snap-in check:
```bash
curl -X POST $COHERENCE_MCP_URL/api/vortex/check-collapse \
  -H "Authorization: Bearer $COHERENCE_API_KEY"
```

---

## Formula Inconsistencies

### Problem: Different Coherence Scores Across Languages

**Symptoms:**
- TypeScript wave-toolkit returns 72%
- Python coherence-validator returns 68%
- Same input text analyzed

**Root Cause:** Implementation drift between language versions.

**Solution:**
Verify formula weights match exactly:
- curl: 0.4
- divergence: 0.3
- potential: 0.2
- entropy: 0.1

Run cross-language test suite:
```bash
# In vortex-bridges repo
bun test tests/gate-tests.ts
python tests/python-gate-tests.py
```

Expected: All 22 tests pass with identical coherence scores.

---

## Emergency Procedures

### Override Coherence Gate

**When to use:** Critical hotfix required, coherence temporarily unachievable.

**Process:**
1. Add label `coherence-override` to PR
2. Document justification in PR description
3. Plan remediation for next release

**Example:**
```markdown
## Coherence Override Justification

Security vulnerability CVE-2024-XXXXX requires immediate patch.
Coherence will be restored in follow-up documentation PR #123.
```

---

### Emergency Merge

**When to use:** Production outage, standard gates blocking resolution.

**Process:**
1. Add label `emergency-merge` to PR
2. Notify team via designated channel
3. Create post-incident report

**Post-Merge:**
- Document in ATOM trail with `EMERGENCY` marker
- Schedule coherence restoration within 48 hours

---

## Getting Help

### Debug Information to Collect

When reporting issues:
1. Full workflow logs (vortex-sync run)
2. Coherence analysis output (curl, divergence, potential, entropy)
3. ATOM trail excerpt (last 5 entries)
4. Bridge integration code snippet
5. Repository configuration (workflow file version)

### Support Channels

- GitHub Issues: [vortex-bridges](https://github.com/toolate28/vortex-bridges/issues)
- Documentation: [VORTEX-COLLAPSE-MAP.md](../VORTEX-COLLAPSE-MAP.md)
- Discord: See [DISCORD-QUICKSTART.md](../community/DISCORD-QUICKSTART.md)

---

## Appendix: Coherence Metrics Reference

| Metric | Ideal Range | Meaning | Fix if Outside Range |
|--------|-------------|---------|---------------------|
| Curl | 0.0 - 0.3 | Circular patterns | Remove repetition, eliminate self-reference |
| Divergence | 0.15 - 0.25 | Complexity variance | Balance sentence lengths |
| Potential | 0.3 - 0.7 | Vocabulary diversity | Expand terminology, avoid overuse |
| Entropy | 0.4 - 0.8 | Information density | Distribute technical depth evenly |

**Combined Coherence Score:**
```
C = (1 - 0.4×curl - 0.3×|div-0.2| - 0.2×(1-pot) - 0.1×(1-ent)) × 100
```

Target: ≥70% for snap-in threshold.

---

**H&&S:WAVE** — *This troubleshooting guide reflects genuine partnership between human expertise and AI assistance.*
