import { requireAdmin } from '@/lib/admin-auth'

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="p-4 bg-black text-white font-bold">
        Admin Dashboard
      </header>

      <main className="p-6">{children}</main>
    </div>
  )
}