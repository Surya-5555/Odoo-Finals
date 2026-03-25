import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  FileText,
  RefreshCw,
  Shield,
  Users,
  Zap,
  ChevronRight,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ constants ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */

const FEATURES = [
  {
    icon: RefreshCw,
    title: 'Recurring Plans',
    desc: 'Define flexible billing cycles ΓÇö weekly, monthly, yearly ΓÇö with automated renewals.',
  },
  {
    icon: FileText,
    title: 'Smart Invoicing',
    desc: 'Generate, track, and manage invoices tied to every subscription lifecycle event.',
  },
  {
    icon: Users,
    title: 'Contact Management',
    desc: 'Centralised customer records with role-based access and portal self-service.',
  },
  {
    icon: CreditCard,
    title: 'Payment Terms',
    desc: 'Customisable payment schedules, early-pay discounts, and grace period rules.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Reporting',
    desc: 'Revenue analytics, MRR tracking, churn metrics ΓÇö all in one dashboard.',
  },
  {
    icon: Shield,
    title: 'Role-based Access',
    desc: 'Admin, internal, and portal roles ensure data stays in the right hands.',
  },
] as const

const PRICING = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    desc: 'For small teams getting started',
    features: ['Up to 50 subscriptions', '1 admin user', 'Basic reporting', 'Email support'],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$49',
    period: '/mo',
    desc: 'For growing businesses',
    features: [
      'Unlimited subscriptions',
      'Up to 10 users',
      'Advanced reporting',
      'Priority support',
      'Custom payment terms',
      'API access',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large organisations',
    features: [
      'Everything in Professional',
      'Unlimited users',
      'Dedicated account manager',
      'SSO & audit logs',
      'Custom integrations',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
] as const

/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ page component ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ΓöÇΓöÇΓöÇΓöÇΓöÇ Navbar ΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">SubFlow</span>
          </button>

          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-sm" onClick={() => navigate('/login')}>
              Log in
            </Button>
            <Button className="text-sm" onClick={() => navigate('/signup')}>
              Sign up
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ΓöÇΓöÇΓöÇΓöÇΓöÇ Hero ΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <section className="relative">
        {/* Subtle gradient blobs */}
        <div
          className="pointer-events-none absolute -top-40 -left-40 w-150 h-150 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(316 50% 60%) 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute top-20 right-0 w-125 h-125 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(260 60% 65%) 0%, transparent 70%)' }}
        />

        <div className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-muted/40 text-sm text-muted-foreground mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Now in public beta
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            Subscription management
            <br />
            <span className="text-primary">made effortless</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Create recurring plans, automate invoicing, and keep your customers happy ΓÇö all from one
            clean, powerful dashboard.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-base px-8" onClick={() => navigate('/signup')}>
              Get started free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              See features
            </Button>
          </div>

          {/* Dashboard preview */}
          <div className="mt-20 relative mx-auto max-w-4xl">
            <div className="rounded-xl border border-border/60 bg-card shadow-2xl shadow-primary/5 overflow-hidden">
              {/* Mock browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/40">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400/70" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
                  <span className="w-3 h-3 rounded-full bg-green-400/70" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-background/80 text-xs text-muted-foreground border border-border/40 max-w-xs w-full text-center">
                    app.subflow.io/dashboard
                  </div>
                </div>
              </div>
              {/* Dashboard mock content */}
              <div className="p-6 sm:p-8 grid grid-cols-3 gap-4">
                {[
                  { label: 'Active Subscriptions', value: '1,248', change: '+12%' },
                  { label: 'Monthly Revenue', value: '$84,320', change: '+8.3%' },
                  { label: 'Churn Rate', value: '2.1%', change: '-0.4%' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-border/40 bg-background p-4 text-left"
                  >
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-xl sm:text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                  </div>
                ))}
                {/* Chart placeholder */}
                <div className="col-span-3 rounded-lg border border-border/40 bg-background p-4 h-40 flex items-end gap-1.5">
                  {[40, 55, 35, 70, 50, 80, 65, 90, 75, 60, 85, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t transition-all"
                      style={{
                        height: `${h}%`,
                        background: `hsl(316 20% ${35 + i * 2}%)`,
                        opacity: 0.7 + i * 0.025,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            {/* Glow effect under the card */}
            <div
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 rounded-full blur-2xl opacity-20"
              style={{ background: 'hsl(316 30% 50%)' }}
            />
          </div>
        </div>
      </section>

      {/* ΓöÇΓöÇΓöÇΓöÇΓöÇ Features ΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <section id="features" className="py-24 border-t border-border/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything you need to manage subscriptions
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              A complete toolkit designed for modern subscription businesses ΓÇö no patchwork of
              tools, no spreadsheets.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 transition-colors group-hover:bg-primary/15">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ΓöÇΓöÇΓöÇΓöÇΓöÇ How It Works ΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <section id="how-it-works" className="py-24 bg-muted/30 border-t border-border/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
              How It Works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: '01',
                title: 'Set up your plans',
                desc: 'Define recurring plans with custom billing cycles, pricing tiers, and trial periods.',
              },
              {
                step: '02',
                title: 'Add your products',
                desc: 'Catalogue your products and services, assign taxes, discounts, and quotation templates.',
              },
              {
                step: '03',
                title: 'Launch & grow',
                desc: 'Your customers subscribe through the portal. Invoices, renewals, and reporting happen automatically.',
              },
            ].map((s, i) => (
              <div key={s.step} className="relative text-center md:text-left">
                <span className="text-5xl font-bold text-primary/10">{s.step}</span>
                <h3 className="text-xl font-semibold mt-2 mb-3">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                {i < 2 && (
                  <ChevronRight className="hidden md:block absolute -right-6 top-8 w-5 h-5 text-primary/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ΓöÇΓöÇΓöÇΓöÇΓöÇ Pricing ΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <section id="pricing" className="py-24 border-t border-border/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
              Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-6 flex flex-col transition-all ${
                  plan.highlighted
                    ? 'border-primary bg-primary/3 shadow-xl shadow-primary/10 scale-[1.02]'
                    : 'border-border/50 bg-card hover:border-primary/20'
                }`}
              >
                {plan.highlighted && (
                  <span className="text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1 self-start mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlighted ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => navigate('/signup')}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ΓöÇΓöÇΓöÇΓöÇΓöÇ CTA ΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <section className="py-24 border-t border-border/30">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to streamline your subscriptions?
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
            Join hundreds of businesses that trust SubFlow to manage their recurring revenue.
          </p>
          <div className="mt-10">
            <Button size="lg" className="text-base px-10" onClick={() => navigate('/signup')}>
              Create your free account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ΓöÇΓöÇΓöÇΓöÇΓöÇ Footer ΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <footer className="border-t border-border/40 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Zap className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">SubFlow</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SubFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
