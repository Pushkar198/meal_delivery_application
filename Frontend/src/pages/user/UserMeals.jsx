import { useEffect, useMemo, useState } from 'react'

import { mealApi } from '../../services/api.js'

function UserMeals() {
  const [days, setDays] = useState(7)
  const [today, setToday] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [todays, upcomingData] = await Promise.all([mealApi.today(), mealApi.upcoming(days)])
        setToday(todays)
        setUpcoming(upcomingData)
      } catch (err) {
        setError(err?.response?.data?.detail || 'Unable to load meal schedule.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [days])

  const groupedUpcoming = useMemo(() => {
    const grouped = upcoming.reduce((acc, assignment) => {
      acc[assignment.assignment_date] = acc[assignment.assignment_date] || []
      acc[assignment.assignment_date].push(assignment)
      return acc
    }, {})
    return Object.entries(grouped).sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
  }, [upcoming])

  const confirmDelivery = async (assignmentId) => {
    try {
      await mealApi.confirmDelivery(assignmentId)
      const [todays, upcomingData] = await Promise.all([mealApi.today(), mealApi.upcoming(days)])
      setToday(todays)
      setUpcoming(upcomingData)
    } catch {
      setError('We could not confirm that delivery. Try again soon.')
    }
  }

  if (loading) {
    return <p>Loading your meal schedule...</p>
  }

  if (error) {
    return <p style={{ color: '#ff6b6b' }}>{error}</p>
  }

  return (
    <div className="dual-columns">
      <div className="card">
        <h3>Today&apos;s meals</h3>
        {today.length === 0 && <p className="empty-state">No meals scheduled today.</p>}
        {today.map((assignment) => (
          <div key={assignment.id} className="meal-item">
            <div className="meal-info">
              <strong>{assignment.meal?.name}</strong>
              <span className="meal-meta">
                {assignment.meal?.meal_type} • {assignment.meal?.calories} kcal
              </span>
            </div>
            <div className="inline-actions">
              <span
                className={`badge ${assignment.delivery_status === 'DELIVERED' ? 'success' : 'neutral'}`}
              >
                {assignment.delivery_status}
              </span>
              {assignment.delivery_status !== 'DELIVERED' && (
                <button className="btn-ghost" onClick={() => confirmDelivery(assignment.id)}>
                  Confirm
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Upcoming meals</h3>
          <div>
            <label style={{ fontSize: '0.85rem', marginRight: '0.5rem' }}>{days} days</label>
            <input
              type="range"
              min={3}
              max={30}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </div>
        </div>

        {groupedUpcoming.length === 0 && (
          <p className="empty-state">No assignments in the selected window.</p>
        )}

        {groupedUpcoming.map(([date, assignments]) => (
          <div key={date} style={{ marginBottom: '1.25rem' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{date}</p>
            {assignments.map((assignment) => (
              <div key={assignment.id} className="meal-item">
                <div className="meal-info">
                  <strong>{assignment.meal?.name}</strong>
                  <span className="meal-meta">
                    {assignment.meal?.meal_type} • {assignment.meal?.calories} kcal
                  </span>
                  <small className="meal-meta">
                    Macros: {assignment.meal?.protein_g ?? 0}P / {assignment.meal?.carbs_g ?? 0}C /{' '}
                    {assignment.meal?.fats_g ?? 0}F
                  </small>
                </div>
                <span className={`badge ${assignment.delivery_status === 'DELIVERED' ? 'success' : 'neutral'}`}>
                  {assignment.delivery_status}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserMeals

