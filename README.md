# VapeVision — Vape Detection Prototype

Real-time vape detection using webcam + MediaPipe Hands. Capture frames when hand gestures near face match detection thresholds.

## Stack

- **Next.js 15** (App Router) on Vercel
- **Firebase**: Auth (Google), Firestore
- **MediaPipe Hands** via CDN (no npm bundling)
- **Tailwind CSS**, dark theme

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/client` | Camera-based detection client (no auth) |
| `/admin` | Alert dashboard (Google sign-in required) |

## Detection Logic

1. MediaPipe Hands tracks 21 landmarks (x/y/z coordinates)
2. **Hand near face**: wrist-to-nose Euclidean distance < threshold AND wrist Y > face threshold
3. **Object in hand**: thumb-tip to index-tip distance < pinch threshold
4. Both conditions true for 1.5s continuously → capture frame
5. Frame captured as JPEG (quality 0.7) → base64 → Firestore

## Firestore Schema

```
alerts/{alertId}
  - timestamp: timestamp
  - cameraId: string
  - imageData: string (base64 JPEG)
  - processed: boolean
```

Camera ID generated on client init, stored in localStorage.

## Environment Variables

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Setup

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # Production build
npm run lint    # ESLint check
```

## Firebase Rules

- Firestore: write open (client), auth required read (admin)
- No Firebase Storage used
- Any Google user can authenticate as admin — no allowlist

## File Structure

```
app/
  page.tsx              # Landing page
  client/page.tsx       # Detection client
  admin/page.tsx        # Admin dashboard
  layout.tsx
components/
  Header.tsx
  AlertModal.tsx
lib/
  firebase.ts           # Firebase initialization
docs/superpowers/specs/
  2026-05-30-vapevision-design.md   # Full design spec
```
