import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'

import { api } from '@/lib/api'
import type { Discount, ListResponse, Product } from '@/pages/app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

function toLocalDateTimeInputValue(iso: string | null) {
	if (!iso) return ''
	const d = new Date(iso)
	if (!Number.isFinite(d.getTime())) return ''
	const pad = (n: number) => String(n).padStart(2, '0')
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function DiscountFormPage({ mode }: { mode: 'create' | 'edit' }) {
	const navigate = useNavigate()
	const params = useParams()
	const id = Number(params.id)

	const [loading, setLoading] = React.useState(mode === 'edit')
	const [saving, setSaving] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)

	const [code, setCode] = React.useState('')
	const [percent, setPercent] = React.useState<number>(0)
	const [isActive, setIsActive] = React.useState(true)
	const [startsAt, setStartsAt] = React.useState<string>('')
	const [endsAt, setEndsAt] = React.useState<string>('')
	const [limitUsage, setLimitUsage] = React.useState(false)
	const [usageLimit, setUsageLimit] = React.useState<number | ''>('')
	const [productId, setProductId] = React.useState<number | ''>('')
	const [products, setProducts] = React.useState<Product[]>([])
	const [timesUsed, setTimesUsed] = React.useState<number>(0)
	const [loadingProducts, setLoadingProducts] = React.useState(true)

	React.useEffect(() => {
		let cancelled = false
		async function loadProducts() {
			setLoadingProducts(true)
			try {
				const res = await api.get<ListResponse<Product>>('/products')
				if (!cancelled) setProducts(res.data)
			} catch {
				// ignore; keep dropdown empty
			} finally {
				if (!cancelled) setLoadingProducts(false)
			}
		}
		void loadProducts()
		return () => {
			cancelled = true
		}
	}, [])

	React.useEffect(() => {
		if (mode !== 'edit') return
		if (!Number.isFinite(id)) return

		let cancelled = false
		async function load() {
			setLoading(true)
			setError(null)
			try {
				const d = await api.get<Discount>(`/discounts/${id}`)
				if (cancelled) return
				setCode(d.code)
				setPercent(Number(d.percent) ?? 0)
				setIsActive(Boolean(d.isActive))
				setStartsAt(toLocalDateTimeInputValue(d.startsAt))
				setEndsAt(toLocalDateTimeInputValue(d.endsAt))
				setLimitUsage(Boolean(d.limitUsage))
				setUsageLimit(typeof d.usageLimit === 'number' ? d.usageLimit : '')
				setProductId(typeof d.productId === 'number' ? d.productId : '')
				setTimesUsed(typeof d.timesUsed === 'number' ? d.timesUsed : 0)
			} catch (e: any) {
				if (!cancelled) setError(e?.message ?? 'Failed to load')
			} finally {
				if (!cancelled) setLoading(false)
			}
		}
		void load()
		return () => {
			cancelled = true
		}
	}, [mode, id])

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setSaving(true)
		setError(null)
		try {
			const payload = {
				code: code.trim().toUpperCase(),
				percent: Number(percent),
				isActive,
				startsAt: startsAt ? new Date(startsAt).toISOString() : null,
				endsAt: endsAt ? new Date(endsAt).toISOString() : null,
				limitUsage,
				usageLimit: limitUsage ? (usageLimit === '' ? NaN : Number(usageLimit)) : null,
				productId: productId === '' ? null : Number(productId),
			}

			if (!payload.code) throw new Error('Code is required')
			if (!Number.isFinite(payload.percent)) throw new Error('Percent must be a number')
			if (payload.percent < 0 || payload.percent > 100) throw new Error('Percent must be between 0 and 100')
			if (payload.startsAt && payload.endsAt && new Date(payload.startsAt) > new Date(payload.endsAt)) {
				throw new Error('Starts At must be before Ends At')
			}
			if (payload.limitUsage) {
				if (!Number.isFinite(payload.usageLimit) || (payload.usageLimit as number) < 1) {
					throw new Error('Usage limit must be >= 1 when Limit usage is enabled')
				}
			}

			if (mode === 'create') {
				const created = await api.post<Discount>('/discounts', {
					code: payload.code,
					percent: payload.percent,
					isActive: payload.isActive,
					startsAt: payload.startsAt ?? undefined,
					endsAt: payload.endsAt ?? undefined,
					limitUsage: payload.limitUsage,
					usageLimit: payload.limitUsage ? (payload.usageLimit as number) : undefined,
					productId: payload.productId ?? undefined,
				})
				navigate(`/app/discounts/${created.id}`, { replace: true })
			} else {
				await api.patch<Discount>(`/discounts/${id}`, {
					code: payload.code,
					percent: payload.percent,
					isActive: payload.isActive,
					startsAt: payload.startsAt,
					endsAt: payload.endsAt,
					limitUsage: payload.limitUsage,
					usageLimit: payload.limitUsage ? (payload.usageLimit as number) : null,
					productId: payload.productId,
				})
				await new Promise((r) => setTimeout(r, 150))
			}
		} catch (e: any) {
			setError(e?.message ?? 'Save failed')
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-3">
				<div>
					<div className="text-2xl font-semibold tracking-tight">{mode === 'create' ? 'New Discount' : 'Edit Discount'}</div>
					<div className="mt-1 text-sm text-muted-foreground">Discount codes can be validated in the portal checkout.</div>
				</div>
				<Link to="/app/discounts">
					<Button className="bg-muted/30 text-foreground hover:bg-muted/40">
						<ArrowLeft className="mr-2 size-4" />
						Back
					</Button>
				</Link>
			</div>

			<Card className="max-w-2xl">
				<CardHeader>
					<CardTitle>Discount details</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="text-sm text-muted-foreground">Loading…</div>
					) : (
						<form className="space-y-4" onSubmit={onSubmit}>
							{error ? <div className="text-sm text-red-300">{error}</div> : null}

							<div className="grid gap-2">
								<Label htmlFor="code">Code</Label>
								<Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="SAVE10" />
								<div className="text-xs text-muted-foreground">Stored as uppercase and must be unique.</div>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="percent">Percent</Label>
								<Input
									id="percent"
									type="number"
									step="0.01"
									min={0}
									max={100}
									value={String(percent)}
									onChange={(e) => setPercent(Number(e.target.value))}
								/>
								<div className="text-xs text-muted-foreground">Example: 10.00</div>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="startsAt">Starts At (optional)</Label>
								<Input id="startsAt" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
							</div>

							<div className="grid gap-2">
								<Label htmlFor="endsAt">Ends At (optional)</Label>
								<Input id="endsAt" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
							</div>

							<div className="flex items-center gap-2">
								<Checkbox id="isActive" checked={isActive} onCheckedChange={(v) => setIsActive(Boolean(v))} />
								<Label htmlFor="isActive">Active</Label>
							</div>

							<div className="grid gap-2">
								<Label>Applies to product (optional)</Label>
								{loadingProducts ? (
									<div className="text-sm text-muted-foreground">Loading products…</div>
								) : (
									<select
										className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm"
										value={productId}
										onChange={(e) => setProductId(e.target.value ? Number(e.target.value) : '')}
									>
										<option value="">All products</option>
										{products.map((p) => (
											<option key={p.id} value={p.id}>
												{p.name} (#{p.id})
											</option>
										))}
									</select>
								)}
								<div className="text-xs text-muted-foreground">If set, discount is valid only when that product is in the cart/order.</div>
							</div>

							<div className="flex items-center gap-2">
								<Checkbox id="limitUsage" checked={limitUsage} onCheckedChange={(v) => setLimitUsage(Boolean(v))} />
								<Label htmlFor="limitUsage">Limit usage</Label>
							</div>

							{limitUsage ? (
								<div className="grid gap-2">
									<Label htmlFor="usageLimit">Usage limit</Label>
									<Input
										id="usageLimit"
										type="number"
										min={1}
										value={usageLimit === '' ? '' : String(usageLimit)}
										onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : '')}
									/>
									<div className="text-xs text-muted-foreground">Times used: {timesUsed}</div>
								</div>
							) : null}

							<Button type="submit" disabled={saving}>
								<Save className="mr-2 size-4" />
								{saving ? 'Saving…' : 'Save'}
							</Button>
						</form>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
