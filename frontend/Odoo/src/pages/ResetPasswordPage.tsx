import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { API_BASE_URL } from '@/lib/constants'

export function ResetPasswordPage() {
	const navigate = useNavigate()
	const [params] = useSearchParams()
	const tokenFromQuery = params.get('token') ?? ''

	const [token, setToken] = React.useState(tokenFromQuery)
	const [newPassword, setNewPassword] = React.useState('')
	const [confirmNewPassword, setConfirmNewPassword] = React.useState('')
	const [isLoading, setIsLoading] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)
	const [success, setSuccess] = React.useState<string | null>(null)

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setSuccess(null)

		if (!token.trim()) {
			setError('Token is required')
			return
		}
		if (newPassword !== confirmNewPassword) {
			setError('Passwords do not match')
			return
		}

		setIsLoading(true)
		try {
			const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ token, newPassword, confirmNewPassword }),
			})

			const data = (await res.json().catch(() => ({}))) as { message?: string }
			if (!res.ok) {
				if (res.status === 429) throw new Error('Too many requests')
				throw new Error(data.message || 'Reset failed')
			}

			setSuccess(data.message || 'Password updated. You can log in now.')
			window.setTimeout(() => navigate('/login', { replace: true }), 800)
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Something went wrong')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
			<div className="w-full max-w-md rounded-2xl border border-border bg-card/20 backdrop-blur-sm p-7">
				<div className="text-2xl font-bold mb-6 font-handwriting">Reset Password</div>
				<form
					onSubmit={onSubmit}
					className="space-y-5"
				>
					<div className="space-y-2">
						<Label htmlFor="token">Reset Token</Label>
						<Input id="token" value={token} onChange={(e) => setToken(e.target.value)} required />
					</div>
					<div className="space-y-2">
						<Label htmlFor="newPassword">New Password</Label>
						<Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
					</div>
					<div className="space-y-2">
						<Label htmlFor="confirmNewPassword">Re-enter Password</Label>
						<Input
							id="confirmNewPassword"
							type="password"
							value={confirmNewPassword}
							onChange={(e) => setConfirmNewPassword(e.target.value)}
							required
						/>
					</div>

					{error && <div className="text-sm text-red-300">{error}</div>}
					{success && <div className="text-sm text-green-300">{success}</div>}
					<Button type="submit" className="w-full" size="lg">
						{isLoading ? 'Updating…' : 'Submit'}
					</Button>
					<button type="button" className="text-sm text-muted-foreground hover:underline" onClick={() => navigate('/login')}>
						Back to login
					</button>
				</form>
			</div>
		</div>
	)
}

