# Troubleshooting MCP Integration

## Overview

This guide helps resolve common issues with Model Context Protocol (MCP) integration in the SpiralSafe vortex ecosystem. Each section provides symptoms, diagnostic steps, and solutions. The troubleshooting framework follows phase gate principles, ensuring systematic problem resolution.

---

## Connection Issues

### Problem: MCP Server Unreachable

**Symptoms:** Connection timeouts occur when calling coherence-mcp. HTTP 502 or 503 errors appear from API endpoints. The COHERENCE_MCP_URL environment variable may be missing.

**Solution:** First verify your environment configuration. Check the URL variable is set correctly. Test connectivity to the MCP endpoint directly. Confirm GitHub secrets exist for automated workflows.

```bash
echo $COHERENCE_MCP_URL
curl -I $COHERENCE_MCP_URL/health
```

Navigate to repository Settings, then Secrets, then Actions. Verify COHERENCE_MCP_URL exists and contains the correct endpoint. Update the secret if missing or incorrect.

**Verification:** Run the vortex-sync workflow manually. Confirm the connection succeeds without errors.

---

### Problem: Authentication Failures

**Symptoms:** HTTP 401 errors indicate unauthorized access. Messages show invalid API keys. Analysis requests are rejected by the server.

**Solution:** Generate a fresh API key from the coherence-mcp dashboard interface. Update your repository secret named COHERENCE_API_KEY with the new value. Restart any running workflows or rebuild your application to load the updated credentials.

For local development environments, store credentials in a .env file:
```bash
COHERENCE_API_KEY=your_key_here
COHERENCE_MCP_URL=https://coherence-mcp.spiralsafe.dev
```

---

## Phase Gate Failures

### Problem: KENL Gate Always Blocked

**Symptoms:** Coherence scores remain consistently below the 28% threshold. Workflow logs display "KENL gate BLOCKED" messages. Changes fail continuous integration despite passing all unit tests.

**Root Cause:** The knowledge gate requires sufficient textual content with low circular patterns. Minimal commit messages or repetitive documentation causes failures.

**Solution:** Write descriptive commit messages containing at least five meaningful words. Include pull request descriptions that provide context and reasoning. Avoid copying boilerplate text across multiple files. Create unique documentation for each distinct change.

Compare these examples:
```
Bad:  fix: update code
Good: feat: implement quantum circuit validation for Qiskit
```

The good example provides context and describes the actual feature being added.

---

### Problem: Stuck Between AWI and ATOM Gates

**Symptoms:** Coherence scores range from 50% to 58%, falling just below the 60% ATOM threshold. The AWI intent gate passes successfully, but execution validation fails. Analysis reports show divergence metric warnings.

**Diagnostic:** Check the divergence metric locally before committing changes. Use the quantum_redstone validator to analyze text files. Compare results against the target value of approximately 0.200.

```bash
python -c "from quantum_redstone.coherence_validator import analyze_text_coherence; 
import sys; text = sys.stdin.read(); result = analyze_text_coherence(text); 
print(f'Divergence: {result[\"divergence\"]:.3f}')" < your_file.md
```

**Solution:** Balance sentence complexity throughout your documentation. Mix concise statements with detailed explanations. Avoid using exclusively short sentences or exclusively long complex structures. Aim for natural variation in sentence length.

---

### Problem: SAIF Gate Never Passes

**Symptoms:** Coherence peaks between 65% and 69%, preventing snap-in at the 70% threshold. All preceding gates pass successfully. Changes function correctly but fail the final quality gate.

**Common Causes:** Three primary issues prevent SAIF passage. First, low vocabulary diversity reduces potential scores. Second, circular reasoning patterns increase curl metrics. Third, uneven information density affects entropy calculations.

**Solutions by Cause:**

*Low Potential:* Replace repeated words with appropriate synonyms. Expand technical terminology where contextually relevant. Maintain precision while varying expression.

*High Curl:* Remove self-referential documentation sections. Eliminate redundant explanations that restate earlier points. Express each concept once clearly.

*Entropy Issues:* Balance technical depth consistently across the document. Add concrete examples to theoretical sections. Distribute complexity evenly.

**Tool:** Analyze files locally before committing changes:
```bash
bun run analyze-file path/to/file.md
```

---

## Bridge-Specific Problems

### HOPE NPC Bridge

**Problem:** NPC decisions do not appear in the ATOM trail logs.

**Diagnostic Checklist:** Verify the atom-npc-tracker module is properly imported in your NPC code. Ensure the trackNPCDecision function runs for each response. Check that the file .atom-trail/npc-decisions.jsonl exists in your project directory.

**Solution:** Import the tracking module and call it within your NPC response handler:
```typescript
import { trackNPCDecision } from './coherence/atom-npc-tracker';

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

**Problem:** Quantum circuit validation consistently fails regardless of circuit correctness.

**Diagnostic Checklist:** Confirm Qiskit version meets minimum requirement of 0.40.0 or higher. Verify circuit description format matches the expected schema structure. Check that Python's module path includes the quantum_redstone package.

**Solution:** Upgrade dependencies to compatible versions:
```bash
pip install --upgrade qiskit qiskit-aer
python -c "from quantum_redstone.coherence_validator import validate_quantum_circuit; print('OK')"
```

The second command verifies successful installation. If it prints "OK" without errors, the bridge is correctly configured.

---

### KENL Infrastructure Bridge

**Problem:** Production deployments encounter incorrect gating behavior. Either dry-runs are forced unnecessarily, or production changes bypass required safety checks.

**Solution:** Configure thresholds appropriately in the runpod-coherence-gate module. Production deployments require an 85% coherence threshold. Destructive operations must enable dry-run mode.

```typescript
const PRODUCTION_THRESHOLD = 85;
const DRY_RUN_REQUIRED = true;

const decision = {
  operation: 'deploy_model',
  environment: 'production',
  dryRun: true
};
```

Ensure each decision object properly flags the environment. This triggers the appropriate validation threshold.

---

## Vortex Sync Workflow

### Problem: Workflow Doesn't Trigger

**Diagnostic Checklist:** Confirm the workflow file exists at .github/workflows/vortex-sync.yml in your repository. Verify event triggers include both pull request and push events. Check that GitHub Actions are enabled in repository settings.

**Solution:** Copy the canonical workflow file from vortex-bridges repository:
```bash
cp vortex-bridges/.github/workflows/vortex-sync.yml .github/workflows/
git add .github/workflows/vortex-sync.yml
git commit -m "feat: add vortex-sync workflow"
```

Push the changes to trigger the workflow. Verify it appears in the Actions tab.

---

### Problem: Summary Not Posted to PR

**Symptoms:** The vortex-sync workflow completes successfully. However, no coherence comment appears on the pull request. The "Post PR comment" step shows as skipped or failed.

**Solution:** Configure proper GitHub Actions permissions for your repository. Navigate to Settings, then Actions, then General. Set workflow permissions to "Read and write" access. Enable the option "Allow GitHub Actions to create and approve pull requests".

---

## ATOM Trail Issues

### Problem: Trail File Growing Too Large

**Symptoms:** ATOM trail files in the .atom-trail directory exceed 100 megabytes. Reading the trail causes noticeable performance degradation. The git repository becomes bloated with tracking data.

**Solution:** Exclude trail files from version control by adding them to .gitignore:
```
.atom-trail/
```

Implement log rotation to archive old entries:
```bash
DATE=$(date +%Y%m)
mv .atom-trail/npc-decisions.jsonl .atom-trail/archive/npc-decisions-${DATE}.jsonl
```

Run this archival process monthly to maintain manageable file sizes.

---

### Problem: ATOM Tags Not Unique

**Symptoms:** Duplicate tags appear in the trail files. Provenance tracking encounters conflicts from non-unique identifiers.

**Diagnostic:** Count duplicate ATOM tags across all trail files:
```bash
cat .atom-trail/*.jsonl | jq -r '.atomTag' | sort | uniq -d
```

**Solution:** Verify tag generation includes sufficient entropy components. Each tag requires a date component in YYYYMMDD format. Add a random hash with minimum three characters. Include an entity identifier such as NPC name or repository name. This combination ensures uniqueness across the ecosystem.

---

## Cross-Repository Synchronization

### Problem: Vortex Collapse Not Detected

**Symptoms:** Individual repositories each achieve coherence above 70%. The monitoring dashboard displays "waiting for convergence" status. No ecosystem-wide snap-in notification has occurred.

**Diagnostic Steps:** First verify all repositories have installed the vortex-sync workflow. Check that workflow runs completed successfully in each repository. Confirm ATOM entries were posted to the central API endpoint.

**Solution:** Manually trigger the collapse detection check:
```bash
curl -X POST $COHERENCE_MCP_URL/api/vortex/check-collapse \
  -H "Authorization: Bearer $COHERENCE_API_KEY"
```

This forces synchronization across the distributed repository network.

---

## Formula Inconsistencies

### Problem: Different Coherence Scores Across Languages

**Symptoms:** The TypeScript wave-toolkit reports a 72% coherence score. The Python coherence-validator reports 68% for identical input text. This inconsistency causes validation confusion.

**Root Cause:** Implementation drift has occurred between language-specific versions of the formula.

**Solution:** Verify formula weights match exactly across implementations. The curl weight should be 0.4, divergence 0.3, potential 0.2, and entropy 0.1. Run the cross-language test suite:
```bash
bun test tests/gate-tests.ts
python tests/python-gate-tests.py
```

All 22 tests should pass with identical coherence scores across both implementations.

---

## Emergency Procedures

### Override Coherence Gate

**When to Use:** Apply this escape hatch when critical hotfixes require immediate deployment. Use only when coherence is temporarily unachievable due to urgent circumstances.

**Process:** Add the label "coherence-override" to your pull request. Document complete justification in the PR description. Plan specific remediation for the next release cycle.

**Example Justification:**
```markdown
## Coherence Override Justification

Security vulnerability CVE-2024-XXXXX requires immediate patch.
Coherence will be restored in follow-up documentation PR #123.
```

This provides transparency about why standard gates were bypassed.

---

### Emergency Merge

**When to Use:** Apply during production outages when standard gates block critical resolution. Reserve for genuine emergencies only.

**Process:** Add the label "emergency-merge" to your pull request. Notify your team immediately through designated emergency channels. Create a detailed post-incident report after resolution.

**Post-Merge Actions:** Document the emergency merge in the ATOM trail using an EMERGENCY marker. Schedule coherence restoration work within 48 hours. Track remediation progress explicitly.

---

## Getting Help

### Debug Information to Collect

When reporting issues, gather these essential diagnostics. Include full workflow logs from vortex-sync runs. Provide coherence analysis output showing curl, divergence, potential, and entropy metrics. Extract the last five entries from your ATOM trail. Share relevant bridge integration code snippets. Document your repository configuration including workflow file version.

### Support Channels

Access support through multiple channels. Open GitHub issues at the vortex-bridges repository. Consult the VORTEX-COLLAPSE-MAP documentation for deployment guidance. Join the Discord community following DISCORD-QUICKSTART instructions.

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
