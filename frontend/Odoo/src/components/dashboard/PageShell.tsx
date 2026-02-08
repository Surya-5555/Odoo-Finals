import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
	CreditCard,
	FileText,
	Landmark,
	LayoutDashboard,
	LogOut,
	Package,
	PieChart,
	Repeat,
	ScrollText,
	Settings,
	Tag,
	Users,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

type NavItem = {
	to: string
	label: string
	icon: React.ReactNode
}

const NAV: NavItem[] = [
	{ to: '/app/overview', label: 'Overview', icon: <LayoutDashboard className="size-4" /> },
	{ to: '/app/recurring-plans', label: 'Recurring Plans', icon: <Repeat className="size-4" /> },
	{ to: '/app/products', label: 'Products', icon: <Package className="size-4" /> },
	{ to: '/app/contacts', label: 'Contacts', icon: <Users className="size-4" /> },
	{ to: '/app/subscriptions', label: 'Subscriptions', icon: <ScrollText className="size-4" /> },
	{ to: '/app/invoices', label: 'Invoices', icon: <CreditCard className="size-4" /> },
	{ to: '/app/payment-terms', label: 'Payment Terms', icon: <Landmark className="size-4" /> },
	{ to: '/app/quotation-templates', label: 'Quotation Templates', icon: <FileText className="size-4" /> },
	{ to: '/app/taxes', label: 'Taxes', icon: <Tag className="size-4" /> },
	{ to: '/app/reporting', label: 'Reporting', icon: <PieChart className="size-4" /> },
	{ to: '/app/configuration', label: 'Configuration', icon: <Settings className="size-4" /> },
	{ to: '/app/my-profile', label: 'My Profile', icon: <Users className="size-4" /> },
]

export function PageShell() {
	const { user, logout } = useAuth()
	const location = useLocation()
	const navigate = useNavigate()

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.22),transparent_45%),radial-gradient(circle_at_75%_30%,rgba(168,85,247,0.18),transparent_40%),radial-gradient(circle_at_40%_85%,rgba(16,185,129,0.14),transparent_45%)]" />

			<div className="relative mx-auto flex min-h-screen max-w-[1400px]">
				<aside className="hidden w-72 shrink-0 border-r border-border/60 bg-background/40 backdrop-blur-xl md:block">
					<div className="p-6">
						<div className="flex items-center gap-2">
							<div className="grid size-10 place-items-center rounded-2xl bg-primary/15 text-primary border border-primary/20">
								<span className="font-handwriting text-lg">O</span>
							</div>
							<div>
								<div className="text-sm font-semibold tracking-tight">Odoo Subscriptions</div>
								<div className="text-xs text-muted-foreground">Back-office</div>
							</div>
						</div>
					</div>

					<nav className="px-3 pb-6">
						{NAV.map((item) => (
							<NavLink
								key={item.to}
								to={item.to}
								className={({ isActive }) =>
									cn(
										'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
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

					<div className="mt-auto p-4">
						<div className="rounded-2xl border border-border/60 bg-card/20 p-4">
							<div className="text-xs text-muted-foreground">Signed in</div>
							<div className="mt-1 text-sm font-medium truncate">{user?.email ?? '—'}</div>
							<Button className="mt-3 w-full bg-muted/30 text-foreground hover:bg-muted/40" onClick={() => logout()}>
								<LogOut className="mr-2 size-4" />
								Logout
							</Button>
						</div>
					</div>
				</aside>

				<div className="flex min-w-0 flex-1 flex-col">
					<header className="sticky top-0 z-10 border-b border-border/60 bg-background/40 backdrop-blur-xl">
						<div className="flex items-center justify-between px-6 py-4">
							<div>
								<div className="text-sm text-muted-foreground">{location.pathname}</div>
								<div className="text-lg font-semibold tracking-tight">Subscription Management</div>
							</div>
							<div className="flex items-center gap-2">
								<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={() => navigate('/app/subscriptions/new')}>
									New Subscription
								</Button>
							</div>
						</div>
					</header>

					<main className="min-w-0 flex-1 p-6">
						<Outlet />
					</main>
				</div>
			</div>
		</div>
	)
}

