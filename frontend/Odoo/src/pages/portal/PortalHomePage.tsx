import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function PortalHomePage() {
	return (
		<div className="space-y-6">
			<div className="rounded-3xl border border-border/60 bg-card/20 p-8">
				<div className="text-3xl font-semibold tracking-tight">Home</div>
				<div className="mt-2 max-w-2xl text-sm text-muted-foreground">
					Manage your subscription purchases, update your details, and track invoices — all in one place.
				</div>
				<div className="mt-5 flex flex-wrap gap-2">
					<Link to="/portal/shop">
						<Button>Go to Shop</Button>
					</Link>
					<Link to="/portal/orders">
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40">My Orders</Button>
					</Link>
					<Link to="/portal/account/user-details">
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40">User Details</Button>
					</Link>
				</div>
			</div>
		</div>
	)
}
