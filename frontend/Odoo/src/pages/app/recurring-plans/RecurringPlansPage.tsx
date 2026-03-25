import * as React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'

import { api } from '@/lib/api'
import type { ListResponse, RecurringPlan } from '@/pages/app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { formatDate, formatMoney } from '@/pages/app/ui'

function getDefaultPrice(plan: RecurringPlan) {
	const d = plan.prices.find((p) => p.isDefault) ?? plan.prices[0]
	if (!d) return null
	return `${formatMoney(d.price)} / ${d.billingPeriodValue} ${d.billingPeriodUnit}`
}

export function RecurringPlansPage() {
	const [data, setData] = React.useState<ListResponse<RecurringPlan> | null>(null)
	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)

	async function load() {
		setLoading(true)
		setError(null)
		try {
			const res = await api.get<ListResponse<RecurringPlan>>('/recurring-plans')
			setData(res)
		} catch (e: any) {
			setError(e?.message ?? 'Failed to load')
		} finally {
			setLoading(false)
		}
	}

	React.useEffect(() => {
		void load()
	}, [])

	async function onDelete(id: number) {
		if (!confirm('Delete this plan?')) return
		try {
			await api.delete(`/recurring-plans/${id}`)
			await load()
		} catch (e: any) {
			alert(e?.message ?? 'Delete failed')
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex items-end justify-between gap-4">
				<div>
					<div className="text-2xl font-semibold tracking-tight">Recurring Plans</div>
					<div className="mt-1 text-sm text-muted-foreground">Plans, billing periods, and recurring prices.</div>
				</div>
				<Link to="/app/recurring-plans/new">
					<Button>
						<Plus className="mr-2 size-4" />
						New Plan
					</Button>
				</Link>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All plans</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="text-sm text-muted-foreground">Loading…</div>
					) : error ? (
						<div className="text-sm text-red-300">{error}</div>
					) : !data?.data?.length ? (
						<div className="text-sm text-muted-foreground">No plans yet.</div>
					) : (
						<Table>
							<THead>
								<TR>
									<TH>Name</TH>
									<TH>Default price</TH>
									<TH>Flags</TH>
									<TH>Auto close</TH>
									<TH>Created</TH>
									<TH className="text-right">Actions</TH>
								</TR>
							</THead>
							<TBody>
								{data.data.map((p) => (
									<TR key={p.id}>
										<TD>
											<Link className="font-medium hover:underline" to={`/app/recurring-plans/${p.id}`}>
												{p.name}
											</Link>
											<div className="text-xs text-muted-foreground">Min qty: {p.minQuantity}</div>
										</TD>
										<TD className="text-muted-foreground">{getDefaultPrice(p) ?? '—'}</TD>
										<TD className="space-x-1">
											{p.renewable ? <Badge variant="success">Renew</Badge> : <Badge variant="muted">No renew</Badge>}
											{p.pausable ? <Badge variant="muted">Pause</Badge> : null}
											{p.closable ? <Badge variant="warning">Close</Badge> : null}
										</TD>
										<TD className="text-muted-foreground">
											{p.autoClose ? `Yes (${p.autoCloseValidityDays ?? '—'}d)` : 'No'}
										</TD>
										<TD className="text-muted-foreground">{formatDate(p.createdAt)}</TD>
										<TD className="text-right">
											<div className="inline-flex items-center gap-2">
												<Link to={`/app/recurring-plans/${p.id}`}>
													<Button className="bg-muted/30 text-foreground hover:bg-muted/40">Edit</Button>
												</Link>
												<Button
													className="bg-destructive hover:brightness-110"
													onClick={() => onDelete(p.id)}
												>
													<Trash2 className="size-4" />
												</Button>
											</div>
										</TD>
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
