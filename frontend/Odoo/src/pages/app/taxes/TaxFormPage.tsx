import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'

import { api } from '@/lib/api'
import type { Tax } from '@/pages/app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export function TaxFormPage({ mode }: { mode: 'create' | 'edit' }) {
	const navigate = useNavigate()
	const params = useParams()
	const id = Number(params.id)

	const [loading, setLoading] = React.useState(mode === 'edit')
	const [saving, setSaving] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)

	const [name, setName] = React.useState('')
	const [percent, setPercent] = React.useState<number>(0)
	const [isActive, setIsActive] = React.useState(true)

	React.useEffect(() => {
		if (mode !== 'edit') return
		if (!Number.isFinite(id)) return

		let cancelled = false
		async function load() {
			setLoading(true)
			setError(null)
			try {
				const t = await api.get<Tax>(`/taxes/${id}`)
				if (cancelled) return
				setName(t.name)
				setPercent(Number(t.percent) ?? 0)
				setIsActive(Boolean(t.isActive))
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
				name: name.trim(),
				percent: Number(percent),
				isActive,
			}
			if (!payload.name) throw new Error('Name is required')
			if (!Number.isFinite(payload.percent)) throw new Error('Percent must be a number')

			if (mode === 'create') {
				const created = await api.post<Tax>('/taxes', payload)
				navigate(`/app/taxes/${created.id}`, { replace: true })
			} else {
				await api.patch<Tax>(`/taxes/${id}`, payload)
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
					<div className="text-2xl font-semibold tracking-tight">{mode === 'create' ? 'New Tax' : 'Edit Tax'}</div>
					<div className="mt-1 text-sm text-muted-foreground">Create and manage tax rates used on subscription lines.</div>
				</div>
				<Link to="/app/taxes">
					<Button className="bg-muted/30 text-foreground hover:bg-muted/40">
						<ArrowLeft className="mr-2 size-4" />
						Back
					</Button>
				</Link>
			</div>

			<Card className="max-w-2xl">
				<CardHeader>
					<CardTitle>Tax details</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="text-sm text-muted-foreground">Loading…</div>
					) : (
						<form className="space-y-4" onSubmit={onSubmit}>
							{error ? <div className="text-sm text-red-300">{error}</div> : null}

							<div className="grid gap-2">
								<Label htmlFor="name">Name</Label>
								<Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="GST / VAT / Sales Tax" />
								<div className="text-xs text-muted-foreground">Must be unique.</div>
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
								<div className="text-xs text-muted-foreground">Example: 18.00</div>
							</div>

							<div className="flex items-center gap-2">
								<Checkbox id="isActive" checked={isActive} onCheckedChange={(v) => setIsActive(Boolean(v))} />
								<Label htmlFor="isActive">Active</Label>
							</div>

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
