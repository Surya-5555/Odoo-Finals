import { Link, useSearchParams } from 'react-router-dom'
import { BadgeCheck } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function PortalOrderSuccessPage() {
	const [sp] = useSearchParams()
	const subscriptionId = sp.get('subscriptionId')

	return (
		<Card className="max-w-2xl">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BadgeCheck className="size-5 text-emerald-400" />
					Order placed
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="text-sm text-muted-foreground">Your subscription order has been created successfully.</div>
				{subscriptionId ? (
					<div className="text-sm">Subscription ID: <span className="font-medium">{subscriptionId}</span></div>
				) : null}
				<div className="flex flex-wrap gap-2">
					<Link to="/portal/shop">
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40">Continue shopping</Button>
					</Link>
					{subscriptionId ? (
						<Link to={`/portal/orders/${subscriptionId}`}>
							<Button>Open order</Button>
						</Link>
					) : null}
				</div>
			</CardContent>
		</Card>
	)
}
