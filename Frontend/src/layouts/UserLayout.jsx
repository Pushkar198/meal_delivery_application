import { NavLink, Outlet } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'

const userNav = [
  { label: 'Overview', to: '/user' },
  { label: 'Meals', to: '/user/meals' },
  { label: 'Subscriptions', to: '/user/subscriptions' },
  { label: 'Complaints', to: '/user/complaints' },
]

const initialsFromName = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

function UserLayout() {
  const { user, logout } = useAuth()
  const initials = initialsFromName(user?.name || user?.email || 'U')

  return (
    <div className="layout">
      <header className="layout-header">
        <div>
          <p style={{ margin: 0, opacity: 0.8 }}>User Portal • Meal Personalization</p>
          <h1 className="layout-title">Hi {user?.name?.split(' ')[0] || 'there'} 👋</h1>
          <p style={{ margin: 0 }}>Here’s what’s cooking for you today.</p>
        </div>
        <div className="profile-chip">
          <span className="avatar">{initials}</span>
          <div style={{ lineHeight: 1 }}>
            <span>{user?.name}</span>
            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{user?.email}</div>
          </div>
          <button className="btn-outline" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="layout-body">
        <nav className="nav-tabs">
          {userNav.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : undefined)} end={item.to === '/user'}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <section className="content-panel">
          <Outlet />
        </section>
      </main>
    </div>
  )
}

export default UserLayout

