import Link from 'next/link'

export default function Header() {
  return (
    <header className="px-6 py-5 border-b border-gray-900 relative z-10">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="w-8 h-8 border border-teal-400/30 flex items-center justify-center group-hover:border-teal-400/60 transition-colors">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          </div>
          <span className="font-mono text-sm font-semibold tracking-widest text-white uppercase group-hover:text-teal-400 transition-colors">
            VapeVision
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-8">
          <Link
            href="/client"
            className="font-mono text-xs tracking-widest text-gray-500 hover:text-teal-400 uppercase transition-colors"
          >
            Monitor
          </Link>
          <Link
            href="/admin"
            className="font-mono text-xs tracking-widest text-gray-500 hover:text-teal-400 uppercase transition-colors"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  )
}