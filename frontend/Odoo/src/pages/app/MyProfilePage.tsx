import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function MyProfilePage() {
	const { user } = useAuth()
	return (
		<div className="space-y-4">
			<div>
				<div className="text-2xl font-semibold tracking-tight">My Profile</div>
				<div className="mt-1 text-sm text-muted-foreground">Top-nav item from Excalidraw.</div>
			</div>
			<Card className="max-w-2xl">
				<CardHeader>
					<CardTitle>Account</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-sm">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Name</span>
						<span>{user?.name ?? '—'}</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Email</span>
						<span>{user?.email ?? '—'}</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Role</span>
						<span>{user?.role ?? '—'}</span>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
