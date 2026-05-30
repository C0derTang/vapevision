import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-2xl text-center space-y-8">
          {/* Logo/Title */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
              VapeVision
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light">
              AI-powered vape detection
            </p>
          </div>

          {/* Description */}
          <p className="text-gray-500 text-lg leading-relaxed max-w-md mx-auto">
            Advanced hand and object recognition monitors for vaping behavior in real-time.
            Uses computer vision to detect hand-to-face gestures and objects held.
</p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/client"
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors border border-gray-700"
            >
              Start Monitoring
            </Link>
            <Link
              href="/admin"
              className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-gray-300 font-medium rounded-lg transition-colors border border-gray-700"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-800">
        <div className="max-w-2xl mx-auto text-center text-gray-600 text-sm">
          <p>2026 VapeVision. All rights reserved.</p>
          <p className="mt-1">Built for HackTheValley</p>
        </div>
      </footer>
    </div>
  )
}
