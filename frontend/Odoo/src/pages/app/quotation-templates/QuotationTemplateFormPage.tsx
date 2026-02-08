import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'

import { api } from '@/lib/api'
import type { QuotationTemplate } from '@/pages/app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function QuotationTemplateFormPage({ mode }: { mode: 'create' | 'edit' }) {
	const navigate = useNavigate()
	const params = useParams()
	const id = Number(params.id)

	const [loading, setLoading] = React.useState(mode === 'edit')
	const [saving, setSaving] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)

	const [name, setName] = React.useState('')
	const [content, setContent] = React.useState('')

	React.useEffect(() => {
		if (mode !== 'edit') return
		if (!Number.isFinite(id)) return
		let cancelled = false
		async function load() {
			setLoading(true)
			setError(null)
			try {
				const t = await api.get<QuotationTemplate>(`/quotation-templates/${id}`)
				if (cancelled) return
				setName(t.name)
				setContent(t.content ?? '')
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
			const payload = {
				name: name.trim(),
				content: content.trim() ? content : undefined,
			}
			if (mode === 'create') {
				await api.post<QuotationTemplate>('/quotation-templates', payload)
			} else {
				await api.patch<QuotationTemplate>(`/quotation-templates/${id}`, payload)
			}
			navigate('/app/quotation-templates')
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
					<Link to="/app/quotation-templates">
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40">
							<ArrowLeft className="mr-2 size-4" />
							Back
						</Button>
					</Link>
					<div>
						<div className="text-2xl font-semibold tracking-tight">
							{mode === 'create' ? 'New Quotation Template' : 'Edit Quotation Template'}
						</div>
						<div className="mt-1 text-sm text-muted-foreground">Optional content used when sending quotations.</div>
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
						<div>
							<Label>Name</Label>
							<Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Default Quotation" />
						</div>
						<div>
							<Label>Content (optional)</Label>
							<Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Email/body template…" />
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
