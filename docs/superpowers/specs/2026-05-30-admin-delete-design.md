# VapeVision Admin Delete Feature

**Date:** 2026-05-30

## Context

Add delete functionality to admin page so authenticated users can remove individual alerts.

## UI

- Each alert row has trash icon button (right side, visible on hover)
- Click trash → confirmation modal with Cancel/Delete buttons
- Delete is destructive (red button)
- Confirm → Firestore delete → row animates out

## Data

- Firebase v10 modular API: `deleteDoc(doc(db, "alerts", alertId))`
- Firestore security rules: auth required (already in place)

## States

| State | UI |
|-------|----|
| Default | Trash icon visible on row hover |
| Deleting | Spinner on button, disabled |
| Error | Alert row stays, error message shown |
| Success | Row removed from list |

## Components

1. **DeleteConfirmModal** — inline component in admin/page.tsx
   - Props: `onConfirm`, `onCancel`
   - Two buttons: Cancel (gray), Delete (red)

2. **Delete button** — inline in each alert row
   - Uses existing hover behavior
   - Opens DeleteConfirmModal on click

## Implementation

- Add `deleteDoc` import from firestore
- Add `useState` for delete confirmation (alertId)
- Add `handleDelete` async function
- Inline DeleteConfirmModal in JSX