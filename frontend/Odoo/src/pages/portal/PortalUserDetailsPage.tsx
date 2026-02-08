import * as React from 'react'
import { Pencil, Save, Shield, Undo2 } from 'lucide-react'

import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { Contact, ListResponse } from '@/pages/app/types'
import { PageHeader } from '@/components/odoo/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type MeResponse = {
	id: number
	name: string
	email: string
	role: 'ADMIN' | 'PORTAL' | 'INTERNAL'
	createdAt: string
}

export function PortalUserDetailsPage() {
	const { user, accessToken, login } = useAuth()

	const [editMode, setEditMode] = React.useState(false)
	const [loading, setLoading] = React.useState(true)
	const [saving, setSaving] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)
	const [success, setSuccess] = React.useState<string | null>(null)

	const [me, setMe] = React.useState<MeResponse | null>(null)
	const [contact, setContact] = React.useState<Contact | null>(null)

	const [name, setName] = React.useState('')
	const [email, setEmail] = React.useState('')
	const [phone, setPhone] = React.useState('')
	const [address, setAddress] = React.useState('')

	const dirty = React.useMemo(() => {
		const baseName = me?.name ?? ''
		const baseEmail = me?.email ?? ''
		const basePhone = contact?.phone ?? ''
		const baseAddress = contact?.address ?? ''
		return name.trim() !== baseName || email.trim() !== baseEmail || phone.trim() !== basePhone || address.trim() !== baseAddress
	}, [address, contact?.address, contact?.phone, email, me?.email, me?.name, name, phone])

	const syncForm = React.useCallback((nextMe: MeResponse | null, nextContact: Contact | null) => {
		setName(nextMe?.name ?? '')
		setEmail(nextMe?.email ?? '')
		setPhone(nextContact?.phone ?? '')
		setAddress(nextContact?.address ?? '')
	}, [])

	const load = React.useCallback(async () => {
		setLoading(true)
		setError(null)
		setSuccess(null)
		try {
			// Show local auth data instantly.
			if (!me && user) {
				setMe({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: '' })
				syncForm({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: '' }, contact)
			}

			const nextMe = await api.get<MeResponse>('/users/me')
			setMe(nextMe)
			const contacts = await api.get<ListResponse<Contact>>('/contacts', { take: 1 })
			const nextContact = contacts.data?.[0] ?? null
			setContact(nextContact)
			syncForm(nextMe, nextContact)
			setEditMode(false)
		} catch (e: any) {
			setError(e?.message ?? 'Failed to load')
		} finally {
			setLoading(false)
		}
	}, [contact, me, syncForm, user])

	React.useEffect(() => {
		void load()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	async function onSave() {
		if (!editMode) return
		setSaving(true)
		setError(null)
		setSuccess(null)
		try {
			if (!name.trim()) throw new Error('Name is required')
			if (!email.trim()) throw new Error('Email is required')

			let nextMe = me
			const nameChanged = name.trim() !== (me?.name ?? '')
			const emailChanged = email.trim() !== (me?.email ?? '')
			if (nameChanged || emailChanged) {
				nextMe = await api.patch<MeResponse>('/users/me', {
					...(nameChanged ? { name: name.trim() } : {}),
					...(emailChanged ? { email: email.trim() } : {}),
				})
				setMe(nextMe)

				const token = accessToken ?? localStorage.getItem('odoo_access_token')
				if (token && nextMe) {
					login(token, { id: nextMe.id, name: nextMe.name, email: nextMe.email, role: nextMe.role }, true)
				}
			}

			let nextContact = contact
			if (!nextContact) {
				nextContact = await api.post<Contact>('/contacts', {
					name: (nextMe?.name ?? name).trim(),
					email: (nextMe?.email ?? email).trim(),
					phone: phone.trim() ? phone.trim() : undefined,
					address: address.trim() ? address.trim() : undefined,
				})
				setContact(nextContact)
			} else {
				nextContact = await api.patch<Contact>(`/contacts/${nextContact.id}`, {
					phone: phone.trim() ? phone.trim() : undefined,
					address: address.trim() ? address.trim() : undefined,
				})
				setContact(nextContact)
			}

			syncForm(nextMe ?? null, nextContact)
			setSuccess('Saved')
			setEditMode(false)
		} catch (e: any) {
			setError(e?.message ?? 'Save failed')
		} finally {
			setSaving(false)
		}
	}

	function onCancel() {
		syncForm(me, contact)
		setEditMode(false)
		setError(null)
		setSuccess(null)
	}

	return (
		<div className="space-y-4">
			<PageHeader
				title="User Details"
				subtitle="View your details. Click Edit to update and save to the database."
				actions={
					editMode ? (
						<>
							<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={onCancel} disabled={saving}>
								Cancel
							</Button>
							<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={load} disabled={saving || loading}>
								<Undo2 className="mr-2 size-4" />
								Reset
							</Button>
							<Button onClick={onSave} disabled={saving || loading || !dirty}>
								<Save className="mr-2 size-4" />
								{saving ? 'Saving…' : 'Save'}
							</Button>
						</>
					) : (
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={() => setEditMode(true)} disabled={loading}>
							<Pencil className="mr-2 size-4" />
							Edit
						</Button>
					)
				}
			/>

			{error ? (
				<div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
			) : null}
			{success ? (
				<div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</div>
			) : null}
			{loading ? <div className="text-sm text-muted-foreground">Loading…</div> : null}

			<Card className="max-w-3xl">
				<CardHeader>
					<CardTitle>Details</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div>
							<Label>Name</Label>
							<Input value={name} onChange={(e) => setName(e.target.value)} readOnly={!editMode} className={!editMode ? 'bg-muted/20' : undefined} />
						</div>
						<div>
							<Label>Email</Label>
							<Input value={email} onChange={(e) => setEmail(e.target.value)} readOnly={!editMode} className={!editMode ? 'bg-muted/20' : undefined} />
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div>
							<Label>Phone Number</Label>
							<Input value={phone} onChange={(e) => setPhone(e.target.value)} readOnly={!editMode} className={!editMode ? 'bg-muted/20' : undefined} />
						</div>
						<div>
							<Label>Role</Label>
							<Input value={me?.role ?? user?.role ?? ''} readOnly className="bg-muted/20" />
						</div>
					</div>

					<div>
						<Label>Address</Label>
						<Textarea value={address} onChange={(e) => setAddress(e.target.value)} readOnly={!editMode} className={!editMode ? 'bg-muted/20' : undefined} />
					</div>
				</CardContent>
			</Card>

			<Card className="max-w-3xl">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Shield className="size-4" />
						Security
					</CardTitle>
				</CardHeader>
				<CardContent className="text-sm text-muted-foreground">
					Password changes are available in the internal profile screen. (Can be added here if you want.)
				</CardContent>
			</Card>
		</div>
	)
}
