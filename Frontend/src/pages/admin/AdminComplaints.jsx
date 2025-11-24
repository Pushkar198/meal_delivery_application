import { useEffect, useState } from 'react'

import { adminApi } from '../../services/api.js'

function AdminComplaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [resolvingId, setResolvingId] = useState(null)
  const [error, setError] = useState('')

  const loadComplaints = async () => {
    try {
      setLoading(true)
      const data = await adminApi.complaints()
      setComplaints(data)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to fetch complaints.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComplaints()
  }, [])

  const resolve = async (id) => {
    setResolvingId(id)
    try {
      await adminApi.resolveComplaint(id)
      await loadComplaints()
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to resolve complaint.')
    } finally {
      setResolvingId(null)
    }
  }

  if (loading) {
    return <p>Loading complaints...</p>
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>All complaints</h3>
        <span className="badge warning">
          {complaints.filter((c) => c.status !== 'RESOLVED').length} open
        </span>
      </div>
      {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}

      {complaints.length === 0 && <p className="empty-state">No complaints logged.</p>}

      {complaints.map((complaint) => (
        <div key={complaint.id} className="complaint-card">
          <h4>
            #{complaint.id} · User {complaint.user_id}
          </h4>
          <p>{complaint.description}</p>
          <div className="complaint-meta">
            Assignment {complaint.assignment_id} • {new Date(complaint.created_at).toLocaleString()}
          </div>
          <div className="inline-actions">
            <span
              className={`pill ${
                complaint.status === 'RESOLVED'
                  ? 'success'
                  : complaint.status === 'OPEN'
                  ? 'danger'
                  : 'neutral'
              }`}
            >
              {complaint.status}
            </span>
            {complaint.status !== 'RESOLVED' && (
              <button className="btn-ghost" onClick={() => resolve(complaint.id)} disabled={resolvingId === complaint.id}>
                {resolvingId === complaint.id ? 'Resolving...' : 'Mark resolved'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default AdminComplaints

