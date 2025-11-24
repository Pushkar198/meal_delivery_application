import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import {
  apiClient,
  refreshTokens as refreshTokensRequest,
  setAuthHeader,
} from '../services/api.js'

const AuthContext = createContext(null)
const STORAGE_KEY = 'cirota.auth'

const loadStoredSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const initialSession = useMemo(() => loadStoredSession(), [])
  const [session, setSession] = useState(initialSession)
  const [user, setUser] = useState(initialSession?.user ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (session?.tokens?.accessToken) {
      setAuthHeader(session.tokens.accessToken)
    } else {
      setAuthHeader(null)
    }
  }, [session?.tokens?.accessToken])

  const validateSession = useCallback(async () => {
    if (!session?.tokens?.accessToken) return
    setLoading(true)
    try {
      const { data } = await apiClient.get('/api/auth/me')
      setUser(data)
      persistSession({ ...session, user: data })
    } catch {
      if (session?.tokens?.refreshToken) {
        try {
          const tokens = await refreshTokensRequest(session.tokens.refreshToken)
          setAuthHeader(tokens.accessToken)
          const me = await apiClient.get('/api/auth/me')
          setUser(me.data)
          persistSession({ user: me.data, tokens })
          return
        } catch {
          logout()
        }
      } else {
        logout()
      }
    } finally {
      setLoading(false)
    }
  }, [logout, persistSession, session])

  useEffect(() => {
    if (session?.tokens && !user) {
      validateSession()
    }
  }, [session?.tokens, user, validateSession])

  const persistSession = useCallback(
    (nextSession) => {
      setSession(nextSession)
      if (nextSession) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    },
    [setSession],
  )

  const logout = useCallback(() => {
    setUser(null)
    setError(null)
    persistSession(null)
    setAuthHeader(null)
  }, [persistSession])

  const login = useCallback(
    async (googleToken) => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await apiClient.post('/api/auth/google', {
          google_token: googleToken,
        })
        const tokens = {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
        }
        setAuthHeader(tokens.accessToken)
        const payload = { user: data.user, tokens }
        persistSession(payload)
        setUser(data.user)
        return data.user
      } catch (err) {
        setError(err?.response?.data?.detail || 'Unable to sign in')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [persistSession],
  )

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user?.id),
      isAdmin: Boolean(user?.is_admin),
      tokens: session?.tokens ?? null,
      loading,
      error,
      login,
      logout,
      refreshSession: validateSession,
    }),
    [error, loading, login, logout, session?.tokens, user, validateSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/* eslint-disable-next-line react-refresh/only-export-components */
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

