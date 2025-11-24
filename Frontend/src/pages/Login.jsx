import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import '../App.css'
import { useAuth } from '../context/AuthContext.jsx'

function LoginPage() {
  const [portal, setPortal] = useState('user')
  const [googleToken, setGoogleToken] = useState('')
  const [helperMessage, setHelperMessage] = useState('')
  const navigate = useNavigate()
  const { login, loading, error, isAuthenticated, isAdmin } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/user', { replace: true })
    }
  }, [isAdmin, isAuthenticated, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!googleToken.trim()) {
      setHelperMessage('Paste your Google ID token to continue.')
      return
    }
    try {
      const user = await login(googleToken.trim())
      if (portal === 'admin' && !user.is_admin) {
        setHelperMessage('This account is not marked as admin. Please choose the user portal.')
        return
      }
      navigate(portal === 'admin' ? '/admin' : '/user', { replace: true })
    } catch {
      /* error surfaced via context */
    }
  }

  return (
    <div className="app-shell">
      <div className="shell-content">
        <section className="gradient-panel">
          <h1>CIROTA • VitalPlate</h1>
          <p>Unified experience for nutrition lovers and operators.</p>
          <p style={{ marginTop: '1rem', fontSize: '0.95rem', opacity: 0.85 }}>
            Paste a Google ID token issued for your configured OAuth client. We’ll create the account on the fly and
            route you to the right portal.
          </p>
        </section>

        <section className="auth-card">
          <div className="portal-toggle">
            <button type="button" className={portal === 'user' ? 'active' : ''} onClick={() => setPortal('user')}>
              👤 User Portal
            </button>
            <button type="button" className={portal === 'admin' ? 'active' : ''} onClick={() => setPortal('admin')}>
              🛡️ Admin Portal
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-control">
              <label className="input-label" htmlFor="token">
                Google ID Token
              </label>
              <textarea
                id="token"
                className="textarea-field"
                rows={4}
                value={googleToken}
                placeholder="ya29.a0AfH6S..."
                onChange={(e) => setGoogleToken(e.target.value)}
              />
            </div>

            {(helperMessage || error) && (
              <p style={{ color: '#ff6b6b', marginTop: 0 }}>{helperMessage || error}</p>
            )}

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : `Enter ${portal === 'admin' ? 'Admin' : 'User'} Portal`}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', color: 'var(--text-gray)' }}>
            Need a token? Hit the backend `/api/auth/google` from Postman to generate one with your OAuth credentials.
          </p>
        </section>
      </div>
    </div>
  )
}

export default LoginPage

