# VapeVision — Design Spec

Date: 2026-05-30

## 1. Overview

VapeVision is a prototype vape detection service. A browser-based client uses Google MediaPipe to detect when a hand is near a face holding an object for >1.5s, then captures and stores the frame. An admin dashboard displays all captured alerts.

Stack: Next.js (Vercel) + Firebase (Auth, Firestore).

---

## 2. Pages

### `/` — Landing Page
- Dark theme, minimal, "surveillance tech" vibe
- Hero section: "VapeVision — AI-powered vape detection"
- Brief description of how it works
- Two buttons: "Start Monitoring" (/client) and "Admin Dashboard" (/admin)
- Footer: copyright + "Built for HackTheValley"

### `/client` — Detection Client
- Full-page camera feed (getUserMedia, facingMode: user)
- Overlay: status indicator (Idle / Monitoring / Alert triggered)
- No auth required
- On detection: capture frame, base64 encode, write to Firestore, show brief "Alert sent" toast
- Camera ID shown in corner (generated once, stored in localStorage)
- Graceful degradation if camera denied

### `/admin` — Admin Dashboard
- Google Sign-in only (Firebase Auth)
- After login: list of alerts, newest first
- Each row: timestamp, cameraId, small thumbnail
- Click row → full image in modal (base64 displayed via `<img src="data:image/jpeg;base64,..."/>`)
- Real-time updates via Firestore onSnapshot
- Sign-out button in header

---

## 3. Detection Logic (Client)

**Library:** `@mediapipe/hands` loaded via CDN (script tags, no npm bundling needed)

**Per-frame processing:**
1. MediaPipe Hands processes video frame → 21 hand landmarks with x, y, z
2. Near-face check (both conditions must be true):
   - Wrist Y position > face threshold (hand below face line)
   - Euclidean distance from wrist (landmark 0) to nose (approximate face center) < proximity threshold
3. Object-in-hand check: distance between thumb tip (landmark 4) and index tip (landmark 8) < pinch threshold
4. If #2 AND #3 true → start/continue 1.5s timer
5. If conditions break → reset timer
6. If timer reaches 1.5s → trigger alert

**On trigger:**
- `canvas.toDataURL('image/jpeg', 0.7)` → base64 string (~150KB)
- Write Firestore document
- Show "Alert captured" toast for 2s

**Thresholds (tunable):**
- Face proximity distance: ~0.3 normalized units
- Pinch distance: ~0.05 normalized units
- Face Y threshold: wrist below nose Y

---

## 4. Firebase Data

### Firestore Schema

```
alerts/{alertId}
  - timestamp: timestamp (server auto)
  - cameraId: string
  - imageData: string (base64 JPEG, ~150KB)
  - processed: boolean (default false)
```

### Firebase Auth
- Google sign-in only for admin
- Any Google user who can authenticate can view all alerts

### Firebase Rules
- Firestore: open write (client), read auth-required (admin)
- No Firebase Storage used (images stored as base64 in Firestore)

---

## 5. File Structure

```
/
├── app/
│   ├── page.tsx              # Landing page
│   ├── client/
│   │   └── page.tsx          # Detection client
│   ├── admin/
│   │   └── page.tsx          # Admin dashboard
│   └── layout.tsx
├── components/
│   ├── Header.tsx
│   └── AlertModal.tsx
├── lib/
│   └── firebase.ts           # Firebase init
├── docs/
│   └── specs/
│       └── 2026-05-30-vapevision-design.md
├── public/
├── .env.local
├── next.config.ts
└── package.json
```

---

## 6. Tech Details

- Framework: Next.js 15 (App Router)
- Styling: Tailwind CSS (dark theme)
- Firebase SDK: v10 (modular)
- MediaPipe Hands: @mediapipe/hands via CDN
- Deployment: Vercel
- Environment variables: NEXT_PUBLIC_FIREBASE_* vars in .env.local