"use client";

import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-6">
          <h1 className="text-3xl font-bold">VapeVision Admin</h1>
          <p className="text-gray-400">
            Sign in with your Google account to view alerts.
          </p>
          <button
            onClick={handleSignIn}
            className="inline-flex items-center gap-3 px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-5 h-5"
            >
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">VapeVision Admin</h1>
          <span className="text-sm text-gray-500">
            {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{user.email}</span>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Alert List */}
      <main className="p-6">
        {alerts.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No alerts yet</div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
              >
                <img
                  src={alert.imageData}
                  alt={`Alert from ${alert.cameraId}`}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-gray-400">
                      {alert.cameraId}
                    </span>
                    {alert.processed && (
                      <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">
                        Processed
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {formatTimestamp(alert.timestamp)}
                  </div>
                </div>
              </div>
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
