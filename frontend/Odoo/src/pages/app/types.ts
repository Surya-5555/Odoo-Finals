export type ListResponse<T> = { data: T[]; total: number }

export type BillingPeriodUnit = 'DAY' | 'MONTH' | 'YEAR'

export type RecurringPlanPrice = {
	id: number
	recurringPlanId: number
	price: number
	billingPeriodValue: number
	billingPeriodUnit: BillingPeriodUnit
	isDefault: boolean
}

export type RecurringPlan = {
	id: number
	name: string
	minQuantity: number
	startDate: string | null
	endDate: string | null
	autoClose: boolean
	autoCloseValidityDays: number | null
	pausable: boolean
	renewable: boolean
	closable: boolean
	prices: RecurringPlanPrice[]
	createdAt: string
	updatedAt: string
}

export type Product = {
	id: number
	name: string
	productType: string | null
	salesPrice: number
	costPrice: number | null
	description: string | null
	createdAt: string
	updatedAt: string
}

export type Contact = {
	id: number
	name: string
	email: string
	phone: string | null
	address?: string | null
	companyName?: string | null
	userId?: number | null
	activeSubscriptionsCount?: number
}

export type PaymentTerm = {
	id: number
	name: string
	dueAfterDays: number
	earlyDiscountPercent: number | null
	earlyDiscountFixed: number | null
	earlyDiscountDays: number | null
	createdAt: string
	updatedAt: string
}

export type QuotationTemplate = {
	id: number
	name: string
	content: string | null
	createdAt: string
	updatedAt: string
}

export type Tax = {
	id: number
	name: string
	percent: number
	isActive: boolean
	createdAt: string
	updatedAt: string
}

export type Discount = {
	id: number
	code: string
	percent: number
	isActive: boolean
	startsAt: string | null
	endsAt: string | null
	limitUsage?: boolean
	usageLimit?: number | null
	timesUsed?: number
	productId?: number | null
	createdAt: string
	updatedAt: string
}

export type SubscriptionState = 'DRAFT' | 'QUOTATION_SENT' | 'CONFIRMED' | 'PAUSED' | 'CLOSED' | 'CHURNED'

export type SubscriptionLine = {
	id: number
	productId: number
	product: Product
	quantity: number
	unitPrice: number
	discountPercent: number | null
	taxPercent: number | null
	amount: number
}

export type Subscription = {
	id: number
	number: string
	contactId: number
	contact: Contact
	recurringPlanId: number
	recurringPlan: RecurringPlan
	state: SubscriptionState
	expirationDate: string | null
	quotationTemplateId: number | null
	orderDate: string | null
	startDate: string | null
	nextInvoiceDate: string | null
	paymentTermId: number | null
	salespersonId: number | null
	lines: SubscriptionLine[]
	createdAt: string
	updatedAt: string
}

export type InvoiceState = 'DRAFT' | 'CONFIRMED' | 'PAID' | 'CANCELLED'

export type PaymentMethod = 'ONLINE' | 'CASH'

export type InvoiceLine = {
	id: number
	productId: number
	description: string | null
	quantity: number
	unitPrice: number
	taxPercent: number | null
	amount: number
}

export type Invoice = {
	id: number
	number: string
	subscriptionId: number
	contactId: number
	invoiceDate: string
	dueDate: string
	state: InvoiceState
	paymentMethod?: PaymentMethod | null
	paymentDate?: string | null
	lines?: InvoiceLine[]
	createdAt: string
	updatedAt: string
}
