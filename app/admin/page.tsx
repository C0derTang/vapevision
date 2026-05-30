"use client";

import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, orderBy, Timestamp, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import AlertModal from "@/components/AlertModal";

interface Alert {
  id: string;
  timestamp: Timestamp;
  cameraId: string;
  imageData: string;
  processed: boolean;
}

function formatTimestamp(ts: Timestamp | null): string {
  if (!ts) return "—";
  const date = ts.toDate();
  return date.toLocaleString();
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "alerts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alertData: Alert[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Alert[];
      setAlerts(alertData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Sign in error:", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "alerts", deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleVerify = async (alert: Alert, confirmed: boolean) => {
    setVerifying(true);
    try {
      if (confirmed) {
        await addDoc(collection(db, "vaping_cases"), {
          timestamp: alert.timestamp,
          cameraId: alert.cameraId,
          imageData: alert.imageData,
          confirmedAt: serverTimestamp(),
          originalAlertId: alert.id,
        });
      }
      await deleteDoc(doc(db, "alerts", alert.id));
      setSelectedAlert(null);
    } catch (err) {
      console.error("Verify error:", err);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] text-gray-100 flex items-center justify-center relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(#0c2682 1px, transparent 1px), linear-gradient(90deg, #0c2682 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        <div className="font-mono text-sm text-gray-300 tracking-widest uppercase animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#080808] text-gray-100 flex items-center justify-center relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(#0c2682 1px, transparent 1px), linear-gradient(90deg, #0c2682 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        {/* Noise overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />

        <div className="text-center space-y-8 max-w-md mx-auto px-6 relative z-10">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter text-white">VapeVision</h1>
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-blue-600 to-transparent mx-auto" />
            <p className="font-mono text-sm text-gray-300 tracking-widest uppercase">Admin Dashboard — Auth Required</p>
          </div>

          <button
            onClick={handleSignIn}
            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-black font-mono font-bold text-sm tracking-widest uppercase hover:bg-blue-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-gray-100 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(#0c2682 1px, transparent 1px), linear-gradient(90deg, #0c2682 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-900 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-6">
          <h1 className="font-mono text-sm font-semibold tracking-widest text-white uppercase">VapeVision</h1>
          <div className="w-px h-4 bg-gray-800" />
          <span className="font-mono text-xs text-gray-300 tracking-widest uppercase">
            {alerts.length} Alert{alerts.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-mono text-xs text-gray-400">{user.email}</span>
          <button
            onClick={handleSignOut}
            className="font-mono text-xs tracking-widest text-gray-300 hover:text-blue-600 uppercase transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-sm w-full mx-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-2">Delete Alert</h3>
            <p className="text-gray-400 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedAlert && (
        <AlertModal
          imageData={selectedAlert.imageData}
          timestamp={formatTimestamp(selectedAlert.timestamp)}
          cameraId={selectedAlert.cameraId}
          onClose={() => setSelectedAlert(null)}
          onConfirmVaping={() => handleVerify(selectedAlert, true)}
          onFalsePositive={() => handleVerify(selectedAlert, false)}
          verifying={verifying}
        />
      )}
    </div>
  );
}
