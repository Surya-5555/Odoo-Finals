import * as React from 'react'

export type AuthUser = {
	id: number
	name: string
	email: string
	role: 'ADMIN' | 'PORTAL' | 'INTERNAL'
}

type AuthContextValue = {
	accessToken: string | null
	user: AuthUser | null
	login: (accessToken: string, user?: AuthUser | null, remember?: boolean) => void
	logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

const ACCESS_TOKEN_KEY = 'odoo_access_token'
const USER_KEY = 'odoo_user'

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

	const login = React.useCallback((token: string, nextUser?: AuthUser | null, remember = true) => {
		setAccessToken(token)
		setUser(nextUser ?? null)
		if (remember) {
			localStorage.setItem(ACCESS_TOKEN_KEY, token)
			if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
			else localStorage.removeItem(USER_KEY)
		} else {
			localStorage.removeItem(ACCESS_TOKEN_KEY)
			localStorage.removeItem(USER_KEY)
		}
	}, [])

	const logout = React.useCallback(() => {
		setAccessToken(null)
		setUser(null)
		localStorage.removeItem(ACCESS_TOKEN_KEY)
		localStorage.removeItem(USER_KEY)
	}, [])

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

	const value = React.useMemo<AuthContextValue>(
		() => ({ accessToken, user, login, logout }),
		[accessToken, user, login, logout],
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
	const ctx = React.useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within AuthProvider')
	return ctx
}

