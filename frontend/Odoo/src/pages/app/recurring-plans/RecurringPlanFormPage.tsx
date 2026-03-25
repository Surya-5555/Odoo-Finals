import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus, Save, ArrowLeft, X } from 'lucide-react'

import { api } from '@/lib/api'
import type { BillingPeriodUnit, RecurringPlan, RecurringPlanPrice } from '@/pages/app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

type PriceDraft = Omit<RecurringPlanPrice, 'id' | 'recurringPlanId'> & { _key: string }

function newPrice(): PriceDraft {
	return {
		_key: crypto.randomUUID(),
		price: 0,
		billingPeriodValue: 1,
		billingPeriodUnit: 'MONTH',
		isDefault: false,
	}
}

export function RecurringPlanFormPage({ mode }: { mode: 'create' | 'edit' }) {
	const navigate = useNavigate()
	const params = useParams()
	const id = Number(params.id)

	const [loading, setLoading] = React.useState(mode === 'edit')
	const [saving, setSaving] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)

	const [name, setName] = React.useState('')
	const [minQuantity, setMinQuantity] = React.useState(1)
	const [startDate, setStartDate] = React.useState<string>('')
	const [endDate, setEndDate] = React.useState<string>('')
	const [autoClose, setAutoClose] = React.useState(false)
	const [autoCloseValidityDays, setAutoCloseValidityDays] = React.useState<number | ''>('')
	const [pausable, setPausable] = React.useState(true)
	const [renewable, setRenewable] = React.useState(true)
	const [closable, setClosable] = React.useState(true)
	const [prices, setPrices] = React.useState<PriceDraft[]>([newPrice()])

	React.useEffect(() => {
		if (mode !== 'edit') return
		if (!Number.isFinite(id)) return
		let cancelled = false
		async function load() {
			setLoading(true)
			setError(null)
			try {
				const plan = await api.get<RecurringPlan>(`/recurring-plans/${id}`)
				if (cancelled) return
				setName(plan.name)
				setMinQuantity(plan.minQuantity)
				setStartDate(plan.startDate ? plan.startDate.slice(0, 10) : '')
				setEndDate(plan.endDate ? plan.endDate.slice(0, 10) : '')
				setAutoClose(plan.autoClose)
				setAutoCloseValidityDays(plan.autoCloseValidityDays ?? '')
				setPausable(plan.pausable)
				setRenewable(plan.renewable)
				setClosable(plan.closable)
				setPrices(
					(plan.prices?.length ? plan.prices : []).map((p) => ({
						_key: crypto.randomUUID(),
						price: p.price,
						billingPeriodValue: p.billingPeriodValue,
						billingPeriodUnit: p.billingPeriodUnit,
						isDefault: p.isDefault,
					})),
				)
				if (!plan.prices?.length) setPrices([newPrice()])
			} catch (e: any) {
				setError(e?.message ?? 'Failed to load')
			} finally {
				setLoading(false)
			}
		}
		void load()
		return () => {
			cancelled = true
		}
	}, [mode, id])

	function setDefaultPrice(key: string) {
		setPrices((prev) => prev.map((p) => ({ ...p, isDefault: p._key === key })))
	}

	async function onSave() {
		setSaving(true)
		setError(null)
		try {
			if (!name.trim()) throw new Error('Name is required')
			if (autoClose && (autoCloseValidityDays === '' || Number(autoCloseValidityDays) < 1)) {
				throw new Error('Validity days must be >= 1 when auto-close is enabled')
			}
			const cleanPrices = prices
				.filter((p) => Number(p.price) > 0)
				.map((p) => ({
					price: Number(p.price),
					billingPeriodValue: Number(p.billingPeriodValue),
					billingPeriodUnit: p.billingPeriodUnit as BillingPeriodUnit,
					isDefault: !!p.isDefault,
				}))

			const payload = {
				name: name.trim(),
				minQuantity: Number(minQuantity),
				startDate: startDate ? new Date(startDate).toISOString() : undefined,
				endDate: endDate ? new Date(endDate).toISOString() : undefined,
				autoClose,
				autoCloseValidityDays: autoClose ? Number(autoCloseValidityDays) : undefined,
				pausable,
				renewable,
				closable,
				prices: cleanPrices.length ? cleanPrices : [],
			}

			if (mode === 'create') {
				const created = await api.post<RecurringPlan>('/recurring-plans', payload)
				navigate(`/app/recurring-plans/${created.id}`)
			} else {
				await api.patch<RecurringPlan>(`/recurring-plans/${id}`, payload)
				navigate('/app/recurring-plans')
			}
		} catch (e: any) {
			setError(e?.message ?? 'Save failed')
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<Link to="/app/recurring-plans">
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40">
							<ArrowLeft className="mr-2 size-4" />
							Back
						</Button>
					</Link>
					<div>
						<div className="text-2xl font-semibold tracking-tight">{mode === 'create' ? 'New Plan' : 'Edit Plan'}</div>
						<div className="mt-1 text-sm text-muted-foreground">Billing rules + flags + price periods.</div>
					</div>
				</div>
				<Button onClick={onSave} disabled={saving || loading}>
					<Save className="mr-2 size-4" />
					{saving ? 'Saving…' : 'Save'}
				</Button>
			</div>

			{error ? <div className="text-sm text-red-300">{error}</div> : null}
			{loading ? (
				<div className="text-sm text-muted-foreground">Loading…</div>
			) : (
				<div className="grid gap-4 xl:grid-cols-3">
					<Card className="xl:col-span-2">
						<CardHeader>
							<CardTitle>Plan details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<Label>Name</Label>
									<Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Standard" />
								</div>
								<div>
									<Label>Min Quantity</Label>
									<Input
										type="number"
										min={1}
										value={minQuantity}
										onChange={(e) => setMinQuantity(Math.max(1, Number(e.target.value || 1)))}
									/>
								</div>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<Label>Start Date (optional)</Label>
									<Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
								</div>
								<div>
									<Label>End Date (optional)</Label>
									<Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
								</div>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<Checkbox checked={autoClose} onCheckedChange={setAutoClose} />
										<div>
											<div className="text-sm font-medium">Auto close</div>
											<div className="text-xs text-muted-foreground">Auto-close unconfirmed subscriptions after validity days.</div>
										</div>
									</div>
									<div>
										<Label>Validity Days</Label>
										<Input
											type="number"
											min={1}
											disabled={!autoClose}
											value={autoCloseValidityDays}
											onChange={(e) => setAutoCloseValidityDays(e.target.value === '' ? '' : Number(e.target.value))}
										/>
									</div>
								</div>

								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<Checkbox checked={renewable} onCheckedChange={setRenewable} />
										<div className="text-sm font-medium">Renewable</div>
									</div>
									<div className="flex items-center gap-2">
										<Checkbox checked={pausable} onCheckedChange={setPausable} />
										<div className="text-sm font-medium">Pausable</div>
									</div>
									<div className="flex items-center gap-2">
										<Checkbox checked={closable} onCheckedChange={setClosable} />
										<div className="text-sm font-medium">Closable</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Prices</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="text-sm text-muted-foreground">Add one or more billing periods. Mark one as default.</div>

							{prices.map((p) => (
								<div key={p._key} className="rounded-xl border border-border/60 bg-muted/10 p-3 space-y-3">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Checkbox checked={p.isDefault} onCheckedChange={() => setDefaultPrice(p._key)} />
											<div className="text-sm font-medium">Default</div>
										</div>
										<Button
											className="bg-muted/30 text-foreground hover:bg-muted/40"
											onClick={() => setPrices((prev) => prev.filter((x) => x._key !== p._key))}
											disabled={prices.length <= 1}
										>
											<X className="size-4" />
										</Button>
									</div>

									<div className="grid gap-3 md:grid-cols-3">
										<div>
											<Label>Price</Label>
											<Input
												type="number"
												min={0}
												value={p.price}
												onChange={(e) =>
												setPrices((prev) =>
													prev.map((x) => (x._key === p._key ? { ...x, price: Number(e.target.value) } : x)),
												)
											}
											/>
										</div>
										<div>
											<Label>Period value</Label>
											<Input
												type="number"
												min={1}
												value={p.billingPeriodValue}
												onChange={(e) =>
												setPrices((prev) =>
													prev.map((x) =>
														x._key === p._key ? { ...x, billingPeriodValue: Math.max(1, Number(e.target.value)) } : x,
													),
												)
											}
											/>
										</div>
										<div>
											<Label>Unit</Label>
											<select
												className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm"
												value={p.billingPeriodUnit}
												onChange={(e) =>
												setPrices((prev) =>
													prev.map((x) => (x._key === p._key ? { ...x, billingPeriodUnit: e.target.value as BillingPeriodUnit } : x)),
												)
											}
											>
												<option value="DAY">Day</option>
												<option value="MONTH">Month</option>
												<option value="YEAR">Year</option>
											</select>
										</div>
									</div>
								</div>
							))}

							<Button
								className="w-full bg-muted/30 text-foreground hover:bg-muted/40"
								onClick={() => setPrices((prev) => [...prev, newPrice()])}
							>
								<Plus className="mr-2 size-4" />
								Add price
							</Button>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	)
}
