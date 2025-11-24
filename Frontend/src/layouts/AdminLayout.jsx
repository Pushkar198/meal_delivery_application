import { NavLink, Outlet } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'

const adminNav = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Meals', to: '/admin/meals' },
  { label: 'Complaints', to: '/admin/complaints' },
  { label: 'Customers', to: '/admin/customers' },
]

const initialsFromName = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

function AdminLayout() {
  const { user, logout } = useAuth()
  const initials = initialsFromName(user?.name || 'Admin')

  return (
    <div className="layout">
      <header className="layout-header">
        <div>
          <p style={{ margin: 0, opacity: 0.8 }}>Admin Portal • Operations Command</p>
          <h1 className="layout-title">Welcome back, {user?.name?.split(' ')[0] || 'Admin'}</h1>
          <p style={{ margin: 0 }}>Monitor nutrition operations, customers, and meal quality.</p>
        </div>
        <div className="profile-chip">
          <span className="avatar">{initials}</span>
          <div style={{ lineHeight: 1 }}>
            <span>{user?.name}</span>
            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Admin</div>
          </div>
          <button className="btn-outline" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="layout-body">
        <nav className="nav-tabs">
          {adminNav.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : undefined)} end={item.to === '/admin'}>
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

export default AdminLayout

