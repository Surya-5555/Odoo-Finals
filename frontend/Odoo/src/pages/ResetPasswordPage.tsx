import React from 'react'
import { Eye, EyeOff } from 'lucide-react'
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
  const [show, setShow] = React.useState(false)

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
        if (res.status === 429) {
          throw new Error('Too many requests')
        }
        throw new Error(data.message || 'Reset failed')
      }

      setSuccess(data.message || 'Password updated. You can log in now.')
      setTimeout(() => navigate('/login'), 800)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 font-handwriting">Reset Password</h1>
        <p className="text-sm text-muted-foreground mb-8">Enter your reset token and choose a new password.</p>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="token">Token</Label>
            <Input
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your reset token"
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={show ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="h-12 pr-10"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmNewPassword"
                type={show ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className="h-12 pr-10"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && <div className="text-sm text-red-300">{error}</div>}
          {success && <div className="text-sm text-green-300">{success}</div>}

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Reset password'}
          </Button>

          <button type="button" className="text-sm text-muted-foreground hover:underline" onClick={() => navigate('/login')}>
            Back to login
          </button>
        </form>
      </div>
    </div>
  )
}
