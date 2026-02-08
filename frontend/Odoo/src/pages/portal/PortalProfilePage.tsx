import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function PortalProfilePage() {
	const { user } = useAuth()
	return (
		<Card className="max-w-2xl">
			<CardHeader>
				<CardTitle>My Profile</CardTitle>
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
	)
}
