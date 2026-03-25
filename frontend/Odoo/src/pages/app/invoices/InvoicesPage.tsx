import * as React from 'react'
import { Link } from 'react-router-dom'

import { api } from '@/lib/api'
import type { Invoice, InvoiceState, ListResponse } from '@/pages/app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { formatDate, InvoiceStateBadge } from '@/pages/app/ui'

export function InvoicesPage() {
	const [data, setData] = React.useState<ListResponse<Invoice> | null>(null)
	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)
	const [stateFilter, setStateFilter] = React.useState<InvoiceState | ''>('')

	async function load(nextState?: InvoiceState | '') {
		setLoading(true)
		setError(null)
		try {
			const res = await api.get<ListResponse<Invoice>>('/invoices', {
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
			<div className="flex items-end justify-between gap-4">
				<div>
					<div className="text-2xl font-semibold tracking-tight">Invoices</div>
					<div className="mt-1 text-sm text-muted-foreground">View and manage invoice status.</div>
				</div>
				<select
					className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
					value={stateFilter}
					onChange={(e) => {
						const v = e.target.value as InvoiceState | ''
						setStateFilter(v)
						void load(v)
					}}
				>
					<option value="">All states</option>
					<option value="DRAFT">Draft</option>
					<option value="CONFIRMED">Confirmed</option>
					<option value="PAID">Paid</option>
					<option value="CANCELLED">Cancelled</option>
				</select>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All invoices</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="text-sm text-muted-foreground">Loading…</div>
					) : error ? (
						<div className="text-sm text-red-300">{error}</div>
					) : !data?.data?.length ? (
						<div className="text-sm text-muted-foreground">No invoices yet.</div>
					) : (
						<Table>
							<THead>
								<TR>
									<TH>Number</TH>
									<TH>Invoice date</TH>
									<TH>Due</TH>
									<TH>State</TH>
									<TH className="text-right">Open</TH>
								</TR>
							</THead>
							<TBody>
								{data.data.map((i) => (
									<TR key={i.id}>
										<TD className="font-medium">{i.number}</TD>
										<TD className="text-muted-foreground">{formatDate(i.invoiceDate)}</TD>
										<TD className="text-muted-foreground">{formatDate(i.dueDate)}</TD>
										<TD><InvoiceStateBadge state={i.state} /></TD>
										<TD className="text-right">
											<Link to={`/app/invoices/${i.id}`} className="text-primary hover:underline">
												Open
											</Link>
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
