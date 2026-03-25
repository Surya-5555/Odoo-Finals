import * as React from 'react'

import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Summary = {
	counts: {
		contacts: number
		products: number
		recurringPlans: number
	}
	subscriptionsByState: Record<string, number>
	invoicesByState: Record<string, number>
	revenue: {
		paid: number
	}
}

function MetricCard(props: { title: string; value: React.ReactNode; desc?: string }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{props.title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-1">
				<div className="text-3xl font-semibold">{props.value}</div>
				{props.desc ? <div className="text-sm text-muted-foreground">{props.desc}</div> : null}
			</CardContent>
		</Card>
	)
}

export function ReportingPage() {
	const [data, setData] = React.useState<Summary | null>(null)
	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)

	React.useEffect(() => {
		let cancelled = false
		async function load() {
			setLoading(true)
			setError(null)
			try {
				const res = await api.get<Summary>('/reports/summary')
				if (!cancelled) setData(res)
			} catch (e: any) {
				if (!cancelled) setError(e?.message ?? 'Failed to load reporting summary')
			} finally {
				if (!cancelled) setLoading(false)
			}
		}
		void load()
		return () => {
			cancelled = true
		}
	}, [])

	return (
		<div className="space-y-4">
			<div>
				<div className="text-2xl font-semibold tracking-tight">Reporting</div>
				<div className="mt-1 text-sm text-muted-foreground">Live system summary (counts + revenue).</div>
			</div>

			{loading ? <div className="text-sm text-muted-foreground">Loading…</div> : null}
			{error ? <div className="text-sm text-red-300">{error}</div> : null}

			{data ? (
				<>
					<div className="grid gap-4 md:grid-cols-3">
						<MetricCard title="Contacts" value={data.counts.contacts} />
						<MetricCard title="Products" value={data.counts.products} />
						<MetricCard title="Recurring Plans" value={data.counts.recurringPlans} />
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Subscriptions by state</CardTitle>
							</CardHeader>
							<CardContent className="space-y-1 text-sm">
								{Object.entries(data.subscriptionsByState).length ? (
									Object.entries(data.subscriptionsByState).map(([k, v]) => (
										<div key={k} className="flex items-center justify-between">
											<span className="text-muted-foreground">{k}</span>
											<span className="font-medium">{v}</span>
										</div>
									))
								) : (
									<div className="text-muted-foreground">No subscriptions yet.</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Invoices</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 text-sm">
								<div className="space-y-1">
									{Object.entries(data.invoicesByState).length ? (
										Object.entries(data.invoicesByState).map(([k, v]) => (
											<div key={k} className="flex items-center justify-between">
												<span className="text-muted-foreground">{k}</span>
												<span className="font-medium">{v}</span>
											</div>
										))
									) : (
										<div className="text-muted-foreground">No invoices yet.</div>
									)}
								</div>

								<div className="border-t border-border/60 pt-2">
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">Paid revenue</span>
										<span className="font-medium">₹ {data.revenue.paid.toFixed(2)}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</>
			) : null}
		</div>
	)
}
