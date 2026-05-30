import Link from 'next/link'

export default function Header() {
  return (
    <header className="px-6 py-5 border-b border-gray-900 relative z-10">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="w-8 h-8 border border-blue-600/30 flex items-center justify-center group-hover:border-blue-600/60 transition-colors">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          </div>
          <span className="font-mono text-sm font-semibold tracking-widest text-white uppercase group-hover:text-blue-600 transition-colors">
            VapeVision
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-8">
          <Link
            href="/client"
            className="font-mono text-xs tracking-widest text-gray-300 hover:text-blue-600 uppercase transition-colors"
          >
            Monitor
          </Link>
          <Link
            href="/admin"
            className="font-mono text-xs tracking-widest text-gray-300 hover:text-blue-600 uppercase transition-colors"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  )
}