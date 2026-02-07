import * as React from 'react'

import { API_BASE_URL } from '@/lib/constants'

type AuthContextValue = {
  accessToken: string | null
  login: (token: string, remember?: boolean) => void
  logout: () => Promise<void>
}

const REMEMBER_KEY = 'auth:remember'
const SESSION_KEY = 'auth:session'

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isMounted = true

    const run = async () => {
      const shouldRestore =
        localStorage.getItem(REMEMBER_KEY) === '1' || sessionStorage.getItem(SESSION_KEY) === '1'

      if (!shouldRestore) return

      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!res.ok) return
        const data = (await res.json()) as { accessToken: string }
        if (isMounted) setAccessToken(data.accessToken)
      } catch {
        // ignore refresh failures
      }
    }

    void run()
    return () => {
      isMounted = false
    }
  }, [])

  const login = React.useCallback((token: string, remember = false) => {
    setAccessToken(token)

    if (remember) {
      localStorage.setItem(REMEMBER_KEY, '1')
      sessionStorage.removeItem(SESSION_KEY)
    } else {
      sessionStorage.setItem(SESSION_KEY, '1')
      localStorage.removeItem(REMEMBER_KEY)
    }
  }, [])

  const logout = React.useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
    } catch {
      // ignore logout failures
    } finally {
      localStorage.removeItem(REMEMBER_KEY)
      sessionStorage.removeItem(SESSION_KEY)
      setAccessToken(null)
    }
  }, [])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      accessToken,
      login,
      logout,
    }),
    [accessToken, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
