# Admin Grid + Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle admin alert list as Google Photos-style grid. Add verification flow: admin confirms or rejects each alert. Confirmed vaping stored in separate `vaping_cases` collection.

**Architecture:** CSS Grid for photo-style layout. Firestore `addDoc` to copy to `vaping_cases`, then `deleteDoc` to remove from `alerts`. `onSnapshot` keeps grid live-updated.

**Tech Stack:** Next.js 15 App Router, Firebase v10 Firestore, Tailwind CSS

---

## Task 1: Update AlertModal with verification buttons

**Files:**
- Modify: `components/AlertModal.tsx`

- [ ] **Step 1: Update AlertModal to accept verification callbacks**

```tsx
interface AlertModalProps {
  imageData: string;
  timestamp: string;
  cameraId: string;
  onClose: () => void;
  onConfirmVaping: () => void;
  onFalsePositive: () => void;
}

export default function AlertModal({
  imageData,
  timestamp,
  cameraId,
  onClose,
  onConfirmVaping,
  onFalsePositive,
}: AlertModalProps) {
```

- [ ] **Step 2: Add action buttons below image**

```tsx
{/* Actions */}
<div className="flex gap-4 px-6 pb-6">
  <button
    onClick={onFalsePositive}
    className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-sm tracking-widest uppercase border border-gray-700 transition-all"
  >
    False Positive
  </button>
  <button
    onClick={onConfirmVaping}
    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-black font-mono text-sm tracking-widest uppercase font-bold transition-all"
  >
    Confirm Vaping
  </button>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add components/AlertModal.tsx
git commit -m "feat: add verification buttons to AlertModal"
```

---

## Task 2: Restyle admin alert list as CSS grid

**Files:**
- Modify: `app/admin/page.tsx:163-210` (alert list section)

- [ ] **Step 1: Replace list layout with CSS grid**

```tsx
{/* Alert Grid */}
<main className="p-6 relative z-10">
  {alerts.length === 0 ? (
    <div className="text-center font-mono text-sm text-gray-400 tracking-widest uppercase py-24">No Alerts</div>
  ) : (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          onClick={() => setSelectedAlert(alert)}
          className="relative aspect-square bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden cursor-pointer hover:border-gray-600 transition-all group"
        >
          <img
            src={alert.imageData}
            alt={`Alert from ${alert.cameraId}`}
            className="w-full h-full object-cover"
          />
          {/* Camera ID badge */}
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 font-mono text-xs text-gray-300 tracking-widest uppercase rounded">
            {alert.cameraId.split('_')[1]?.slice(0, 6) || alert.cameraId.slice(-6)}
          </div>
          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteConfirmId(alert.id);
            }}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-2 bg-black/70 text-gray-400 hover:text-red-400 transition-all rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-.382l-.724 1.447A1 1 0 009 2zM8 6a1 1 0 011-1h6a1 1 0 011 1v7.586l.707-.707A1 1 0 0116 14H8V6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )}
</main>
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat: restyle admin alerts as photo grid"
```

---

## Task 3: Add verification actions (copy to vaping_cases, delete from alerts)

**Files:**
- Modify: `app/admin/page.tsx:7,71-81,239-247`

- [ ] **Step 1: Add imports for addDoc and setDoc**

```tsx
import { collection, onSnapshot, query, orderBy, Timestamp, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
```

- [ ] **Step 2: Add handleVerify function**

```tsx
const handleVerify = async (alert: Alert, confirmed: boolean) => {
  if (confirmed) {
    // Copy to vaping_cases first
    await addDoc(collection(db, "vaping_cases"), {
      timestamp: alert.timestamp,
      cameraId: alert.cameraId,
      imageData: alert.imageData,
      confirmedAt: serverTimestamp(),
      originalAlertId: alert.id,
    });
  }
  // Delete from alerts
  await deleteDoc(doc(db, "alerts", alert.id));
  setSelectedAlert(null);
};
```

- [ ] **Step 3: Update AlertModal to pass verify callbacks**

```tsx
{selectedAlert && (
  <AlertModal
    imageData={selectedAlert.imageData}
    timestamp={formatTimestamp(selectedAlert.timestamp)}
    cameraId={selectedAlert.cameraId}
    onClose={() => setSelectedAlert(null)}
    onConfirmVaping={() => handleVerify(selectedAlert, true)}
    onFalsePositive={() => handleVerify(selectedAlert, false)}
  />
)}
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat: add verification flow - copy to vaping_cases or delete"
```

---

## Task 4: Update Firestore rules for vaping_cases collection

**Files:**
- Check: `firestore.rules` or `rules` in Firebase console

- [ ] **Step 1: Add rules for vaping_cases**

```
match /vaping_cases/{caseId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null;
}
```

- [ ] **Step 2: Commit rules change (if rules file exists in repo)**

```bash
git add [rules file] 2>/dev/null || echo "Rules updated via Firebase console"
git commit -m "feat: add Firestore rules for vaping_cases collection"
```

---

## Verification

1. Run `npm run build` — must pass
2. Navigate to /admin — should show grid of alert thumbnails
3. Click thumbnail — modal opens with two buttons
4. Click "False Positive" — alert deleted, grid updates
5. Click "Confirm Vaping" — alert copied to vaping_cases, then deleted from alerts
6. Check Firestore — vaping_cases collection should have confirmed cases

---

**Plan complete.** Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**