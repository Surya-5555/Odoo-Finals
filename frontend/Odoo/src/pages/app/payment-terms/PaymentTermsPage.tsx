import * as React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'

import { api } from '@/lib/api'
import type { ListResponse, PaymentTerm } from '@/pages/app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'

function formatEarlyDiscount(t: PaymentTerm) {
	if (t.earlyDiscountPercent != null) {
		const days = t.earlyDiscountDays != null ? `${t.earlyDiscountDays}d` : '—'
		return `${t.earlyDiscountPercent}% within ${days}`
	}
	if (t.earlyDiscountFixed != null) {
		const days = t.earlyDiscountDays != null ? `${t.earlyDiscountDays}d` : '—'
		return `${t.earlyDiscountFixed} fixed within ${days}`
	}
	return '—'
}

export function PaymentTermsPage() {
	const [data, setData] = React.useState<ListResponse<PaymentTerm> | null>(null)
	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)

	async function load() {
		setLoading(true)
		setError(null)
		try {
			const res = await api.get<ListResponse<PaymentTerm>>('/payment-terms')
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
		if (!confirm('Delete this payment term?')) return
		try {
			await api.delete(`/payment-terms/${id}`)
			await load()
		} catch (e: any) {
			alert(e?.message ?? 'Delete failed')
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex items-end justify-between gap-4">
				<div>
					<div className="text-2xl font-semibold tracking-tight">Payment Terms</div>
					<div className="mt-1 text-sm text-muted-foreground">Due terms and early discount rules for invoices.</div>
				</div>
				<Link to="/app/payment-terms/new">
					<Button>
						<Plus className="mr-2 size-4" />
						New Term
					</Button>
				</Link>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All terms</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="text-sm text-muted-foreground">Loading…</div>
					) : error ? (
						<div className="text-sm text-red-300">{error}</div>
					) : !data?.data?.length ? (
						<div className="text-sm text-muted-foreground">No payment terms yet.</div>
					) : (
						<Table>
							<THead>
								<TR>
									<TH>Name</TH>
									<TH>Due after</TH>
									<TH>Early discount</TH>
									<TH className="text-right">Actions</TH>
								</TR>
							</THead>
							<TBody>
								{data.data.map((t) => (
									<TR key={t.id}>
										<TD>
											<Link className="font-medium hover:underline" to={`/app/payment-terms/${t.id}`}>
												{t.name}
											</Link>
											<div className="text-xs text-muted-foreground">ID: {t.id}</div>
										</TD>
										<TD className="text-muted-foreground">{t.dueAfterDays} day(s)</TD>
										<TD className="text-muted-foreground">{formatEarlyDiscount(t)}</TD>
										<TD className="text-right">
											<div className="inline-flex items-center gap-2">
												<Link to={`/app/payment-terms/${t.id}`}>
													<Button className="bg-muted/30 text-foreground hover:bg-muted/40">Edit</Button>
												</Link>
												<Button className="bg-destructive hover:brightness-110" onClick={() => onDelete(t.id)}>
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
