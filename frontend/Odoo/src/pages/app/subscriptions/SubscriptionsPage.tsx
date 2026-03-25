import * as React from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'

import { api } from '@/lib/api'
import type { ListResponse, Subscription, SubscriptionState } from '@/pages/app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { formatDate, SubscriptionStateBadge } from '@/pages/app/ui'
import { PageHeader } from '@/components/odoo/PageHeader'

export function SubscriptionsPage() {
	const [data, setData] = React.useState<ListResponse<Subscription> | null>(null)
	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)
	const [stateFilter, setStateFilter] = React.useState<SubscriptionState | ''>('')

	async function load(nextState?: SubscriptionState | '') {
		setLoading(true)
		setError(null)
		try {
			const res = await api.get<ListResponse<Subscription>>('/subscriptions', {
				state: (nextState ?? stateFilter) || undefined,
			})
			setData(res)
		} catch (e: any) {
			setError(e?.message ?? 'Failed to load')
		} finally {
			setLoading(false)
		}
	}

	React.useEffect(() => {
		void load()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<div className="space-y-4">
			<PageHeader
				title="Subscriptions"
				subtitle="Create, send, confirm, renew, and invoice."
				actions={
					<>
						<select
							className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
							value={stateFilter}
							onChange={(e) => {
								const v = e.target.value as SubscriptionState | ''
								setStateFilter(v)
								void load(v)
							}}
						>
							<option value="">All states</option>
							<option value="DRAFT">Draft</option>
							<option value="QUOTATION_SENT">Quotation sent</option>
							<option value="CONFIRMED">Confirmed</option>
							<option value="PAUSED">Paused</option>
							<option value="CLOSED">Closed</option>
							<option value="CHURNED">Churned</option>
						</select>
						<Link to="/app/subscriptions/new">
							<Button>
								<Plus className="mr-2 size-4" />
								New
							</Button>
						</Link>
					</>
				}
			/>

			<Card>
				<CardHeader>
					<CardTitle>All subscriptions</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="text-sm text-muted-foreground">Loading…</div>
					) : error ? (
						<div className="text-sm text-red-300">{error}</div>
					) : !data?.data?.length ? (
						<div className="text-sm text-muted-foreground">No subscriptions yet.</div>
					) : (
						<Table>
							<THead>
								<TR>
									<TH>Number</TH>
									<TH>Customer</TH>
									<TH>Plan</TH>
									<TH>State</TH>
									<TH>Start</TH>
									<TH>Next invoice</TH>
								</TR>
							</THead>
							<TBody>
								{data.data.map((s) => (
									<TR key={s.id}>
										<TD>
											<Link className="font-medium hover:underline" to={`/app/subscriptions/${s.id}`}>
												{s.number}
											</Link>
										</TD>
										<TD className="text-muted-foreground">{s.contact?.name ?? '—'}</TD>
										<TD className="text-muted-foreground">{s.recurringPlan?.name ?? '—'}</TD>
										<TD>
											<SubscriptionStateBadge state={s.state} />
										</TD>
										<TD className="text-muted-foreground">{formatDate(s.startDate)}</TD>
										<TD className="text-muted-foreground">{formatDate(s.nextInvoiceDate)}</TD>
									</TR>
								))}
							</TBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
