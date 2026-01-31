async function getWallets() {
  const res = await fetch(
    ${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/wallets,
    { cache: 'no-store' }
  )
  return res.json()
}

export default async function WalletsPage() {
  const { data } = await getWallets()

  return (
    <table className="w-full bg-white rounded shadow">
      <thead>
        <tr>
          <th>User</th>
          <th>Balance</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        {data.map((w: any) => (
          <tr key={w.id}>
            <td>{w.user_id}</td>
            <td>₦{w.balance}</td>
            <td>{new Date(w.created_at).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}