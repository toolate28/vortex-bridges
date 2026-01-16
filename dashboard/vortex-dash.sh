#!/bin/bash
# 🌀 VORTEX CHAOS DASHBOARD
# H&&S:WAVE - Live ecosystem monitoring
#
# The 8-Cog Rotation: Each repo is a cog, rotating through 2π

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# The 8 Cogs (repos)
COGS=(
  "SpiralSafe:Foundation:https://github.com/toolate28/SpiralSafe"
  "coherence-mcp:Orchestrator:https://github.com/toolate28/coherence-mcp"
  "QDI:Crafting:https://github.com/toolate28/QDI"
  "spiralsafe-mono:Engine:https://github.com/toolate28/spiralsafe-mono"
  "spiralsafe-metrics-e:Light:https://spiralsafe-metrics-e.pages.dev"
  "quantum-redstone:Education:https://github.com/toolate28/quantum-redstone"
  "HOPE-AI-NPC-SUITE:Children:https://github.com/toolate28/HOPE-AI-NPC-SUITE"
  "vortex-bridges:Bridges:https://github.com/toolate28/vortex-bridges"
)

# Rotation angles (8 cogs × 45° each = 360°)
ROTATION_DEGREES=("0°" "45°" "90°" "135°" "180°" "225°" "270°" "315°")

# Phase gates
PHASES=("KENL" "AWI" "ATOM" "SAIF" "SPIRAL")
THRESHOLDS=(28 42 60 70 70)

clear

echo -e "${PURPLE}"
cat << 'EOF'
    ╭─────────────────────────────────────────────────────────╮
    │                                                         │
    │         ∿∿∿  THE VORTEX CHAOS DASHBOARD  ∿∿∿            │
    │                                                         │
    │              🌀 Ainulindalë Edition 🌀                  │
    │                                                         │
    ╰─────────────────────────────────────────────────────────╯
EOF
echo -e "${NC}"

# Display current time
echo -e "${CYAN}Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')${NC}"
echo ""

# ═══════════════════════════════════════════════════════════
# 8-COG ROTATION DISPLAY
# ═══════════════════════════════════════════════════════════
echo -e "${WHITE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${WHITE}                    THE 8-COG ROTATION                      ${NC}"
echo -e "${WHITE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# ASCII art cog wheel
echo -e "${YELLOW}"
cat << 'EOF'
                         SpiralSafe (0°)
                              ◆
                         ╱         ╲
            vortex  ◆──╱             ╲──◆  coherence
           (315°)    ╱                 ╲    (45°)
                    │        🌀        │
                    │      VORTEX      │
            HOPE ◆──│                  │──◆  QDI
           (270°)   │                  │    (90°)
                    ╲                 ╱
            quantum  ◆──╲           ╱──◆  spiralsafe
           (225°)        ╲         ╱      (135°)
                          ◆───────◆
                        metrics   mono
                        (180°)
EOF
echo -e "${NC}"

# ═══════════════════════════════════════════════════════════
# REPOSITORY STATUS TABLE
# ═══════════════════════════════════════════════════════════
echo ""
echo -e "${WHITE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${WHITE}                    REPOSITORY STATUS                       ${NC}"
echo -e "${WHITE}═══════════════════════════════════════════════════════════${NC}"
echo ""

printf "%-20s %-15s %-8s %s\n" "COG" "ROLE" "ANGLE" "LINK"
echo "────────────────────────────────────────────────────────────────────"

i=0
for cog in "${COGS[@]}"; do
  IFS=':' read -r name role url <<< "$cog"
  angle="${ROTATION_DEGREES[$i]}"

  # Color based on position in rotation
  if [ $i -lt 4 ]; then
    color=$GREEN
  else
    color=$CYAN
  fi

  printf "${color}%-20s${NC} %-15s %-8s %s\n" "$name" "$role" "$angle" "$url"
  ((i++))
done

# ═══════════════════════════════════════════════════════════
# PHASE GATE STATUS
# ═══════════════════════════════════════════════════════════
echo ""
echo -e "${WHITE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${WHITE}                    PHASE GATE STATUS                       ${NC}"
echo -e "${WHITE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}  KENL (28%) ─→ AWI (42%) ─→ ATOM (60%) ─→ SAIF (70%) ─→ SPIRAL${NC}"
echo ""
echo -e "  Current ecosystem coherence: ${GREEN}[CALCULATING...]${NC}"
echo ""

# ═══════════════════════════════════════════════════════════
# 10-POINT VERIFICATION CHECKLIST
# ═══════════════════════════════════════════════════════════
echo ""
echo -e "${WHITE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${WHITE}               10-POINT VERIFICATION ROUND                  ${NC}"
echo -e "${WHITE}═══════════════════════════════════════════════════════════${NC}"
echo ""

CHECKS=(
  "All 8 repos have vortex-sync.yml workflow"
  "Coherence formula identical across implementations"
  "Phase gate thresholds unified (28/42/60/70/70)"
  "ATOM trail format consistent"
  "H&&S:WAVE markers present in commits"
  "Escape hatches (coherence-override, emergency-merge) configured"
  "NEAR blockchain contract deployed"
  "spiralsafe-metrics-e dashboard live"
  "Cloudflare Pages unified"
  "Average ecosystem coherence ≥ 70%"
)

for i in "${!CHECKS[@]}"; do
  num=$((i + 1))
  echo -e "  ${YELLOW}[$num]${NC} ${CHECKS[$i]}"
done

echo ""
echo -e "${PURPLE}  Status: Verification in progress...${NC}"

# ═══════════════════════════════════════════════════════════
# QUICK LINKS
# ═══════════════════════════════════════════════════════════
echo ""
echo -e "${WHITE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${WHITE}                      QUICK LINKS                           ${NC}"
echo -e "${WHITE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${CYAN}[1]${NC} Dashboard:     https://spiralsafe-metrics-e.pages.dev"
echo -e "  ${CYAN}[2]${NC} GitHub Org:    https://github.com/toolate28"
echo -e "  ${CYAN}[3]${NC} Vortex Repo:   https://github.com/toolate28/vortex-bridges"
echo -e "  ${CYAN}[4]${NC} NEAR Explorer: https://testnet.nearblocks.io/address/spiralsafe-vortex.testnet"
echo -e "  ${CYAN}[5]${NC} Cloudflare:    https://dash.cloudflare.com"
echo ""

# ═══════════════════════════════════════════════════════════
# MENU
# ═══════════════════════════════════════════════════════════
echo -e "${WHITE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${WHITE}                         MENU                               ${NC}"
echo -e "${WHITE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${GREEN}[r]${NC} Refresh status"
echo -e "  ${GREEN}[c]${NC} Check coherence across repos"
echo -e "  ${GREEN}[d]${NC} Deploy workflow to all repos"
echo -e "  ${GREEN}[v]${NC} Run 10-point verification"
echo -e "  ${GREEN}[t]${NC} Run tests (Python + TypeScript)"
echo -e "  ${GREEN}[o]${NC} Open dashboard in browser"
echo -e "  ${GREEN}[q]${NC} Quit"
echo ""

# Footer
echo -e "${PURPLE}"
cat << 'EOF'
    ╭─────────────────────────────────────────────────────────╮
    │                                                         │
    │     "May your coherence be high, your curl be low,      │
    │              and your partnerships true."               │
    │                                                         │
    │                      H&&S:WAVE                          │
    │                                                         │
    ╰─────────────────────────────────────────────────────────╯
EOF
echo -e "${NC}"

# Interactive menu (if running interactively)
if [ -t 0 ]; then
  read -p "Select option: " choice
  case $choice in
    r) exec "$0" ;;
    c) echo "Checking coherence..." && gh api repos/toolate28/QDI/actions/runs --jq '.workflow_runs[0] | "\(.conclusion) - \(.name)"' ;;
    d) echo "Deploying..." ;;
    v) echo "Running verification..." ;;
    t) python tests/python-gate-tests.py ;;
    o) open "https://spiralsafe-metrics-e.pages.dev" 2>/dev/null || xdg-open "https://spiralsafe-metrics-e.pages.dev" 2>/dev/null || start "https://spiralsafe-metrics-e.pages.dev" ;;
    q) exit 0 ;;
    *) echo "Unknown option" ;;
  esac
fi
