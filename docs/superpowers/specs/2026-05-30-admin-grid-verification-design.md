# VapeVision Admin Grid + Verification

**Date:** 2026-05-30

## Overview

Redesign admin alert list as Google Photos-style grid. Add verification flow: admin confirms or rejects each alert. Confirmed vaping stored in separate collection.

---

## Data Model

### Collections

**`alerts`** — raw detection captures (existing, modified)
```
alerts/{alertId}
  - timestamp: timestamp
  - cameraId: string
  - imageData: string (base64 JPEG)
  - processed: boolean (default false)
```

**`vaping_cases`** — confirmed vaping (new)
```
vaping_cases/{caseId}
  - timestamp: timestamp (from original alert)
  - cameraId: string
  - imageData: string (base64 JPEG)
  - confirmedAt: timestamp (server auto)
  - originalAlertId: string (reference)
```

---

## UI

### Alert Grid (Google Photos style)
- CSS Grid, `auto-fill minmax(180px, 1fr)`, gap 12px
- Each tile: image fills tile, `object-cover`
- Corner badge: small chip with camera ID (non-intrusive)
- Hover: slight scale (1.02) + border glow
- Click tile → opens verification modal

### Verification Modal
- Full-screen-ish overlay, max 900px wide
- Large image centered
- Metadata below: camera ID, timestamp
- Two action buttons side-by-side at bottom:
  - **"Confirm Vaping"** → red/danger styling
  - **"False Positive"** → subtle/gray styling
- Both actions are destructive (delete from alerts)

### Actions
1. **Confirm Vaping**: copy alert to `vaping_cases`, delete from `alerts`
2. **False Positive**: delete from `alerts` only

---

## Implementation

1. Update Firestore rules for new `vaping_cases` collection (read auth required, write auth required)
2. Add `addDoc`, `setDoc` imports for copying
3. Update Alert interface to include `verified` field (for UI badge)
4. Restyle alert list from list view to CSS grid
5. Update AlertModal with two action buttons
6. Handle both actions with appropriate Firestore operations

---

## Visual States

| State | Badge | Border |
|-------|-------|--------|
| Unreviewed (default) | None | gray-800 |
| Confirmed Vaping (before delete) | "Vaping" chip | blue-600 |
| False Positive (before delete) | "False +" chip | gray-700 |

After action: alert deleted, grid updates via onSnapshot