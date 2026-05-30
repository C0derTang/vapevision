# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# VapeVision — Vape Detection Prototype

## Stack
- Next.js 15 (App Router) on Vercel
- Firebase: Auth (Google), Firestore
- MediaPipe Hands via CDN (no npm bundling)
- Tailwind CSS, dark theme

## Pages
- `/` — Landing page
- `/client` — Camera-based detection client (no auth)
- `/admin` — Alert dashboard (Google sign-in required, any Google user can view)

## Detection Logic
- MediaPipe Hands: 21 landmarks, x/y/z coordinates
- Hand near face: wrist-to-nose Euclidean distance < threshold AND wrist Y > face threshold
- Object in hand: thumb-tip to index-tip distance < pinch threshold
- Both conditions true for 1.5s continuously → capture frame
- Frame: `canvas.toDataURL('image/jpeg', 0.7)` → base64 string → Firestore

## Firestore Schema
```
alerts/{alertId}
  - timestamp: timestamp
  - cameraId: string
  - imageData: string (base64 JPEG)
  - processed: boolean
```

Camera ID: generated on client init, stored in localStorage.

## Environment Variables (NEXT_PUBLIC_FIREBASE_*)
- API key, auth domain, project ID, storage bucket, messaging sender ID, app ID

## Rules
- Firestore: write open (client), auth required read (admin)
- No Firebase Storage used

## Commands
```bash
npm install              # Install dependencies
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm run lint             # ESLint check
```

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

## Tech Details
- Firebase SDK: v10 (modular)
- MediaPipe Hands: loaded via CDN script tags, not npm
- Images stored as base64 strings in Firestore (no Firebase Storage)
- Any Google user can authenticate as admin — no allowlist