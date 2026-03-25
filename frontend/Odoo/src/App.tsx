import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { LoginPage } from '@/pages/LoginPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { SignupPage } from '@/pages/SignupPage'
import { RequireRole } from '@/components/auth/RequireRole'
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
import { PortalHomePage } from '@/pages/portal/PortalHomePage'
import { PortalCartPage } from '@/pages/portal/PortalCartPage'
import { PortalUserDetailsPage } from '@/pages/portal/PortalUserDetailsPage'
import { PortalOrdersPage } from '@/pages/portal/PortalOrdersPage'
import { PortalOrderDetailPage } from '@/pages/portal/PortalOrderDetailPage'
import { PortalInvoicePage } from '@/pages/portal/PortalInvoicePage'

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
          <RequireRole roles={['ADMIN', 'INTERNAL']} redirectTo="/portal/home">
            <PageShell />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="/app/overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />

        <Route
          element={
            <RequireRole roles={['ADMIN']} redirectTo="/app/overview">
              <Outlet />
            </RequireRole>
          }
        >
          <Route path="recurring-plans" element={<RecurringPlansPage />} />
          <Route path="recurring-plans/new" element={<RecurringPlanFormPage mode="create" />} />
          <Route path="recurring-plans/:id" element={<RecurringPlanFormPage mode="edit" />} />

          <Route path="quotation-templates" element={<QuotationTemplatesPage />} />
          <Route path="quotation-templates/new" element={<QuotationTemplateFormPage mode="create" />} />
          <Route path="quotation-templates/:id" element={<QuotationTemplateFormPage mode="edit" />} />

          <Route path="payment-terms" element={<PaymentTermsPage />} />
          <Route path="payment-terms/new" element={<PaymentTermFormPage mode="create" />} />
          <Route path="payment-terms/:id" element={<PaymentTermFormPage mode="edit" />} />

          <Route path="taxes" element={<TaxesPage />} />
          <Route path="taxes/new" element={<TaxFormPage mode="create" />} />
          <Route path="taxes/:id" element={<TaxFormPage mode="edit" />} />

          <Route path="discounts" element={<DiscountsPage />} />
          <Route path="discounts/new" element={<DiscountFormPage mode="create" />} />
          <Route path="discounts/:id" element={<DiscountFormPage mode="edit" />} />

          <Route path="reporting" element={<ReportingPage />} />
          <Route path="configuration" element={<ConfigurationPage />} />
        </Route>

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

        <Route path="my-profile" element={<MyProfilePage />} />
      </Route>

      <Route
        path="/portal"
        element={
          <RequireRole roles={['PORTAL']} redirectTo="/app/overview">
            <PortalShell />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="/portal/home" replace />} />
        <Route path="home" element={<PortalHomePage />} />
        <Route path="shop" element={<PortalShopPage />} />
        <Route path="search" element={<PortalSearchPage />} />
        <Route path="products/:id" element={<PortalProductDetailPage />} />
        <Route path="cart" element={<PortalCartPage />} />
        <Route path="checkout" element={<PortalCheckoutPage />} />
        <Route path="order-success" element={<PortalOrderSuccessPage />} />
        <Route path="profile" element={<PortalProfilePage />} />

        <Route path="account/user-details" element={<PortalUserDetailsPage />} />
        <Route path="orders" element={<PortalOrdersPage />} />
        <Route path="orders/:id" element={<PortalOrderDetailPage />} />
        <Route path="invoices/:id" element={<PortalInvoicePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
