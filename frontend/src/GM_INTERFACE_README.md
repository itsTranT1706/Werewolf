# 🎮 Game Master Interface - Dark Medieval Fantasy

## Overview

A ritual-themed Game Master interface for the Werewolf (Ma Sói) web game. Designed as a sacred ritual table with ancient rune iconography and dark medieval aesthetics.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        GM Interface Page                         │
│  /gm/:roomId                                                     │
├─────────────────┬─────────────────────────┬─────────────────────┤
│  Player Panel   │    Event Timeline       │   Phase Timeline    │
│  (Left - 25%)   │    Wizard (Center 50%)  │   (Right - 25%)     │
│                 │                         │                     │
│  • Player Cards │  • Night Phase Steps    │  • Phase Progress   │
│  • Role Display │  • Day Phase Steps      │  • Completed Steps  │
│  • Status Badges│  • Narrative Scripts    │  • Current Phase    │
│  • Alive/Dead   │  • Action Confirmations │  • Skip Indicators  │
└─────────────────┴─────────────────────────┴─────────────────────┘
```

## State Machine

```javascript
// Game Phase Enum
GAME_PHASE = {
  // Setup
  LOBBY, ROLE_ASSIGNMENT,
  
  // Night Phase (in order)
  NIGHT_START → NIGHT_CUPID → NIGHT_BODYGUARD → 
  NIGHT_WEREWOLF → NIGHT_SEER → NIGHT_WITCH → NIGHT_END
  
  // Day Phase (in order)
  DAY_DAWN → DAY_DISCUSSION → DAY_VOTE → 
  DAY_EXECUTION → DAY_HUNTER → DAY_END
  
  // End
  GAME_OVER
}
```

## Components

### `/components/gm/`

| Component | Purpose |
|-----------|---------|
| `PlayerCard.jsx` | Individual player display with role, status badges |
| `PlayerPanel.jsx` | Grid of all players, faction counts |
| `PhaseTimeline.jsx` | Step-by-step wizard progress |
| `NightPhaseWizard.jsx` | Night role action steps |
| `DayPhaseWizard.jsx` | Day phase: dawn, vote, execution |
| `GameOverScreen.jsx` | Victory/defeat display |

### `/components/ui/RuneIcons.jsx`

Ancient rune-style SVG icons:
- Status: Shield, WolfClaw, Poison, Heal, Eye, Lovers, Skull, Arrow
- Phases: Moon, Sun, Wolf, Scroll, Gallows, Hourglass, Crown, Vote, Chat

### `/constants/gamePhases.js`

- `GAME_PHASE` enum
- `PHASE_META` - names, descriptions, icons
- `PHASE_TRANSITIONS` - valid state transitions
- `PLAYER_STATUS` - status badge types
- Helper functions for phase management

### `/hooks/useGameMaster.js`

Game state management hook:
- Tracks current phase, day number
- Night actions (protection, attack, seer check, witch action)
- Witch skill usage
- Communicates with backend via socket

## Night Phase Flow

1. **NIGHT_START** - "Màn đêm buông xuống..."
2. **NIGHT_CUPID** (Night 1 only) - Select 2 lovers
3. **NIGHT_BODYGUARD** - Select player to protect
4. **NIGHT_WEREWOLF** - Select victim (shows wolf teammates)
5. **NIGHT_SEER** - Select player to investigate → Large faction reveal
6. **NIGHT_WITCH** - See victim, choose: Save / Poison / Nothing
7. **NIGHT_END** - Calculate results

## Day Phase Flow

1. **DAY_DAWN** - Auto-generated narrative script for GM to read
2. **DAY_DISCUSSION** - Timer/manual control
3. **DAY_VOTE** - Input votes per player, Mayor = 2 votes
4. **DAY_EXECUTION** - Show executed player, reveal role
5. **DAY_HUNTER** (if applicable) - Forced target selection
6. **DAY_END** - Check win condition or next night

## Status Badges (Rune Icons)

| Status | Icon | Color | Meaning |
|--------|------|-------|---------|
| PROTECTED | Shield | Blue | Bodyguard protection |
| ATTACKED | WolfClaw | Red | Werewolf target |
| POISONED | Poison | Purple | Witch poison |
| SAVED | Heal | Green | Witch save |
| INVESTIGATED | Eye | Amber | Seer checked |
| LOVER | Heart | Pink | Cupid bound |
| MARKED | Arrow | Orange | Hunter target |

## Styling

- Dark stone backgrounds (#0a0a1a, #1a1a2e)
- Amber/gold accents (#c9a227, #d4b896)
- Medieval font family (MedievalSharp, Cinzel)
- Rune-carved borders and corners
- Mystical glow effects
- Phase-specific color themes (indigo for night, amber for day)

## Route

```
/gm/:roomId - Game Master Interface
```

## Backend Integration

The interface sends commands via socket:
- `GM_START_NIGHT`
- `GM_BODYGUARD_PROTECT`
- `GM_WEREWOLF_KILL`
- `GM_SEER_CHECK`
- `GM_WITCH_ACTION`
- `GM_END_NIGHT`
- `GM_START_DAY`
- `GM_END_VOTE`
- `GM_HUNTER_SHOOT`

And listens for events:
- `GAME_STATE`
- `GAME_ROLE_ASSIGNMENT_LIST`
- `NIGHT_PHASE_STARTED`
- `GM_NIGHT_RESULT`
- `DAY_PHASE_STARTED`
- `PLAYERS_DIED`
- `GAME_OVER`

## No Backend Logic Changes

This implementation is purely frontend UI/UX. All game logic, calculations, and state transitions remain in the backend gameplay service.
