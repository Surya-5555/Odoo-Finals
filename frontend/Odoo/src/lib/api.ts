type ApiErrorBody = {
	message?: string | string[]
	error?: string
	statusCode?: number
}

export class ApiError extends Error {
	status: number
	body?: unknown

	constructor(message: string, status: number, body?: unknown) {
		super(message)
		this.name = 'ApiError'
		this.status = status
		this.body = body
	}
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? ''

const ACCESS_TOKEN_KEY = 'odoo_access_token'
const USER_KEY = 'odoo_user'

function getAccessToken(): string | null {
	try {
		return localStorage.getItem(ACCESS_TOKEN_KEY)
	} catch {
		return null
	}
}

function handleUnauthorized() {
	try {
		localStorage.removeItem(ACCESS_TOKEN_KEY)
		localStorage.removeItem(USER_KEY)
	} catch {
		// ignore
	}
	try {
		window.dispatchEvent(new Event('odoo:auth:logout'))
	} catch {
		// ignore
	}
}

function setAccessToken(token: string) {
	try {
		localStorage.setItem(ACCESS_TOKEN_KEY, token)
	} catch {
		// ignore
	}
	try {
		window.dispatchEvent(new CustomEvent('odoo:auth:token', { detail: { accessToken: token } }))
	} catch {
		// ignore
	}
}

async function tryRefreshAccessToken(): Promise<string | null> {
	try {
		const res = await fetch(buildUrl('/auth/refresh'), {
			method: 'POST',
		})
		if (!res.ok) return null
		const data = (await res.json()) as { accessToken?: string }
		if (!data?.accessToken) return null
		setAccessToken(data.accessToken)
		return data.accessToken
	} catch {
		return null
	}
}

function buildUrl(path: string, query?: Record<string, string | number | boolean | undefined | null>) {
	const url = new URL(`${API_BASE_URL}${path}`, window.location.origin)
	if (query) {
		for (const [k, v] of Object.entries(query)) {
			if (v === undefined || v === null) continue
			url.searchParams.set(k, String(v))
		}
	}
	return url.pathname + url.search
}

async function parseErrorBody(res: Response): Promise<unknown> {
	const contentType = res.headers.get('content-type') ?? ''
	if (contentType.includes('application/json')) {
		try {
			return (await res.json()) as unknown
		} catch {
			return undefined
		}
	}
	try {
		return await res.text()
	} catch {
		return undefined
	}
}

function toErrorMessage(body: unknown, fallback: string) {
	if (!body) return fallback
	if (typeof body === 'string') return body
	if (typeof body === 'object') {
		const b = body as ApiErrorBody
		if (Array.isArray(b.message)) return b.message.join(', ')
		if (typeof b.message === 'string') return b.message
		if (typeof b.error === 'string') return b.error
	}
	return fallback
}

export async function apiFetch<T>(
	path: string,
	init?: RequestInit & { query?: Record<string, string | number | boolean | undefined | null> },
): Promise<T> {
	const url = buildUrl(path, init?.query)
	const token = getAccessToken()
	const res = await fetch(url, {
		...init,
		headers: {
			...(init?.headers ?? {}),
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
	})

	if (res.status === 401) {
		// Access token likely expired; try refresh (once) and retry original request.
		const newToken = await tryRefreshAccessToken()
		if (newToken) {
			const retryRes = await fetch(url, {
				...init,
				headers: {
					...(init?.headers ?? {}),
					Authorization: `Bearer ${newToken}`,
				},
			})

			if (!retryRes.ok) {
				const body = await parseErrorBody(retryRes)
				if (retryRes.status === 401) handleUnauthorized()
				throw new ApiError(
					toErrorMessage(body, `Request failed (${retryRes.status})`),
					retryRes.status,
					body,
				)
			}

			const contentType = retryRes.headers.get('content-type') ?? ''
			if (!contentType.includes('application/json')) {
				return (undefined as unknown) as T
			}
			return (await retryRes.json()) as T
		}

		handleUnauthorized()
		const body = await parseErrorBody(res)
		throw new ApiError(toErrorMessage(body, `Request failed (${res.status})`), res.status, body)
	}

	if (!res.ok) {
		const body = await parseErrorBody(res)
		throw new ApiError(toErrorMessage(body, `Request failed (${res.status})`), res.status, body)
	}

	const contentType = res.headers.get('content-type') ?? ''
	if (!contentType.includes('application/json')) {
		return (undefined as unknown) as T
	}
	return (await res.json()) as T
}

export const api = {
	get: <T>(path: string, query?: Record<string, string | number | boolean | undefined | null>) =>
		apiFetch<T>(path, { method: 'GET', query }),
	post: <T>(path: string, body?: unknown) =>
		apiFetch<T>(path, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: body === undefined ? undefined : JSON.stringify(body),
		}),
	patch: <T>(path: string, body?: unknown) =>
		apiFetch<T>(path, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: body === undefined ? undefined : JSON.stringify(body),
		}),
	delete: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
}

