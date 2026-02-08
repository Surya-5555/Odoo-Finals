import * as React from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { API_BASE_URL } from '@/lib/constants'

export function ForgotPasswordPage() {
	const navigate = useNavigate()
	const [email, setEmail] = React.useState('')
	const [isLoading, setIsLoading] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)
	const [success, setSuccess] = React.useState<string | null>(null)
	const [devToken, setDevToken] = React.useState<string | null>(null)

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setSuccess(null)
		setDevToken(null)
		setIsLoading(true)

		try {
			const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ email }),
			})

			const data = (await res.json().catch(() => ({}))) as { message?: string; token?: string }
			if (!res.ok) {
				if (res.status === 429) throw new Error('Too many requests')
				throw new Error(data.message || 'Request failed')
			}

			setSuccess(data.message || 'If an account exists, a reset link has been sent.')
			if (data.token) setDevToken(data.token)
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Something went wrong')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
			<div className="w-full max-w-md rounded-2xl border border-border bg-card/20 backdrop-blur-sm p-7">
				<div className="text-2xl font-bold mb-6 font-handwriting">Forgot Password</div>
				<form
					onSubmit={onSubmit}
					className="space-y-5"
				>
					<div className="space-y-2">
						<Label htmlFor="email">Email Id</Label>
						<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
					</div>

					{error && <div className="text-sm text-red-300">{error}</div>}
					{success && <div className="text-sm text-green-300">{success}</div>}

					{devToken && (
						<div className="rounded-lg border border-border p-3 bg-muted/10">
							<div className="text-xs text-muted-foreground mb-2">Dev token (non-production only)</div>
							<div className="text-xs break-all">{devToken}</div>
							<button
								type="button"
								className="mt-3 text-sm text-primary hover:underline"
								onClick={() => navigate(`/reset-password?token=${encodeURIComponent(devToken)}`)}
							>
								Continue to reset password
							</button>
						</div>
					)}
					<Button type="submit" className="w-full" size="lg">
						{isLoading ? 'Sending…' : 'Submit'}
					</Button>
					<button type="button" className="text-sm text-muted-foreground hover:underline" onClick={() => navigate('/login')}>
						Back to login
					</button>
				</form>
			</div>
		</div>
	)
}

