# UI Redesign Plan (Webpage)

## Goals
- Keep all existing features/functions, but make the interface feel cohesive and intentional.
- Reproportion cards/components so spacing and hierarchy feel balanced.
- Reduce visual noise while preserving the cockpit-inspired identity.

## Non-Goals
- Removing functionality or reducing module count.
- Rewriting backend API contracts.

## Phase 0: Audit + Inventory
- Capture current UI screenshots of each region: top bar, left sidebar, main viewport, inspector, bottom bar, ignition.
- Inventory all active components and their sizes.
- Note which components must stay visible at all times vs. can be collapsed.

## Phase 1: System Foundations
- Define spacing scale (e.g., 2/4/6/8/12/16/24/32).
- Define typography scale (title, section title, body, micro-label).
- Standardize border radius and stroke weight.
- Create a restrained accent palette (1 primary, 1 secondary, 1 alert).
- Clarify shadow/glow rules (where and how strong).

## Phase 2: Layout + Proportions
- Establish a grid across the entire app (column widths and gutters).
- Align top bar elements to grid (logo, empty circle, illumination panel).
- Normalize card headers so titles, icons, and controls align.
- Rebalance the bottom bar proportions (agent access vs. MFD vs. API vs. market mode).

## Phase 3: Card System
- Define a single base card layout with 2 variants: normal and compact.
- Normalize padding, header height, and body spacing.
- Remove per-card ad hoc margins in favor of shared utilities.
- Ensure text sizes match intended hierarchy.

## Phase 4: Agent Access Card Redesign
- Remove header redundancy (A/S/stop indicator).
- Replace display names with categories:
  - crypto
  - volume-follower (prime, bot 01)
  - sports
  - financials (oil price up/down yes/no focus)
  - politics
  - byob
  - companies
- Update code to reference bot identifiers as name + number (prime-01, peritia-02, etc.).
- Hide/remove percentage and dollar stats.
- Rebuild the ignition sub-panel within the card to match the global visual system.

## Phase 5: Ignition Panel (Global Throttle)
- Replace the heavy sci-fi bezel with a clean 3-position switch.
- Ensure sizing and typography match the rest of the bottom bar.
- Keep the three states and their API behavior intact.

## Phase 6: Polish + QA
- Verify alignment and spacing on common viewport widths.
- Check that labels do not wrap unexpectedly.
- Validate visual consistency across all cards.
- Run through all existing behaviors (mode toggles, API connect, agent controls).

## Open Questions / Assumptions
- Whether backend accepts renamed agent identifiers; if not, add a frontend mapping layer.
- Confirm whether any components can be collapsed or moved to secondary panels.
