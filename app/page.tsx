"use client";

import Link from 'next/link'
import Header from '@/components/Header'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080808] text-gray-100 flex flex-col relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(#0c2682 1px, transparent 1px), linear-gradient(90deg, #0c2682 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }} />

      {/* Scan line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-full h-[1px] bg-blue-600/10 animate-[scan_8s_linear_infinite]" style={{ top: '0%', animation: 'scan 8s linear infinite' }} />
      </div>

      <Header />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 relative z-10">
        <div className="max-w-3xl text-center space-y-12">
          {/* Status indicator */}
          <div className="flex items-center justify-center gap-3" style={{ animation: 'fadeIn 0.6s ease-out 0.1s both' }}>
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-mono text-blue-600/60 tracking-widest uppercase">System Active</span>
          </div>

          {/* Logo/Title */}
          <div className="space-y-6" style={{ animation: 'fadeIn 0.8s ease-out 0.2s both' }}>
            <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-white relative">
              VapeVision
              <span className="absolute -inset-4 bg-gradient-to-r from-transparent via-blue-600/10 to-transparent blur-3xl" />
            </h1>
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-blue-600 to-transparent mx-auto" />
          </div>

          {/* Tagline */}
          <p className="text-2xl md:text-3xl font-mono text-blue-600 tracking-tight" style={{ animation: 'fadeIn 0.8s ease-out 0.4s both' }}>
            AI-powered vape detection
          </p>

          {/* Description */}
          <p className="text-gray-500 text-base leading-relaxed max-w-lg mx-auto font-mono text-sm" style={{ animation: 'fadeIn 0.8s ease-out 0.6s both' }}>
            <span className="text-blue-600/40">&gt;</span> Real-time hand tracking and gesture recognition via MediaPipe.
            <br />
            Detects proximity to face and object manipulation patterns.
            <br />
            Frame capture on sustained detection.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8" style={{ animation: 'fadeIn 0.8s ease-out 0.8s both' }}>
            <Link
              href="/client"
              className="group relative px-10 py-5 bg-blue-600 text-black font-mono font-bold text-sm tracking-widest uppercase overflow-hidden transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                  <line x1="12" y1="2" x2="12" y2="6" strokeWidth="1.5"/>
                  <line x1="12" y1="18" x2="12" y2="22" strokeWidth="1.5"/>
                  <line x1="2" y1="12" x2="6" y2="12" strokeWidth="1.5"/>
                  <line x1="18" y1="12" x2="22" y2="12" strokeWidth="1.5"/>
                </svg>
                Start Monitoring
              </span>
              <div className="absolute inset-0 bg-blue-700 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>

            <Link
              href="/admin"
              className="group px-10 py-5 bg-transparent text-gray-400 font-mono font-medium text-sm tracking-widest uppercase border border-gray-800 hover:border-gray-600 hover:text-white transition-all duration-300 hover:scale-105"
            >
              <span className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5"/>
                  <path d="M3 9h18M9 21V9" strokeWidth="1.5"/>
                </svg>
                Admin Dashboard
              </span>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-16 pt-16 font-mono text-xs text-gray-600" style={{ animation: 'fadeIn 0.8s ease-out 1s both' }}>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">21</div>
              <div className="text-gray-600 tracking-widest uppercase mt-1">Landmarks</div>
            </div>
            <div className="w-px h-8 bg-gray-800" />
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">1.5s</div>
              <div className="text-gray-600 tracking-widest uppercase mt-1">Detection Window</div>
            </div>
            <div className="w-px h-8 bg-gray-800" />
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">0.05</div>
              <div className="text-gray-600 tracking-widest uppercase mt-1">Pinch Threshold</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-900 relative z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between font-mono text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />
            <span>2026 VapeVision</span>
          </div>
          <div className="text-gray-700">
            Built for HackTheValley
          </div>
        </div>
      </footer>

      {/* Inline keyframes */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        :global(body) {
          font-family: 'IBM Plex Mono', monospace;
        }

        h1 {
          font-family: 'Syne', sans-serif;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scan {
          0% { top: -2px; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  )
}