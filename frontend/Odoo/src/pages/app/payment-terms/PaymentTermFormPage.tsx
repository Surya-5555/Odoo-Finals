import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'

import { api } from '@/lib/api'
import type { PaymentTerm } from '@/pages/app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type DiscountMode = 'none' | 'percent' | 'fixed'

function inferMode(t: PaymentTerm): DiscountMode {
	if (t.earlyDiscountPercent != null) return 'percent'
	if (t.earlyDiscountFixed != null) return 'fixed'
	return 'none'
}

export function PaymentTermFormPage({ mode }: { mode: 'create' | 'edit' }) {
	const navigate = useNavigate()
	const params = useParams()
	const id = Number(params.id)

	const [loading, setLoading] = React.useState(mode === 'edit')
	const [saving, setSaving] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)

	const [name, setName] = React.useState('')
	const [dueAfterDays, setDueAfterDays] = React.useState<number>(0)
	const [discountMode, setDiscountMode] = React.useState<DiscountMode>('none')
	const [earlyDiscountPercent, setEarlyDiscountPercent] = React.useState<number | ''>('')
	const [earlyDiscountFixed, setEarlyDiscountFixed] = React.useState<number | ''>('')
	const [earlyDiscountDays, setEarlyDiscountDays] = React.useState<number | ''>('')

	React.useEffect(() => {
		if (mode !== 'edit') return
		if (!Number.isFinite(id)) return
		let cancelled = false
		async function load() {
			setLoading(true)
			setError(null)
			try {
				const t = await api.get<PaymentTerm>(`/payment-terms/${id}`)
				if (cancelled) return
				setName(t.name)
				setDueAfterDays(t.dueAfterDays)
				setDiscountMode(inferMode(t))
				setEarlyDiscountPercent(t.earlyDiscountPercent ?? '')
				setEarlyDiscountFixed(t.earlyDiscountFixed ?? '')
				setEarlyDiscountDays(t.earlyDiscountDays ?? '')
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

	async function onSave() {
		setSaving(true)
		setError(null)
		try {
			if (!name.trim()) throw new Error('Name is required')
			if (dueAfterDays < 0) throw new Error('Due after days must be >= 0')

			const payload: Record<string, unknown> = {
				name: name.trim(),
				dueAfterDays: Number(dueAfterDays),
			}

			if (discountMode === 'percent') {
				if (earlyDiscountPercent === '' || Number(earlyDiscountPercent) < 0) {
					throw new Error('Early discount percent must be >= 0')
				}
				payload.earlyDiscountPercent = Number(earlyDiscountPercent)
				payload.earlyDiscountFixed = undefined
			} else if (discountMode === 'fixed') {
				if (earlyDiscountFixed === '' || Number(earlyDiscountFixed) < 0) {
					throw new Error('Early discount fixed must be >= 0')
				}
				payload.earlyDiscountFixed = Number(earlyDiscountFixed)
				payload.earlyDiscountPercent = undefined
			} else {
				payload.earlyDiscountPercent = undefined
				payload.earlyDiscountFixed = undefined
			}

			if (discountMode !== 'none') {
				if (earlyDiscountDays !== '' && Number(earlyDiscountDays) < 0) {
					throw new Error('Early discount days must be >= 0')
				}
				payload.earlyDiscountDays = earlyDiscountDays === '' ? undefined : Number(earlyDiscountDays)
			} else {
				payload.earlyDiscountDays = undefined
			}

			if (mode === 'create') {
				await api.post<PaymentTerm>('/payment-terms', payload)
			} else {
				await api.patch<PaymentTerm>(`/payment-terms/${id}`, payload)
			}
			navigate('/app/payment-terms')
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
					<Link to="/app/payment-terms">
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40">
							<ArrowLeft className="mr-2 size-4" />
							Back
						</Button>
					</Link>
					<div>
						<div className="text-2xl font-semibold tracking-tight">
							{mode === 'create' ? 'New Payment Term' : 'Edit Payment Term'}
						</div>
						<div className="mt-1 text-sm text-muted-foreground">Controls invoice due date and optional early discounts.</div>
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
				<Card className="max-w-3xl">
					<CardHeader>
						<CardTitle>Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<Label>Name</Label>
								<Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Net 30" />
							</div>
							<div>
								<Label>Due after (days)</Label>
								<Input type="number" min={0} value={dueAfterDays} onChange={(e) => setDueAfterDays(Number(e.target.value))} />
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<Label>Early discount type</Label>
								<select
									className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm"
									value={discountMode}
									onChange={(e) => {
										const v = e.target.value as DiscountMode
										setDiscountMode(v)
										if (v !== 'percent') setEarlyDiscountPercent('')
										if (v !== 'fixed') setEarlyDiscountFixed('')
										if (v === 'none') setEarlyDiscountDays('')
									}}
								>
									<option value="none">None</option>
									<option value="percent">Percent</option>
									<option value="fixed">Fixed amount</option>
								</select>
							</div>
							<div>
								<Label>Early discount days (optional)</Label>
								<Input
									type="number"
									min={0}
									value={earlyDiscountDays}
									onChange={(e) => setEarlyDiscountDays(e.target.value === '' ? '' : Number(e.target.value))}
									disabled={discountMode === 'none'}
								/>
							</div>
						</div>

						{discountMode === 'percent' ? (
							<div>
								<Label>Early discount percent</Label>
								<Input
									type="number"
									min={0}
									value={earlyDiscountPercent}
									onChange={(e) => setEarlyDiscountPercent(e.target.value === '' ? '' : Number(e.target.value))}
									placeholder="e.g. 2"
								/>
								<div className="mt-1 text-xs text-muted-foreground">Example: 2% if paid within 10 days.</div>
							</div>
						) : null}

						{discountMode === 'fixed' ? (
							<div>
								<Label>Early discount fixed amount</Label>
								<Input
									type="number"
									min={0}
									value={earlyDiscountFixed}
									onChange={(e) => setEarlyDiscountFixed(e.target.value === '' ? '' : Number(e.target.value))}
									placeholder="e.g. 50"
								/>
							</div>
						) : null}
					</CardContent>
				</Card>
			)}
		</div>
	)
}
