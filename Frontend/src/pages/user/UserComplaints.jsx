import { useEffect, useState } from 'react'

import { complaintApi, mealApi } from '../../services/api.js'

const complaintTypes = ['Delivery', 'Taste', 'Nutrition', 'Other']

function UserComplaints() {
  const [complaints, setComplaints] = useState([])
  const [assignments, setAssignments] = useState([])
  const [form, setForm] = useState({
    assignment_id: '',
    type: complaintTypes[0],
    description: '',
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const [complaintList, today, upcoming] = await Promise.all([
        complaintApi.list(),
        mealApi.today(),
        mealApi.upcoming(14),
      ])
      setComplaints(complaintList)
      setAssignments([...today, ...upcoming])
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to fetch complaints.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.assignment_id || !form.description.trim()) {
      setError('Please choose a meal assignment and add details.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await complaintApi.create({
        assignment_id: Number(form.assignment_id),
        type: form.type,
        description: form.description.trim(),
      })
      setSuccess('Complaint submitted. Our team will follow up soon.')
      setForm({ assignment_id: '', type: complaintTypes[0], description: '' })
      await loadData()
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to submit complaint.')
    } finally {
      setSubmitting(false)
      setTimeout(() => setSuccess(''), 4000)
    }
  }

  if (loading) {
    return <p>Loading complaints...</p>
  }

  return (
    <div className="dual-columns">
      <div className="card">
        <h3>Submit a new complaint</h3>
        <form onSubmit={handleSubmit}>
          <div className="input-control">
            <label className="input-label">Meal assignment</label>
            <select
              className="select-field"
              value={form.assignment_id}
              onChange={(e) => setForm((prev) => ({ ...prev, assignment_id: e.target.value }))}
            >
              <option value="">Choose assignment</option>
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.assignment_date} • {assignment.meal?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid">
            <div className="input-control">
              <label className="input-label">Type</label>
              <select
                className="select-field"
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
              >
                {complaintTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-control">
            <label className="input-label">Description</label>
            <textarea
              className="textarea-field"
              rows={4}
              value={form.description}
              placeholder="Tell us what went wrong so we can improve."
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
          {success && <p style={{ color: '#2ecc71' }}>{success}</p>}

          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Sending...' : 'Submit complaint'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Your complaints</h3>
        {complaints.length === 0 && <p className="empty-state">No complaints yet.</p>}
        {complaints.map((complaint) => (
          <div key={complaint.id} className="complaint-card">
            <h4>{complaint.type}</h4>
            <p>{complaint.description}</p>
            <div className="complaint-meta">
              Assignment #{complaint.assignment_id} • {new Date(complaint.created_at).toLocaleString()}
            </div>
            <span
              className={`pill ${
                complaint.status === 'RESOLVED'
                  ? 'success'
                  : complaint.status === 'OPEN'
                  ? 'neutral'
                  : 'danger'
              }`}
            >
              {complaint.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserComplaints

