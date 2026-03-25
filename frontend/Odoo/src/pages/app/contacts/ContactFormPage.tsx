import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'

import { api } from '@/lib/api'
import type { Contact } from '@/pages/app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function ContactFormPage({ mode }: { mode: 'create' | 'edit' }) {
	const navigate = useNavigate()
	const params = useParams()
	const id = Number(params.id)

	const [loading, setLoading] = React.useState(mode === 'edit')
	const [saving, setSaving] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)

	const [name, setName] = React.useState('')
	const [email, setEmail] = React.useState('')
	const [phone, setPhone] = React.useState('')
	const [companyName, setCompanyName] = React.useState('')
	const [address, setAddress] = React.useState('')
	const [userId, setUserId] = React.useState<number | ''>('')

	React.useEffect(() => {
		if (mode !== 'edit') return
		if (!Number.isFinite(id)) return
		let cancelled = false
		async function load() {
			setLoading(true)
			setError(null)
			try {
				const c = await api.get<Contact>(`/contacts/${id}`)
				if (cancelled) return
				setName(c.name)
				setEmail(c.email)
				setPhone(c.phone ?? '')
				setCompanyName(c.companyName ?? '')
				setAddress(c.address ?? '')
				setUserId(c.userId ?? '')
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
			if (!email.trim()) throw new Error('Email is required')

			const payload = {
				name: name.trim(),
				email: email.trim(),
				phone: phone.trim() ? phone.trim() : undefined,
				companyName: companyName.trim() ? companyName.trim() : undefined,
				address: address.trim() ? address.trim() : undefined,
				userId: userId === '' ? undefined : Number(userId),
			}

			if (mode === 'create') {
				await api.post<Contact>('/contacts', payload)
			} else {
				await api.patch<Contact>(`/contacts/${id}`, payload)
			}
			navigate('/app/contacts')
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
					<Link to="/app/contacts">
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40">
							<ArrowLeft className="mr-2 size-4" />
							Back
						</Button>
					</Link>
					<div>
						<div className="text-2xl font-semibold tracking-tight">{mode === 'create' ? 'New Contact' : 'Edit Contact'}</div>
						<div className="mt-1 text-sm text-muted-foreground">Used as the customer on subscriptions and invoices.</div>
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
								<Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Surya" />
							</div>
							<div>
								<Label>Email</Label>
								<Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<Label>Phone (optional)</Label>
								<Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91…" />
							</div>
							<div>
								<Label>Company (optional)</Label>
								<Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company name" />
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<Label>Linked portal user id (optional)</Label>
								<Input
									type="number"
									min={1}
									value={userId}
									onChange={(e) => setUserId(e.target.value === '' ? '' : Number(e.target.value))}
								/>
								<div className="mt-1 text-xs text-muted-foreground">If you want this contact tied to a User record.</div>
							</div>
						</div>

						<div>
							<Label>Address (optional)</Label>
							<Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Billing address…" />
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
