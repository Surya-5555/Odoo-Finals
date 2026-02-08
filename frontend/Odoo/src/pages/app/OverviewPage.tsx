import { ArrowRight, Repeat, ScrollText, Package, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const tiles = [
	{
		title: 'Recurring Plans',
		description: 'Create plans, prices, billing periods, and flags.',
		to: '/app/recurring-plans',
		icon: <Repeat className="size-4" />,
	},
	{
		title: 'Products',
		description: 'Manage sellable products and pricing.',
		to: '/app/products',
		icon: <Package className="size-4" />,
	},
	{
		title: 'Subscriptions',
		description: 'Quotation → confirm → invoice → renew/close.',
		to: '/app/subscriptions',
		icon: <ScrollText className="size-4" />,
	},
	{
		title: 'Invoices',
		description: 'Draft, confirm and mark invoices paid.',
		to: '/app/invoices',
		icon: <CreditCard className="size-4" />,
	},
]

export function OverviewPage() {
	return (
		<div className="space-y-6">
			<div>
				<div className="text-2xl font-semibold tracking-tight">Overview</div>
				<div className="mt-1 text-sm text-muted-foreground">Phase 1 (Core): plans → subscriptions → invoices.</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{tiles.map((t) => (
					<Link key={t.to} to={t.to} className="group">
						<Card className="h-full hover:bg-card/40 transition-colors">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<span className="grid size-8 place-items-center rounded-xl bg-primary/15 border border-primary/20 text-primary">
										{t.icon}
									</span>
									{t.title}
								</CardTitle>
								<CardDescription>{t.description}</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="inline-flex items-center text-sm text-primary">
									Open <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</div>
	)
}
