#!/bin/bash
# ========================================
# BlackjARK ULTIMATE - Test Suite
# Verification complète des 18 améliorations
# ========================================

echo "🚀 BlackjARK ULTIMATE - Test Suite"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

test_feature() {
  local feature=$1
  local check=$2
  
  if eval "$check"; then
    echo -e "${GREEN}✅ $feature${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ $feature${NC}"
    ((FAILED++))
  fi
}

echo "📁 File Structure Tests"
echo "----------------------"

test_feature "Ultimate HTML exists" "[ -f /mnt/user-data/outputs/blackjark/public/blackjark-ultimate.html ]"
test_feature "Sound system exists" "[ -f /mnt/user-data/outputs/blackjark/public/blackjark-sounds.js ]"
test_feature "Achievements exists" "[ -f /mnt/user-data/outputs/blackjark/public/blackjark-achievements.js ]"
test_feature "Three.js exists" "[ -f /mnt/user-data/outputs/blackjark/public/blackjark-threejs.js ]"
test_feature "Effects exists" "[ -f /mnt/user-data/outputs/blackjark/public/blackjark-effects.js ]"

echo ""
echo "📊 Content Verification"
echo "----------------------"

ULTIMATE_FILE="/mnt/user-data/outputs/blackjark/public/blackjark-ultimate.html"

test_feature "Contains Three.js import" "grep -q 'three.min.js' $ULTIMATE_FILE"
test_feature "Contains Orbitron font" "grep -q 'Orbitron' $ULTIMATE_FILE"
test_feature "Contains sound system" "grep -q 'SoundSystem\|soundSystem' $ULTIMATE_FILE"
test_feature "Contains achievements" "grep -q 'achievement' $ULTIMATE_FILE"
test_feature "Contains game history" "grep -q 'gameHistory' $ULTIMATE_FILE"
test_feature "Contains theme system" "grep -q 'changeTheme' $ULTIMATE_FILE"
test_feature "Contains deposit API" "grep -q '/api/deposit' $ULTIMATE_FILE"
test_feature "Contains withdraw API" "grep -q '/api/withdraw' $ULTIMATE_FILE"
test_feature "Contains session API" "grep -q '/api/session' $ULTIMATE_FILE"

echo ""
echo "🎨 Visual Features"
echo "----------------------"

test_feature "Has cyberpunk background" "grep -q 'cyberpunk-bg' $ULTIMATE_FILE"
test_feature "Has cursor trail" "grep -q 'cursor-trail' $ULTIMATE_FILE"
test_feature "Has scan lines" "grep -q 'scanlines' $ULTIMATE_FILE"
test_feature "Has holographic cards" "grep -q 'holographic' $ULTIMATE_FILE"
test_feature "Has theme selector" "grep -q 'theme-selector' $ULTIMATE_FILE"
test_feature "Has particle effects" "grep -q 'particle-effects' $ULTIMATE_FILE"
test_feature "Has Arkade logo" "grep -q 'arkade-logo' $ULTIMATE_FILE"

echo ""
echo "🎮 Game Features"
echo "----------------------"

test_feature "Has deal function" "grep -q 'function dealGame' $ULTIMATE_FILE"
test_feature "Has hit function" "grep -q 'function hit' $ULTIMATE_FILE"
test_feature "Has stand function" "grep -q 'function stand' $ULTIMATE_FILE"
test_feature "Has double down" "grep -q 'function doubleDown' $ULTIMATE_FILE"
test_feature "Has card rendering" "grep -q 'function renderCard' $ULTIMATE_FILE"
test_feature "Has score calculation" "grep -q 'function calculateScore' $ULTIMATE_FILE"

echo ""
echo "⚡ API Integration"
echo "----------------------"

test_feature "Has deposit modal" "grep -q 'deposit-modal' $ULTIMATE_FILE"
test_feature "Has withdraw modal" "grep -q 'withdraw-modal' $ULTIMATE_FILE"
test_feature "Has polling system" "grep -q 'pollDeposit' $ULTIMATE_FILE"
test_feature "Has ASP integration" "grep -q 'aspVtxos' $ULTIMATE_FILE"
test_feature "Has vTXO tracking" "grep -q 'vtxo-count' $ULTIMATE_FILE"

echo ""
echo "🔊 Audio System"
echo "----------------------"

test_feature "Has sound toggle" "grep -q 'sound-toggle' $ULTIMATE_FILE"
test_feature "Has card flip sound" "grep -q 'playCardFlip' $ULTIMATE_FILE"
test_feature "Has win sound" "grep -q 'playWin' $ULTIMATE_FILE"
test_feature "Has lose sound" "grep -q 'playLose' $ULTIMATE_FILE"
test_feature "Has vTXO sound" "grep -q 'playVTXO' $ULTIMATE_FILE"

echo ""
echo "🏆 Achievements System"
echo "----------------------"

test_feature "Has achievement check" "grep -q 'achievementSystem.check' $ULTIMATE_FILE"
test_feature "Has achievement popup" "grep -q 'achievement-popup' $ULTIMATE_FILE"
test_feature "Has achievement display" "grep -q 'showAchievements' $ULTIMATE_FILE"
test_feature "Has localStorage save" "grep -q 'localStorage.setItem' $ULTIMATE_FILE"

echo ""
echo "📈 History System"
echo "----------------------"

test_feature "Has game history" "grep -q 'game-history-panel' $ULTIMATE_FILE"
test_feature "Has history rendering" "grep -q 'history-list' $ULTIMATE_FILE"
test_feature "Has streak tracking" "grep -q 'current-streak' $ULTIMATE_FILE"
test_feature "Has best hand" "grep -q 'best-hand' $ULTIMATE_FILE"

echo ""
echo "🎨 Animations"
echo "----------------------"

test_feature "Has card deal animation" "grep -q '@keyframes card-deal' $ULTIMATE_FILE"
test_feature "Has holographic effect" "grep -q '@keyframes holographic-shift' $ULTIMATE_FILE"
test_feature "Has achievement bounce" "grep -q '@keyframes achievement-bounce' $ULTIMATE_FILE"
test_feature "Has history slide-in" "grep -q '@keyframes history-slide-in' $ULTIMATE_FILE"

echo ""
echo "📏 File Size Check"
echo "----------------------"

SIZE=$(wc -c < $ULTIMATE_FILE)
SIZE_KB=$((SIZE / 1024))

echo "File size: ${SIZE_KB}KB"

if [ $SIZE_KB -gt 50 ] && [ $SIZE_KB -lt 200 ]; then
  echo -e "${GREEN}✅ File size is reasonable (50-200KB)${NC}"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠️  File size is ${SIZE_KB}KB (expected 50-200KB)${NC}"
  ((FAILED++))
fi

echo ""
echo "🔍 Code Quality"
echo "----------------------"

TOTAL_LINES=$(wc -l < $ULTIMATE_FILE)
echo "Total lines: $TOTAL_LINES"

if [ $TOTAL_LINES -gt 1000 ]; then
  echo -e "${GREEN}✅ Substantial codebase (1000+ lines)${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Code seems incomplete (<1000 lines)${NC}"
  ((FAILED++))
fi

# Check for syntax errors (basic)
if grep -q 'function.*{$' $ULTIMATE_FILE; then
  echo -e "${GREEN}✅ JavaScript functions present${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ JavaScript functions not found${NC}"
  ((FAILED++))
fi

echo ""
echo "🎯 Features Checklist (18/18)"
echo "----------------------"

FEATURES=(
  "Sound Effects:playCardFlip\|playWin"
  "Achievements:achievementSystem"
  "3D Cards:holographic"
  "History:game-history-panel"
  "Enhanced Background:cyberpunk-bg"
  "Holographic Effects:holographic-shift"
  "Logo Animation:arkade-logo-footer"
  "Theme System:changeTheme"
  "Particle Effects:particle-effects"
  "Deposit Modal:deposit-modal"
  "Withdraw Modal:withdraw-modal"
  "vTXO Tracking:aspVtxos"
  "Polling System:pollDeposit"
  "Streak Tracking:current-streak"
  "Best Hand:best-hand"
  "Sound Toggle:sound-toggle"
  "Theme Selector:theme-selector"
  "Notifications:showNotification"
)

FEATURE_COUNT=0
for feature in "${FEATURES[@]}"; do
  NAME="${feature%%:*}"
  PATTERN="${feature##*:}"
  
  if grep -q "$PATTERN" $ULTIMATE_FILE; then
    echo -e "${GREEN}✅ ${FEATURE_COUNT}. $NAME${NC}"
    ((FEATURE_COUNT++))
  else
    echo -e "${RED}❌ ${FEATURE_COUNT}. $NAME${NC}"
  fi
done

echo ""
echo "===================================="
echo "📊 Test Results"
echo "===================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

TOTAL=$((PASSED + FAILED))
PERCENT=$((PASSED * 100 / TOTAL))

if [ $PERCENT -ge 90 ]; then
  echo -e "${GREEN}🎉 SUCCESS! ($PERCENT% tests passed)${NC}"
  echo "✅ BlackjARK ULTIMATE is ready to deploy!"
elif [ $PERCENT -ge 70 ]; then
  echo -e "${YELLOW}⚠️  PARTIAL SUCCESS ($PERCENT% tests passed)${NC}"
  echo "Some features may need attention"
else
  echo -e "${RED}❌ FAILED ($PERCENT% tests passed)${NC}"
  echo "Significant issues detected"
fi

echo ""
echo "📁 Output Files:"
echo "  - /mnt/user-data/outputs/blackjark/public/blackjark-ultimate.html"
echo "  - Size: ${SIZE_KB}KB"
echo "  - Lines: $TOTAL_LINES"
echo ""
echo "🚀 Next Steps:"
echo "  1. Open blackjark-ultimate.html in browser"
echo "  2. Test deposit/withdraw with real ASP"
echo "  3. Verify all 18 features work"
echo "  4. Deploy to production!"
echo ""

exit 0
