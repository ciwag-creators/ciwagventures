async function getLogs() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/audit-logs`,
    { cache: 'no-store' }
  )
  return res.json()
}

export default async function AuditLogsPage() {
  const { data } = await getLogs()

  return (
    <table className="w-full bg-white rounded shadow">
      <thead>
        <tr>
          <th>User</th>
          <th>Action</th>
          <th>Amount</th>
          <th>Reference</th>
        </tr>
      </thead>
      <tbody>
        {data.map((log: any) => (
          <tr key={log.id}>
            <td>{log.user_id}</td>
            <td>{log.action}</td>
            <td>₦{log.amount}</td>
            <td>{log.reference}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
