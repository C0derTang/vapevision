"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Detection thresholds
const REFERENCE_HAND_SIZE = 0.15; // normalized units, ~arm's length
const FACE_DIST_THRESHOLD = 0.2;
const PINCH_DIST_THRESHOLD = 0.1;
const TRIGGER_TIME = 1500;
const FACE_CENTER = { x: 0.5, y: 0.1 };

// Status types
type Status = "Idle" | "Monitoring" | "Alert triggered";

declare global {
  interface Window {
    Hands: any;
    Camera: any;
    FaceMesh: any;
  }
}

export default function ClientPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  const [status, setStatus] = useState<Status>("Idle");
  const [cameraId, setCameraId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [toast, setToast] = useState<string>("");
  const [isFlashing, setIsFlashing] = useState(false);
  const [nearFaceActive, setNearFaceActive] = useState(false);
  const [pinchActive, setPinchActive] = useState(false);
  const prevNearFaceRef = useRef(false);

  const triggeredRef = useRef(false);
  const triggerStartRef = useRef<number | null>(null);
  const handsInstanceRef = useRef<any>(null);
  const faceMeshInstanceRef = useRef<any>(null);
  const cameraInstanceRef = useRef<any>(null);
  const mountedRef = useRef(true);
  const faceLandmarksRef = useRef<any[]>([]);

  // Get or create camera ID
  useEffect(() => {
    let id = localStorage.getItem("vapevision_camera_id");
    if (!id) {
      id = `cam_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("vapevision_camera_id", id);
    }
    setCameraId(id);
  }, []);

  // Show toast
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2000);
  };

  // Euclidean distance between two points with x,y,z
  const distance = (p1: any, p2: any) => {
    return Math.sqrt(
      Math.pow(p1.x - p2.x, 2) +
        Math.pow(p1.y - p2.y, 2) +
        Math.pow((p1.z || 0) - (p2.z || 0), 2)
    );
  };

  // Check if hand is near face using actual face landmarks
  const isHandNearFace = (handLandmarks: any[], threshold: number) => {
    if (faceLandmarksRef.current.length === 0) return false;
    const nose = faceLandmarksRef.current[1]; // landmark 1 = nose tip in FaceMesh
    const wrist = handLandmarks[0];
    const wristDist = distance(wrist, nose);
    return wristDist < threshold;
  };

  // Check if pinch gesture
  const isPinchGesture = (landmarks: any[], threshold: number) => {
    const thumbTip = landmarks[4]; // landmark 4
    const indexTip = landmarks[8]; // landmark 8
    const pinchDist = distance(thumbTip, indexTip);
    return pinchDist < threshold;
  };

  // Capture and save to Firestore
  const captureAndSave = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    ctx.drawImage(videoRef.current, 0, 0);

    const imageData = canvas.toDataURL("image/jpeg", 0.7);

    try {
      await addDoc(collection(db, "alerts"), {
        timestamp: serverTimestamp(),
        cameraId: cameraId,
        imageData: imageData,
        processed: false,
      });
      showToast("Alert captured!");
    } catch (err) {
      console.error("Failed to save alert:", err);
    }
  };

  // Reset triggered state
  const resetTriggered = () => {
    setTimeout(() => {
      triggeredRef.current = false;
      triggerStartRef.current = null;
      setStatus("Monitoring");
    }, 3000);
  };

  // Draw landmarks on overlay canvas
  const drawLandmarks = (landmarks: any[], color: string, radius: number, showPinch: boolean = false) => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;

    const ctx = overlayCanvas.getContext("2d");
    if (!ctx) return;

    // Draw wrist
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(
      landmarks[0].x * overlayCanvas.width,
      landmarks[0].y * overlayCanvas.height,
      radius,
      0,
      2 * Math.PI
    );
    ctx.fill();

    // Draw thumb tip and index tip if showing pinch
    if (showPinch) {
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.arc(
        landmarks[4].x * overlayCanvas.width,
        landmarks[4].y * overlayCanvas.height,
        5,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        landmarks[8].x * overlayCanvas.width,
        landmarks[8].y * overlayCanvas.height,
        5,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  };

  const drawNose = () => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas || faceLandmarksRef.current.length === 0) return;
    const ctx = overlayCanvas.getContext("2d");
    if (!ctx) return;
    const nose = faceLandmarksRef.current[1];
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(
      nose.x * overlayCanvas.width,
      nose.y * overlayCanvas.height,
      10,
      0,
      2 * Math.PI
    );
    ctx.fill();
  };

  // Initialize camera and MediaPipe
  useEffect(() => {
    mountedRef.current = true;

    const video = videoRef.current;
    const overlayCanvas = overlayCanvasRef.current;

    if (!video || !overlayCanvas) return;

    overlayCanvas.width = video.videoWidth || 640;
    overlayCanvas.height = video.videoHeight || 480;

    // Load MediaPipe scripts sequentially
    const loadScripts = () => {
      return new Promise<void>((resolve) => {
        const handsScript = document.createElement("script");
        handsScript.src =
          "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/hands.min.js";
        handsScript.onload = () => {
          const faceMeshScript = document.createElement("script");
          faceMeshScript.src =
            "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/face_mesh.min.js";
          faceMeshScript.onload = () => {
            const cameraScript = document.createElement("script");
            cameraScript.src =
              "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1640029074/camera_utils.min.js";
            cameraScript.onload = () => resolve();
            document.head.appendChild(cameraScript);
          };
          document.head.appendChild(faceMeshScript);
        };
        document.head.appendChild(handsScript);
      });
    };

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        video.srcObject = stream;

        await loadScripts();

        if (!mountedRef.current) return;

        await video.play();
        if (!mountedRef.current) return;

        setStatus("Monitoring");

        // Initialize MediaPipe Face Mesh first to get face landmarks
        const faceMesh = new window.FaceMesh({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`;
          },
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results: any) => {
          if (!mountedRef.current) return;
          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            faceLandmarksRef.current = results.multiFaceLandmarks[0];
          } else {
            faceLandmarksRef.current = [];
          }
        });

        faceMeshInstanceRef.current = faceMesh;

        // Initialize MediaPipe Hands
        const hands = new window.Hands({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`;
          },
        });

        hands.setOptions({
          maxNumHands: 4,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results: any) => {
          if (!mountedRef.current || !overlayCanvasRef.current) return;

          overlayCanvasRef.current.width = video.videoWidth || 640;
          overlayCanvasRef.current.height = video.videoHeight || 480;

          const ctx = overlayCanvasRef.current.getContext("2d");
          if (!ctx) return;

          ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
          drawNose();

          let anyNearFace = false;
          let anyPinch = false;
          let anyTriggered = false;

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            for (const handLandmarks of results.multiHandLandmarks) {
              // Compute hand size for adaptive threshold scaling
              const wrist = handLandmarks[0];
              const middleMcp = handLandmarks[9]; // landmark 9 = middle finger MCP
              const handSize = distance(wrist, middleMcp);
              const scale = handSize / REFERENCE_HAND_SIZE;

              const effectiveFaceDist = FACE_DIST_THRESHOLD * scale;
              const effectivePinchDist = PINCH_DIST_THRESHOLD * scale;

              const nearFace = isHandNearFace(handLandmarks, effectiveFaceDist);
              const pinch = isPinchGesture(handLandmarks, effectivePinchDist);

              drawLandmarks(handLandmarks, "#22c55e", 8, nearFace);

              if (nearFace) anyNearFace = true;
              if (pinch) anyPinch = true;

              if (nearFace && pinch) {
                anyTriggered = true;
                if (!triggerStartRef.current) {
                  triggerStartRef.current = Date.now();
                }
                const elapsed = Date.now() - triggerStartRef.current;
                if (elapsed >= TRIGGER_TIME && !triggeredRef.current) {
                  triggeredRef.current = true;
                  setStatus("Alert triggered");
                  captureAndSave().then(() => {
                    if (mountedRef.current) resetTriggered();
                  });
                }
              }
            }

            const prevNearFace = prevNearFaceRef.current;
            prevNearFaceRef.current = anyNearFace;

            // Reset everything when nearFace ends for any hand
            if (prevNearFace && !anyNearFace) {
              triggerStartRef.current = null;
              triggeredRef.current = false;
              setIsFlashing(false);
              if (status === "Alert triggered") {
                setStatus("Monitoring");
              }
            }

            setNearFaceActive(anyNearFace);
            setPinchActive(anyPinch);
            setIsFlashing(anyTriggered);
          } else {
            setNearFaceActive(false);
            setPinchActive(false);
            setIsFlashing(false);
            triggerStartRef.current = null;
            triggeredRef.current = false;
            prevNearFaceRef.current = false;
            if (status !== "Alert triggered") {
              setStatus("Monitoring");
            }
          }
        });

        handsInstanceRef.current = hands;

        const camera = new window.Camera(video, {
          onFrame: async () => {
            if (!mountedRef.current) return;
            await faceMesh.send({ image: video });
            await hands.send({ image: video });
          },
          width: 640,
          height: 480,
        });

        cameraInstanceRef.current = camera;
        await camera.start();
      } catch (err: any) {
        if (mountedRef.current) {
          setError(
            err.name === "NotAllowedError"
              ? "Camera access denied. Please allow camera permissions."
              : `Camera error: ${err.message}`
          );
        }
      }
    };

    initCamera();

    return () => {
      mountedRef.current = false;
      if (cameraInstanceRef.current) {
        cameraInstanceRef.current.stop();
      }
      if (handsInstanceRef.current) {
        handsInstanceRef.current.close();
      }
      if (faceMeshInstanceRef.current) {
        faceMeshInstanceRef.current.close();
      }
      if (video.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case "Idle":
        return "bg-gray-500";
      case "Monitoring":
        return "bg-green-500";
      case "Alert triggered":
        return "bg-red-500";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <Link
          href="/"
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          Back to Home
        </Link>
        <div className="flex items-center gap-4">
          {cameraId && (
            <span className="text-xs text-gray-500 font-mono">{cameraId}</span>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {error ? (
          <div className="text-center space-y-4 max-w-md">
            <div className="text-red-500 text-xl">Camera Error</div>
            <p className="text-gray-400">{error}</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Go Back
            </Link>
          </div>
        ) : (
          <div className="relative w-full max-w-2xl">
            {/* Status badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
              <span className="text-sm font-medium text-white bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                {status}
              </span>
            </div>

            {/* Video and overlay container */}
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video
                ref={videoRef}
                className="w-full h-auto"
                playsInline
                muted
              />
              <canvas
                ref={overlayCanvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Toast notification */}
            {toast && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
                {toast}
              </div>
            )}

            {/* Detection info */}
            <div className="mt-6 text-center text-sm space-y-2">
              <p className={nearFaceActive ? "text-green-400 animate-pulse" : "text-gray-500"}>
                Hand near face (wrist-to-face distance &lt; {FACE_DIST_THRESHOLD})
              </p>
              <p className={pinchActive ? "text-green-400 animate-pulse" : "text-gray-500"}>
                Pinch gesture (thumb-index distance &lt; {PINCH_DIST_THRESHOLD})
              </p>
              <p className={isFlashing ? "text-green-400 animate-pulse" : "text-gray-500"}>
                Sustained for {TRIGGER_TIME}ms triggers capture
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
