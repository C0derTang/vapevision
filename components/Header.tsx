import Link from 'next/link'

export default function Header() {
  return (
    <header className="px-6 py-4 border-b border-gray-800">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-white hover:text-gray-300 transition-colors">
          VapeVision
        </Link>

        {/* Nav Links */}
        <nav className="flex gap-6">
          <Link
            href="/client"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Monitor
          </Link>
          <Link
            href="/admin"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  )
}
