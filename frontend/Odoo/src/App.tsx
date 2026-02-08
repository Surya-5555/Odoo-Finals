import { Navigate, Route, Routes } from 'react-router-dom'

import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { LoginPage } from '@/pages/LoginPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { SignupPage } from '@/pages/SignupPage'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { PageShell } from '@/components/dashboard/PageShell'

import { OverviewPage } from '@/pages/app/OverviewPage'
import { RecurringPlansPage } from '@/pages/app/recurring-plans/RecurringPlansPage'
import { RecurringPlanFormPage } from '@/pages/app/recurring-plans/RecurringPlanFormPage'
import { ProductsPage } from '@/pages/app/products/ProductsPage'
import { ProductFormPage } from '@/pages/app/products/ProductFormPage'
import { SubscriptionsPage } from '@/pages/app/subscriptions/SubscriptionsPage'
import { SubscriptionFormPage } from '@/pages/app/subscriptions/SubscriptionFormPage'
import { SubscriptionDetailPage } from '@/pages/app/subscriptions/SubscriptionDetailPage'
import { InvoicesPage } from '@/pages/app/invoices/InvoicesPage'
import { InvoiceDetailPage } from '@/pages/app/invoices/InvoiceDetailPage'
import { ContactsPage } from '@/pages/app/contacts/ContactsPage'
import { ContactFormPage } from '@/pages/app/contacts/ContactFormPage'
import { PaymentTermsPage } from '@/pages/app/payment-terms/PaymentTermsPage'
import { PaymentTermFormPage } from '@/pages/app/payment-terms/PaymentTermFormPage'
import { QuotationTemplatesPage } from '@/pages/app/quotation-templates/QuotationTemplatesPage'
import { QuotationTemplateFormPage } from '@/pages/app/quotation-templates/QuotationTemplateFormPage'
import { ReportingPage } from '@/pages/app/ReportingPage'
import { ConfigurationPage } from '@/pages/app/ConfigurationPage'
import { MyProfilePage } from '@/pages/app/MyProfilePage'
import { TaxesPage } from '@/pages/app/taxes/TaxesPage'
import { TaxFormPage } from '@/pages/app/taxes/TaxFormPage'
import { DiscountsPage } from '@/pages/app/discounts/DiscountsPage'
import { DiscountFormPage } from '@/pages/app/discounts/DiscountFormPage'

import { PortalShell } from '@/components/portal/PortalShell'
import { PortalShopPage } from '@/pages/portal/PortalShopPage'
import { PortalSearchPage } from '@/pages/portal/PortalSearchPage'
import { PortalProductDetailPage } from '@/pages/portal/PortalProductDetailPage'
import { PortalCheckoutPage } from '@/pages/portal/PortalCheckoutPage'
import { PortalOrderSuccessPage } from '@/pages/portal/PortalOrderSuccessPage'
import { PortalProfilePage } from '@/pages/portal/PortalProfilePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/dashboard" element={<Navigate to="/app" replace />} />

      <Route
        path="/app"
        element={
          <RequireAuth>
            <PageShell />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/app/overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />

        <Route path="recurring-plans" element={<RecurringPlansPage />} />
        <Route path="recurring-plans/new" element={<RecurringPlanFormPage mode="create" />} />
        <Route path="recurring-plans/:id" element={<RecurringPlanFormPage mode="edit" />} />

        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductFormPage mode="create" />} />
        <Route path="products/:id" element={<ProductFormPage mode="edit" />} />

        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="subscriptions/new" element={<SubscriptionFormPage mode="create" />} />
        <Route path="subscriptions/:id" element={<SubscriptionDetailPage />} />
        <Route path="subscriptions/:id/edit" element={<SubscriptionFormPage mode="edit" />} />

        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/:id" element={<InvoiceDetailPage />} />

        <Route path="contacts" element={<ContactsPage />} />
        <Route path="contacts/new" element={<ContactFormPage mode="create" />} />
        <Route path="contacts/:id" element={<ContactFormPage mode="edit" />} />

        <Route path="payment-terms" element={<PaymentTermsPage />} />
        <Route path="payment-terms/new" element={<PaymentTermFormPage mode="create" />} />
        <Route path="payment-terms/:id" element={<PaymentTermFormPage mode="edit" />} />

        <Route path="quotation-templates" element={<QuotationTemplatesPage />} />
        <Route path="quotation-templates/new" element={<QuotationTemplateFormPage mode="create" />} />
        <Route path="quotation-templates/:id" element={<QuotationTemplateFormPage mode="edit" />} />

        <Route path="taxes" element={<TaxesPage />} />
        <Route path="taxes/new" element={<TaxFormPage mode="create" />} />
        <Route path="taxes/:id" element={<TaxFormPage mode="edit" />} />

        <Route path="discounts" element={<DiscountsPage />} />
        <Route path="discounts/new" element={<DiscountFormPage mode="create" />} />
        <Route path="discounts/:id" element={<DiscountFormPage mode="edit" />} />

        <Route path="reporting" element={<ReportingPage />} />
        <Route path="configuration" element={<ConfigurationPage />} />
        <Route path="my-profile" element={<MyProfilePage />} />
      </Route>

      <Route
        path="/portal"
        element={
          <RequireAuth>
            <PortalShell />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/portal/shop" replace />} />
        <Route path="shop" element={<PortalShopPage />} />
        <Route path="search" element={<PortalSearchPage />} />
        <Route path="products/:id" element={<PortalProductDetailPage />} />
        <Route path="checkout" element={<PortalCheckoutPage />} />
        <Route path="order-success" element={<PortalOrderSuccessPage />} />
        <Route path="profile" element={<PortalProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
