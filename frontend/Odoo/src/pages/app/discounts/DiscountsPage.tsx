import * as React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'

import { api } from '@/lib/api'
import type { Discount, ListResponse } from '@/pages/app/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'

function formatRange(startsAt: string | null, endsAt: string | null) {
	if (!startsAt && !endsAt) return '—'
	const s = startsAt ? new Date(startsAt).toLocaleString() : '—'
	const e = endsAt ? new Date(endsAt).toLocaleString() : '—'
	return `${s} → ${e}`
}

export function DiscountsPage() {
	const [data, setData] = React.useState<ListResponse<Discount> | null>(null)
	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)
	const [q, setQ] = React.useState('')
	const [show, setShow] = React.useState<'all' | 'active' | 'inactive'>('all')

	async function load(next?: { q?: string; show?: typeof show }) {
		setLoading(true)
		setError(null)
		try {
			const qq = next?.q ?? q
			const s = next?.show ?? show
			const query: Record<string, string | number | boolean | undefined | null> = {
				q: qq.trim() ? qq.trim() : undefined,
				isActive: s === 'all' ? undefined : s === 'active',
			}
			const res = await api.get<ListResponse<Discount>>('/discounts', query)
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

	async function onDelete(id: number) {
		if (!confirm('Delete this discount?')) return
		try {
			await api.delete(`/discounts/${id}`)
			await load()
		} catch (e: any) {
			alert(e?.message ?? 'Delete failed')
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div>
					<div className="text-2xl font-semibold tracking-tight">Discounts</div>
					<div className="mt-1 text-sm text-muted-foreground">Create discount codes and control when they’re active.</div>
				</div>
				<Link to="/app/discounts/new">
					<Button>
						<Plus className="mr-2 size-4" />
						New Discount
					</Button>
				</Link>
			</div>

			<Card>
				<CardHeader className="gap-3 md:flex-row md:items-center md:justify-between">
					<CardTitle>All discounts</CardTitle>
					<div className="flex flex-col gap-2 md:flex-row md:items-center">
						<div className="flex gap-2">
							<Button
								className={show === 'all' ? '' : 'bg-muted/30 text-foreground hover:bg-muted/40'}
								onClick={() => {
									setShow('all')
									void load({ show: 'all' })
								}}
							>
								All
							</Button>
							<Button
								className={show === 'active' ? '' : 'bg-muted/30 text-foreground hover:bg-muted/40'}
								onClick={() => {
									setShow('active')
									void load({ show: 'active' })
								}}
							>
								Active
							</Button>
							<Button
								className={show === 'inactive' ? '' : 'bg-muted/30 text-foreground hover:bg-muted/40'}
								onClick={() => {
									setShow('inactive')
									void load({ show: 'inactive' })
								}}
							>
								Inactive
							</Button>
						</div>
						<div className="w-full md:w-72">
							<Input
								value={q}
								onChange={(e) => setQ(e.target.value)}
								placeholder="Search discount code…"
								onKeyDown={(e) => {
									if (e.key === 'Enter') void load({ q: e.currentTarget.value })
								}}
							/>
						</div>
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={() => load()}>
							Search
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="text-sm text-muted-foreground">Loading…</div>
					) : error ? (
						<div className="text-sm text-red-300">{error}</div>
					) : !data?.data?.length ? (
						<div className="text-sm text-muted-foreground">No discounts yet.</div>
					) : (
						<Table>
							<THead>
								<TR>
									<TH>Code</TH>
									<TH>Percent</TH>
									<TH>Scope</TH>
									<TH>Usage</TH>
									<TH>Validity</TH>
									<TH>Status</TH>
									<TH className="text-right">Actions</TH>
								</TR>
							</THead>
							<TBody>
								{data.data.map((d) => (
									<TR key={d.id}>
										<TD>
											<Link className="font-medium hover:underline" to={`/app/discounts/${d.id}`}>
												{d.code}
											</Link>
											<div className="text-xs text-muted-foreground">ID: {d.id}</div>
										</TD>
										<TD className="text-muted-foreground">{Number(d.percent).toFixed(2)}%</TD>
										<TD className="text-muted-foreground">{d.productId ? `Product #${d.productId}` : 'All products'}</TD>
										<TD className="text-muted-foreground">
											{d.limitUsage ? `${d.timesUsed ?? 0} / ${d.usageLimit ?? '—'}` : 'Unlimited'}
										</TD>
										<TD className="text-muted-foreground">{formatRange(d.startsAt, d.endsAt)}</TD>
										<TD>
											{d.isActive ? <Badge>Active</Badge> : <Badge className="bg-muted/30 text-foreground">Inactive</Badge>}
										</TD>
										<TD className="text-right">
											<div className="inline-flex items-center gap-2">
												<Link to={`/app/discounts/${d.id}`}>
													<Button className="bg-muted/30 text-foreground hover:bg-muted/40">Edit</Button>
												</Link>
												<Button className="bg-destructive hover:brightness-110" onClick={() => onDelete(d.id)}>
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
