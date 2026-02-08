import * as React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Store, User } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'

type NavItem = { to: string; label: string; icon: React.ReactNode }

const NAV: NavItem[] = [
	{ to: '/portal/shop', label: 'Shop', icon: <Store className="size-4" /> },
	{ to: '/portal/search', label: 'Search', icon: <Search className="size-4" /> },
	{ to: '/portal/profile', label: 'Profile', icon: <User className="size-4" /> },
]

export function PortalShell() {
	const navigate = useNavigate()
	const { user, logout } = useAuth()
	const { count } = useCart()

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.18),transparent_45%),radial-gradient(circle_at_85%_25%,rgba(168,85,247,0.14),transparent_40%),radial-gradient(circle_at_35%_90%,rgba(16,185,129,0.10),transparent_45%)]" />

			<header className="relative border-b border-border/60 bg-background/50 backdrop-blur-xl">
				<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="grid size-10 place-items-center rounded-2xl bg-primary/15 text-primary border border-primary/20">
							<span className="font-handwriting text-lg">O</span>
						</div>
						<div>
							<div className="text-sm font-semibold tracking-tight">Odoo Subscriptions</div>
							<div className="text-xs text-muted-foreground">Portal</div>
						</div>
					</div>

					<nav className="hidden items-center gap-2 md:flex">
						{NAV.map((item) => (
							<NavLink
								key={item.to}
								to={item.to}
								className={({ isActive }) =>
									cn(
										'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
										isActive
											? 'bg-primary/15 text-foreground border border-primary/20'
											: 'text-muted-foreground hover:text-foreground hover:bg-muted/15 border border-transparent',
									)
								}
							>
								{item.icon}
								<span>{item.label}</span>
							</NavLink>
						))}
					</nav>

					<div className="flex items-center gap-2">
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={() => navigate('/portal/checkout')}>
							<ShoppingCart className="mr-2 size-4" />
							Cart {count ? `(${count})` : ''}
						</Button>
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={() => logout()}>
							Logout
						</Button>
					</div>
				</div>
			</header>

			<main className="relative mx-auto max-w-6xl px-6 py-8">
				<div className="mb-6">
					<div className="text-xs text-muted-foreground">Signed in as</div>
					<div className="text-sm font-medium truncate">{user?.email ?? '—'}</div>
				</div>
				<Outlet />
			</main>
		</div>
	)
}
