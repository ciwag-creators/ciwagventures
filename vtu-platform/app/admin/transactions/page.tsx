async function getTransactions() {
  const res = await fetch(
    ${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/transactions,
    { cache: 'no-store' }
  )
  return res.json()
}

export default async function TransactionsPage() {
  const { data } = await getTransactions()

  return (
    <table className="w-full bg-white rounded shadow">
      <thead>
        <tr>
          <th>Reference</th>
          <th>Service</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((t: any) => (
          <tr key={t.id}>
            <td>{t.reference}</td>
            <td>{t.service}</td>
            <td>₦{t.amount}</td>
            <td>{t.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}