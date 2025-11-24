import { useEffect, useState } from 'react'

import { adminApi } from '../../services/api.js'

function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const list = await adminApi.customers()
        setCustomers(list)
      } catch (err) {
        setError(err?.response?.data?.detail || 'Unable to fetch customers.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <p>Loading customers...</p>
  }

  if (error) {
    return <p style={{ color: '#ff6b6b' }}>{error}</p>
  }

  return (
    <div className="card">
      <h3>Customers</h3>
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Admin</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.is_admin ? 'Yes' : 'No'}</td>
                <td>{new Date(customer.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminCustomers

