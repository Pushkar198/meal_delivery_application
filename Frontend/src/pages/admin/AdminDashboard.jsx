import { useEffect, useState } from 'react'

import { adminApi } from '../../services/api.js'

function AdminDashboard() {
  const [metrics, setMetrics] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [metricData, complaintList, customerList] = await Promise.all([
          adminApi.dashboard(),
          adminApi.complaints(),
          adminApi.customers(),
        ])
        setMetrics(metricData)
        setComplaints(complaintList)
        setCustomers(customerList)
      } catch (err) {
        setError(err?.response?.data?.detail || 'Unable to fetch admin insights.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <p>Loading admin metrics...</p>
  }

  if (error) {
    return <p style={{ color: '#ff6b6b' }}>{error}</p>
  }

  const statCards = [
    {
      label: 'Total users',
      value: metrics?.total_users ?? 0,
    },
    {
      label: 'Active subscriptions',
      value: metrics?.active_subscriptions ?? 0,
    },
    {
      label: 'Open complaints',
      value: metrics?.pending_complaints ?? 0,
    },
  ]

  const openComplaints = complaints.filter((c) => c.status !== 'RESOLVED').slice(0, 5)
  const recentCustomers = customers.slice(0, 5)

  return (
    <div className="grid-two">
      <div>
        <div className="stat-grid">
          {statCards.map((stat) => (
            <div key={stat.label} className="stat-card">
              <p className="stat-value">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Open complaints</h3>
            <span className="badge warning">{openComplaints.length} awaiting action</span>
          </div>
          {openComplaints.length === 0 && <p className="empty-state">No open complaints 🎉</p>}
          {openComplaints.map((complaint) => (
            <div key={complaint.id} className="complaint-card">
              <h4>#{complaint.id}</h4>
              <p>{complaint.description}</p>
              <div className="complaint-meta">
                User #{complaint.user_id} • Assignment #{complaint.assignment_id}
              </div>
              <span className="pill danger">{complaint.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>New customers</h3>
        {recentCustomers.length === 0 && <p className="empty-state">No customers yet.</p>}
        {recentCustomers.map((customer) => (
          <div key={customer.id} className="meal-item">
            <div className="meal-info">
              <strong>{customer.name}</strong>
              <span className="meal-meta">{customer.email}</span>
            </div>
            <span className={`badge ${customer.is_admin ? 'warning' : 'neutral'}`}>
              {customer.is_admin ? 'Admin' : 'Customer'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboard

