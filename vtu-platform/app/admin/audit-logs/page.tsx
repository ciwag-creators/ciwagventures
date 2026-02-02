import AuditLogsTable from '@/components/admin/AuditLogsTable'

async function getAuditLogs() {
  const res = await fetch('/api/admin/audit-logs', {
    cache: 'no-store'
  })

  if (!res.ok) {
    throw new Error('Failed to fetch audit logs')
  }

  const json = await res.json()
  return json.data
}

export default async function AdminAuditLogs() {
  const logs = await getAuditLogs()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit Logs</h1>

      <div className="bg-white rounded-xl shadow p-4">
        <AuditLogsTable data={logs} />
      </div>
    </div>
  )
}