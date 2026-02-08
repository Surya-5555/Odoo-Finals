import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

export function DashboardPage() {
	const navigate = useNavigate()
	const { user, logout } = useAuth()

	return (
		<div className="min-h-screen bg-background text-foreground p-8">
			<div className="max-w-4xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<div className="text-2xl font-semibold">Dashboard</div>
						<div className="text-sm text-muted-foreground">{user ? `Signed in as ${user.email}` : 'Signed in'}</div>
					</div>
					<div className="flex gap-2">
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={() => navigate('/login')}>
							Go Login
						</Button>
						<Button className="bg-destructive hover:brightness-110" onClick={() => logout()}>
							Logout
						</Button>
					</div>
				</div>

				<div className="rounded-2xl border border-border bg-card/20 backdrop-blur-sm p-6">
					This is a placeholder dashboard page.
				</div>
			</div>
		</div>
	)
}

