import * as React from 'react'

import { api } from '@/lib/api'

export type AuthUser = {
	id: number
	name: string
	email: string
	role: 'ADMIN' | 'PORTAL' | 'INTERNAL'
}

type AuthContextValue = {
	accessToken: string | null
	user: AuthUser | null
	isMeLoading: boolean
	isMeReady: boolean
	login: (accessToken: string, user?: AuthUser | null, remember?: boolean) => void
	logout: () => void
	refreshMe: (opts?: { force?: boolean }) => Promise<AuthUser | null>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

const ACCESS_TOKEN_KEY = 'odoo_access_token'
const USER_KEY = 'odoo_user'
const LOGOUT_AT_KEY = 'odoo_logout_at'

function clearOdooLocalStorage() {
	try {
		for (let i = localStorage.length - 1; i >= 0; i -= 1) {
			const k = localStorage.key(i)
			if (!k) continue
			if (k.startsWith('odoo_')) localStorage.removeItem(k)
		}
	} catch {
		// ignore
	}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [accessToken, setAccessToken] = React.useState<string | null>(() => {
		return localStorage.getItem(ACCESS_TOKEN_KEY)
	})

	const [user, setUser] = React.useState<AuthUser | null>(() => {
		const raw = localStorage.getItem(USER_KEY)
		if (!raw) return null
		try {
			return JSON.parse(raw) as AuthUser
		} catch {
			return null
		}
	})

	const userRef = React.useRef<AuthUser | null>(user)
	React.useEffect(() => {
		userRef.current = user
	}, [user])

	const [isMeLoading, setIsMeLoading] = React.useState(false)
	const [isMeReady, setIsMeReady] = React.useState(() => !localStorage.getItem(ACCESS_TOKEN_KEY))
	const lastMeSyncAtRef = React.useRef<number>(0)

	const login = React.useCallback((token: string, nextUser?: AuthUser | null, remember = true) => {
		setAccessToken(token)
		setUser(nextUser ?? null)
		setIsMeReady(true)
		if (remember) {
			localStorage.setItem(ACCESS_TOKEN_KEY, token)
			localStorage.removeItem(LOGOUT_AT_KEY)
			if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
			else localStorage.removeItem(USER_KEY)
		} else {
			clearOdooLocalStorage()
		}
	}, [])

	const logout = React.useCallback(() => {
		setAccessToken(null)
		setUser(null)
		setIsMeReady(true)
		clearOdooLocalStorage()
		try {
			localStorage.setItem(LOGOUT_AT_KEY, String(Date.now()))
		} catch {
			// ignore
		}

		// Best-effort server logout to clear refresh cookie.
		// Don't block UI on this.
		void fetch('/auth/logout', {
			method: 'POST',
			credentials: 'include',
		}).catch(() => {
			// ignore
		})
	}, [])

	const refreshMe = React.useCallback(
		async (opts?: { force?: boolean }) => {
			if (!accessToken) return null
			const now = Date.now()
			const force = opts?.force === true
			if (!force && now - lastMeSyncAtRef.current < 10_000) {
				return userRef.current
			}
			setIsMeLoading(true)
			try {
				const me = await api.get<AuthUser>('/users/me')
				setUser(me)
				try {
					localStorage.setItem(USER_KEY, JSON.stringify(me))
				} catch {
					// ignore
				}
				lastMeSyncAtRef.current = now
				return me
			} catch {
				// If refresh fails (401 etc), api layer will trigger odoo:auth:logout.
				return null
			} finally {
				setIsMeLoading(false)
			}
		},
		[accessToken],
	)

	React.useEffect(() => {
		const onLogout = () => logout()
		window.addEventListener('odoo:auth:logout', onLogout)
		return () => window.removeEventListener('odoo:auth:logout', onLogout)
	}, [logout])

	React.useEffect(() => {
		const onToken = (ev: Event) => {
			const detail = (ev as CustomEvent<{ accessToken?: string }>).detail
			if (detail?.accessToken) setAccessToken(detail.accessToken)
		}
		window.addEventListener('odoo:auth:token', onToken)
		return () => window.removeEventListener('odoo:auth:token', onToken)
	}, [])

	// Keep role/user in sync with DB. This allows changing User.role in DB
	// and seeing the correct UI after refresh/focus.
	React.useEffect(() => {
		if (!accessToken) {
			setIsMeReady(true)
			return
		}
		let cancelled = false
		setIsMeReady(false)
		refreshMe({ force: true })
			.catch(() => null)
			.finally(() => {
				if (!cancelled) setIsMeReady(true)
			})
		return () => {
			cancelled = true
		}
	}, [accessToken, refreshMe])

	React.useEffect(() => {
		if (!accessToken) return
		const onFocus = () => refreshMe({ force: true })
		window.addEventListener('focus', onFocus)
		return () => window.removeEventListener('focus', onFocus)
	}, [accessToken, refreshMe])

	const value = React.useMemo<AuthContextValue>(
		() => ({ accessToken, user, isMeLoading, isMeReady, login, logout, refreshMe }),
		[accessToken, user, isMeLoading, isMeReady, login, logout, refreshMe],
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
	const ctx = React.useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within AuthProvider')
	return ctx
}

