import { useEffect, useState } from 'react'

import { subscriptionApi } from '../../services/api.js'

function UserSubscriptions() {
  const [plans, setPlans] = useState([])
  const [current, setCurrent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionPlan, setActionPlan] = useState(null)
  const [error, setError] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const [planList, currentPlan] = await Promise.all([
        subscriptionApi.listPlans(),
        subscriptionApi.current(),
      ])
      setPlans(planList)
      setCurrent(currentPlan)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to fetch subscription data.')
    } finally {
      setLoading(false)
      setActionPlan(null)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubscribe = async (planId) => {
    setActionPlan(planId)
    try {
      await subscriptionApi.subscribe(planId)
      await loadData()
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to create subscription.')
    }
  }

  if (loading) {
    return <p>Loading plans...</p>
  }

  if (error) {
    return <p style={{ color: '#ff6b6b' }}>{error}</p>
  }

  return (
    <div>
      {current ? (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3>Current plan</h3>
          <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>{current.plan.name}</p>
          <p className="meal-meta">
            {current.plan.duration_days} days • ${current.plan.price_per_day}/day
          </p>
          <p>
            Active until {current.end_date} · Status <strong>{current.status}</strong>
          </p>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3>No active plan</h3>
          <p>Choose a subscription below to start receiving curated meals.</p>
        </div>
      )}

      <div className="grid-two">
        {plans.map((plan) => (
          <div key={plan.id} className="card">
            <p className="badge neutral" style={{ alignSelf: 'flex-start' }}>
              {plan.duration_days} days
            </p>
            <h3>{plan.name}</h3>
            <p>{plan.description}</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 700 }}>
              ${(plan.price_per_day * plan.duration_days).toFixed(2)}
              <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}> total</span>
            </p>
            <button
              className="btn-primary"
              disabled={Boolean(current && current.plan.id === plan.id) || actionPlan === plan.id}
              onClick={() => handleSubscribe(plan.id)}
            >
              {current && current.plan.id === plan.id
                ? 'Active Plan'
                : actionPlan === plan.id
                ? 'Subscribing...'
                : 'Choose plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserSubscriptions

