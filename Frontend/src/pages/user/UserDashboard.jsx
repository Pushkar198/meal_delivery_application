import { useEffect, useState } from 'react'

import { mealApi, subscriptionApi, userApi } from '../../services/api.js'

function UserDashboard() {
  const [profile, setProfile] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [todayMeals, setTodayMeals] = useState([])
  const [upcomingMeals, setUpcomingMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [profileData, subscriptionData, todays, upcoming] = await Promise.all([
          userApi.getProfile(),
          subscriptionApi.current(),
          mealApi.today(),
          mealApi.upcoming(5),
        ])
        setProfile(profileData)
        setSubscription(subscriptionData)
        setTodayMeals(todays)
        setUpcomingMeals(upcoming)
      } catch (err) {
        setError(err?.response?.data?.detail || 'Unable to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const confirmDelivery = async (assignmentId) => {
    try {
      await mealApi.confirmDelivery(assignmentId)
      const [todays, upcoming] = await Promise.all([mealApi.today(), mealApi.upcoming(5)])
      setTodayMeals(todays)
      setUpcomingMeals(upcoming)
    } catch {
      setError('Failed to confirm delivery, please retry.')
    }
  }

  if (loading) {
    return <p>Loading your personalized plan...</p>
  }

  if (error) {
    return <p style={{ color: '#ff6b6b' }}>{error}</p>
  }

  const stats = [
    { label: 'Meals today', value: todayMeals.length },
    { label: 'Upcoming', value: upcomingMeals.length },
    {
      label: 'Subscription',
      value: subscription ? subscription.plan.name : 'No plan',
    },
    {
      label: 'Goals tracked',
      value: profile?.health_goals ? 1 : 0,
    },
  ]

  const renderMeal = (assignment) => (
    <div key={assignment.id} className="meal-item">
      <div className="meal-info">
        <strong>{assignment.meal?.name || 'Meal'}</strong>
        <span className="meal-meta">
          {assignment.meal?.meal_type} • {assignment.meal?.calories} kcal
        </span>
        <small className="meal-meta">{assignment.assignment_date}</small>
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
  )

  return (
    <div>
      <div className="stat-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <p className="stat-value">{stat.value}</p>
            <p className="stat-label">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid-two">
        <div className="card">
          <h3>Today’s Meals</h3>
          {todayMeals.length === 0 && <p className="empty-state">No meals scheduled today.</p>}
          {todayMeals.map(renderMeal)}
        </div>

        <div className="card">
          <h3>Your Subscription</h3>
          {subscription ? (
            <>
              <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{subscription.plan.name}</p>
              <p className="meal-meta">
                Active until {subscription.end_date} · {subscription.plan.duration_days} days
              </p>
              <hr className="list-divider" />
              <p>{subscription.plan.description}</p>
            </>
          ) : (
            <p>
              No active plan yet. Head to the subscriptions tab to explore curated plans tailored to
              your goals.
            </p>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>Upcoming Meals</h3>
        {upcomingMeals.length === 0 && (
          <p className="empty-state">No meals scheduled for the upcoming days.</p>
        )}
        {upcomingMeals.slice(0, 5).map((assignment) => renderMeal(assignment))}
      </div>
    </div>
  )
}

export default UserDashboard

