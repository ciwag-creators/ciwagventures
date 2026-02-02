'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Transactions', href: '/admin/transactions' },
  { name: 'Wallets', href: '/admin/wallets' },
  { name: 'Audit Logs', href: '/admin/audit-logs' }
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-6">
      <h1 className="text-xl font-bold mb-8">Admin</h1>

      <nav className="space-y-2">
        {links.map(link => {
          const active = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={block rounded-lg px-4 py-2 text-sm font-medium transition
                ${
                  active
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }
              }
            >
              {link.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}