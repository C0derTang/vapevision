# VapeVision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full VapeVision application — landing page, camera-based detection client, admin alert dashboard with Firebase.

**Architecture:** Next.js 15 App Router. MediaPipe Hands via CDN script tags (no npm). Firebase v10 modular SDK. Tailwind dark theme. Camera client writes alerts to Firestore; admin reads them after Google sign-in.

**Tech Stack:** Next.js 15, Firebase v10 (Auth + Firestore), MediaPipe Hands (CDN), Tailwind CSS, TypeScript

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `app/globals.css`
- Create: `app/layout.tsx`
- Create: `.env.local.example`
- Create: `.gitignore` (update if needed)

- [ ] **Step 1: Create package.json**

```json
{
  "name": "vapevision",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "15.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "firebase": "^10.14.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "15.0.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create next.config.ts**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

- [ ] **Step 4: Create tailwind.config.ts**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  darkMode: "class",
};

export default config;
```

- [ ] **Step 5: Create postcss.config.js**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: Create app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #0a0a0a;
  --foreground: #ededed;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: system-ui, -apple-system, sans-serif;
}
```

- [ ] **Step 7: Create app/layout.tsx**

```typescript
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VapeVision",
  description: "AI-powered vape detection",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0a] text-white">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 8: Create .env.local.example**

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

- [ ] **Step 9: Create .gitignore**

```
# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 10: Commit**

```bash
git add package.json tsconfig.json next.config.ts tailwind.config.ts postcss.config.js app/globals.css app/layout.tsx .env.local.example .gitignore
git commit -m "feat: scaffold Next.js project with Tailwind and TypeScript"
```

---

## Task 2: Firebase Library Setup

**Files:**
- Create: `lib/firebase.ts`
- Modify: `.env.local.example` (already created in Task 1)

- [ ] **Step 1: Create lib/firebase.ts**

```typescript
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
```

- [ ] **Step 2: Commit**

```bash
git add lib/firebase.ts
git commit -m "feat: add Firebase initialization with Auth and Firestore"
```

---

## Task 3: Landing Page

**Files:**
- Create: `app/page.tsx`

- [ ] **Step 1: Create app/page.tsx**

```typescript
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl font-bold mb-4 tracking-tight">
          VapeVision
        </h1>
        <p className="text-xl text-zinc-400 mb-2">
          AI-powered vape detection
        </p>
        <p className="text-zinc-500 max-w-md mb-10">
          Browser-based detection using MediaPipe Hands. Monitoring mode captures frames when hand-to-face gesture persists for 1.5 seconds.
        </p>
        <div className="flex gap-4">
          <Link
            href="/client"
            className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition"
          >
            Start Monitoring
          </Link>
          <Link
            href="/admin"
            className="px-6 py-3 border border-zinc-700 text-zinc-300 font-semibold rounded-lg hover:bg-zinc-800 transition"
          >
            Admin Dashboard
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-zinc-600 text-sm border-t border-zinc-900">
        &copy; {new Date().getFullYear()} VapeVision &mdash; Built for HackTheValley
      </footer>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add landing page"
```

---

## Task 4: Detection Client Page

**Files:**
- Create: `app/client/page.tsx`

**Detection Logic:**
- MediaPipe Hands (CDN) → 21 landmarks per frame
- Near-face: wrist (landmark 0) to face-center distance < 0.3 AND wrist Y > face Y threshold
- Pinch: thumb-tip (landmark 4) to index-tip (landmark 8) distance < 0.05
- Both true for 1.5s continuously → capture frame
- Canvas capture → base64 JPEG → Firestore `alerts` collection

- [ ] **Step 1: Create app/client/page.tsx**

```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const CAMERA_ID_KEY = "vapevision_camera_id";

function getCameraId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(CAMERA_ID_KEY);
  if (!id) {
    id = `cam_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(CAMERA_ID_KEY, id);
  }
  return id;
}

type Status = "Idle" | "Monitoring" | "Alert triggered";

export default function ClientPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("Idle");
  const [cameraId, setCameraId] = useState<string>("");
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Detection state refs (avoid closure stale values)
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const triggerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTriggeredRef = useRef(false);

  // Thresholds (normalized units)
  const FACE_DIST_THRESHOLD = 0.3;
  const PINCH_DIST_THRESHOLD = 0.05;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  async function sendAlert(imageData: string) {
    const cameraId = getCameraId();
    try {
      await addDoc(collection(db, "alerts"), {
        timestamp: serverTimestamp(),
        cameraId,
        imageData,
        processed: false,
      });
      showToast("Alert captured");
    } catch (e) {
      console.error("Failed to save alert:", e);
      showToast("Failed to send alert");
    }
  }

  function triggerAlert() {
    if (isTriggeredRef.current) return;
    isTriggeredRef.current = true;
    setStatus("Alert triggered");
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/jpeg", 0.7);
    sendAlert(imageData);
    setTimeout(() => {
      isTriggeredRef.current = false;
      setStatus("Monitoring");
    }, 3000);
  }

  useEffect(() => {
    setCameraId(getCameraId());
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    // Load MediaPipe Hands via CDN
    const script1 = document.createElement("script");
    script1.src = "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/hands.min.js";
    script1.async = true;
    document.body.appendChild(script1);

    const script2 = document.createElement("script");
    script2.src = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1640029074/camera_utils.min.js";
    script2.async = true;
    document.body.appendChild(script2);

    script1.onload = () => {
      if (typeof window.Hands === "undefined") {
        setError("Failed to load MediaPipe Hands");
        return;
      }

      const Hands = (window as any).Hands;

      const hands = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      hands.onResults((results: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Draw debug overlay on canvas (optional — helps user see detection)
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // Mirror the video display
          ctx.save();
          ctx.scale(-1, 1);
          ctx.translate(-canvas.width, 0);
          if (results.image) {
            ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
          }
          ctx.restore();
        }

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0];
          const wrist = landmarks[0];      // landmark 0
          const thumbTip = landmarks[4];  // landmark 4
          const indexTip = landmarks[8];  // landmark 8

          // Approximate face center (nose) as top-center of frame
          const faceCenterY = 0.1; // normalized Y, near top of frame
          const faceCenterX = 0.5; // normalized X, center

          const dx = wrist.x - faceCenterX;
          const dy = wrist.y - faceCenterY;
          const dz = wrist.z || 0;
          const wristToFaceDist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          const tdx = thumbTip.x - indexTip.x;
          const tdy = thumbTip.y - indexTip.y;
          const tdz = (thumbTip.z || 0) - (indexTip.z || 0);
          const pinchDist = Math.sqrt(tdx * tdx + tdy * tdy + tdz * tdz);

          const nearFace = wristToFaceDist < FACE_DIST_THRESHOLD && wrist.y > faceCenterY;
          const pinching = pinchDist < PINCH_DIST_THRESHOLD;

          if (nearFace && pinching) {
            if (!triggerTimerRef.current) {
              triggerTimerRef.current = setTimeout(() => {
                triggerAlert();
              }, 1500);
            }
          } else {
            if (triggerTimerRef.current) {
              clearTimeout(triggerTimerRef.current);
              triggerTimerRef.current = null;
            }
          }
        } else {
          if (triggerTimerRef.current) {
            clearTimeout(triggerTimerRef.current);
            triggerTimerRef.current = null;
          }
        }
      });

      handsRef.current = hands;

      // Camera setup
      const camera = new (window as any).Camera(video, {
        onFrame: async () => {
          if (handsRef.current) {
            await handsRef.current.send({ image: video });
          }
        },
        width: 640,
        height: 480,
      });

      camera.start().then(() => {
        setStatus("Monitoring");
        setCameraId(getCameraId());
      }).catch((err: Error) => {
        setError(`Camera error: ${err.message}`);
      });

      cameraRef.current = camera;
    };

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (triggerTimerRef.current) {
        clearTimeout(triggerTimerRef.current);
      }
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black relative">
      {/* Status badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            status === "Alert triggered"
              ? "bg-red-900 text-red-200"
              : status === "Monitoring"
              ? "bg-green-900 text-green-200"
              : "bg-zinc-800 text-zinc-400"
          }`}
        >
          {status}
        </span>
        <span className="text-zinc-600 text-xs font-mono">{cameraId}</span>
      </div>

      {/* Toast */}
      {toast && (
        <div className="absolute top-4 right-4 z-20 bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm">
          {toast}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-red-400 text-center p-6">
            <p className="text-xl mb-2">Camera Access Denied</p>
            <p className="text-zinc-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Video + canvas overlay */}
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full max-w-xl rounded-lg"
          autoPlay
          playsInline
          muted
          style={{ transform: "scaleX(-1)" }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full max-w-xl rounded-lg pointer-events-none"
          style={{ transform: "scaleX(-1)" }}
        />
      </div>

      {/* Back link */}
      <a href="/" className="mt-6 text-zinc-500 hover:text-white text-sm transition">
        &larr; Back to home
      </a>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/client/page.tsx
git commit -m "feat: add detection client with MediaPipe Hands"
```

---

## Task 5: Admin Dashboard

**Files:**
- Create: `app/admin/page.tsx`
- Create: `components/AlertModal.tsx`

- [ ] **Step 1: Create components/AlertModal.tsx**

```typescript
"use client";

interface AlertModalProps {
  imageData: string;
  timestamp: string;
  cameraId: string;
  onClose: () => void;
}

export default function AlertModal({ imageData, timestamp, cameraId, onClose }: AlertModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <p className="text-sm text-zinc-400">Camera: {cameraId}</p>
            <p className="text-xs text-zinc-500">{timestamp}</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        <img
          src={imageData}
          alt="Alert frame"
          className="w-full h-auto"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create app/admin/page.tsx**

```typescript
"use client";

import { useEffect, useState } from "react";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AlertModal from "@/components/AlertModal";

interface Alert {
  id: string;
  timestamp: any;
  cameraId: string;
  imageData: string;
  processed: boolean;
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "alerts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Alert[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Alert, "id">),
      }));
      setAlerts(data);
    });

    return unsubscribe;
  }, [user]);

  async function handleSignIn() {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error("Sign-in failed:", e);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
  }

  function formatTimestamp(ts: any): string {
    if (!ts) return "—";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleString();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-zinc-400">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black px-6">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-zinc-400 mb-8 text-center max-w-md">
          Sign in with your Google account to view vape detection alerts.
        </p>
        <button
          onClick={handleSignIn}
          className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>
        <a href="/" className="mt-6 text-zinc-500 hover:text-white text-sm transition">
          &larr; Back to home
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">VapeVision Admin</h1>
          <span className="text-zinc-500 text-sm">{alerts.length} alerts</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-zinc-400 text-sm">{user.email}</span>
          <button
            onClick={handleSignOut}
            className="text-sm text-zinc-400 hover:text-white transition"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Alert list */}
      <main className="p-6">
        {alerts.length === 0 ? (
          <div className="text-center text-zinc-500 mt-20">
            No alerts yet
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <button
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className="w-full flex items-center gap-4 p-4 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition text-left"
              >
                <img
                  src={alert.imageData}
                  alt="Alert thumbnail"
                  className="w-16 h-12 object-cover rounded"
                />
                <div>
                  <p className="text-sm text-zinc-300">
                    {formatTimestamp(alert.timestamp)}
                  </p>
                  <p className="text-xs text-zinc-500 font-mono">
                    {alert.cameraId}
                  </p>
                </div>
                {alert.processed && (
                  <span className="ml-auto text-xs text-zinc-600">Processed</span>
                )}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedAlert && (
        <AlertModal
          imageData={selectedAlert.imageData}
          timestamp={formatTimestamp(selectedAlert.timestamp)}
          cameraId={selectedAlert.cameraId}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/AlertModal.tsx app/admin/page.tsx
git commit -m "feat: add admin dashboard with Google auth and alert list"
```

---

## Task 6: Header Component

**Files:**
- Create: `components/Header.tsx`
- Modify: `app/page.tsx` (use Header)

- [ ] **Step 1: Create components/Header.tsx**

```typescript
import Link from "next/link";

export default function Header() {
  return (
    <header className="px-6 py-4 border-b border-zinc-900">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-lg font-bold hover:text-zinc-300 transition">
          VapeVision
        </Link>
        <nav className="flex gap-4 text-sm text-zinc-500">
          <Link href="/client" className="hover:text-white transition">
            Monitor
          </Link>
          <Link href="/admin" className="hover:text-white transition">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Update app/page.tsx to use Header**

```typescript
import Link from "next/link";
import Header from "@/components/Header";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl font-bold mb-4 tracking-tight">
          VapeVision
        </h1>
        <p className="text-xl text-zinc-400 mb-2">
          AI-powered vape detection
        </p>
        <p className="text-zinc-500 max-w-md mb-10">
          Browser-based detection using MediaPipe Hands. Monitoring mode captures
          frames when hand-to-face gesture persists for 1.5 seconds.
        </p>
        <div className="flex gap-4">
          <Link
            href="/client"
            className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition"
          >
            Start Monitoring
          </Link>
          <Link
            href="/admin"
            className="px-6 py-3 border border-zinc-700 text-zinc-300 font-semibold rounded-lg hover:bg-zinc-800 transition"
          >
            Admin Dashboard
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-zinc-600 text-sm border-t border-zinc-900">
        &copy; {new Date().getFullYear()} VapeVision &mdash; Built for HackTheValley
      </footer>
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/Header.tsx app/page.tsx
git commit -m "feat: add Header component and update landing page"
```

---

## Self-Review Checklist

**Spec coverage:**
- Landing page (`/`) — Task 3 ✓
- Detection client (`/client`) with MediaPipe CDN — Task 4 ✓
- Admin dashboard (`/admin`) with Google auth — Task 5 ✓
- Firestore alert storage with base64 images — Task 4 + Task 5 ✓
- Dark Tailwind theme — Task 1 ✓
- Camera ID in localStorage — Task 4 ✓
- Alert modal — Task 5 ✓
- Header component — Task 6 ✓

**Placeholder scan:** No TBD/TODO. All thresholds hardcoded (0.3, 0.05, 1.5s) from spec.

**Type consistency:** All Firebase imports from `firebase/auth` and `firebase/firestore` consistent. `serverTimestamp()` from `firebase/firestore`. `onAuthStateChanged` from `firebase/auth`.

**Files per task:**
- Task 1: 8 files created (package.json, configs, globals.css, layout.tsx, .env.example, .gitignore)
- Task 2: 1 file created (lib/firebase.ts)
- Task 3: 1 file created (app/page.tsx)
- Task 4: 1 file created (app/client/page.tsx)
- Task 5: 2 files created (components/AlertModal.tsx, app/admin/page.tsx)
- Task 6: 2 files (components/Header.tsx create, app/page.tsx modify)

**No placeholders, no "similar to X" steps. All code is complete.**