import { Link } from 'react-router-dom'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function ConfigCard(props: { title: string; desc: string; to?: string }) {
	const inner = (
		<Card className="transition-colors hover:bg-muted/10">
			<CardHeader>
				<CardTitle>{props.title}</CardTitle>
			</CardHeader>
			<CardContent className="text-sm text-muted-foreground">{props.desc}</CardContent>
		</Card>
	)
	return props.to ? <Link to={props.to}>{inner}</Link> : inner
}

export function ConfigurationPage() {
	return (
		<div className="space-y-4">
			<div>
				<div className="text-2xl font-semibold tracking-tight">Configuration</div>
				<div className="mt-1 text-sm text-muted-foreground">Master data and settings (aligned to Excalidraw variants/config).</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<ConfigCard title="Recurring Plans" desc="Billing cycles and default prices." to="/app/recurring-plans" />
				<ConfigCard title="Payment Terms" desc="Due terms + early discounts." to="/app/payment-terms" />
				<ConfigCard title="Quotation Templates" desc="Reusable quotation content." to="/app/quotation-templates" />
				<ConfigCard title="Taxes" desc="Tax rates used in subscription/invoice lines." to="/app/taxes" />
				<ConfigCard title="Discounts" desc="Discount codes, active periods, and portal validation." to="/app/discounts" />
			</div>
		</div>
	)
}
