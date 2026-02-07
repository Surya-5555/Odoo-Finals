# 🔄 Odoo Finals - Subscription Management System

A comprehensive subscription management platform built with **NestJS**, **Prisma ORM**, and **PostgreSQL**. This enterprise-grade solution provides robust recurring billing capabilities, subscription lifecycle management, and customer portal functionality.

## 🌟 Features

### 🔁 Core Recurring Plan Engine
- **Flexible Billing Periods**: Daily, monthly, yearly billing cycles
- **Pricing Tiers**: Multiple pricing options per plan (e.g., monthly, 6-month, yearly)
- **Subscription Controls**: Auto-close, pausable, renewable options
- **Quantity Management**: Minimum quantity enforcement
- **Validity Management**: Start/end date controls with auto-expiration

### 📊 Subscription Management
- **Lifecycle Management**: Draft → Quotation → Confirmed → Active/Paused/Closed
- **Customer Portal**: Self-service subscription management
- **Quotation Templates**: Customizable document layouts
- **Payment Terms**: Flexible payment scheduling with early discounts
- **Invoice Generation**: Automated recurring billing
- **Multi-line Orders**: Product-based subscription lines with discounts and taxes

### 🔐 Authentication & Authorization
- **JWT-based Authentication**: Secure access token system
- **Role-based Access Control**: Admin, Internal, Portal user roles
- **Refresh Token Management**: Secure session handling
- **Password Reset Flow**: Email-based password recovery
- **Admin Bootstrap**: Automatic admin user creation

### 🏢 Business Entities
- **Contact Management**: Customer information and company details
- **Product Catalog**: Service/product definitions with pricing
- **Invoice System**: Automated billing with line-item details
- **Payment Terms**: Configurable payment conditions

## 🛠️ Technology Stack

- **Backend Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **Validation**: Class-validator & Class-transformer
- **Security**: Rate limiting with Throttler
- **Testing**: Jest (unit & e2e tests)

## 📦 Project Structure

```
Odoo-Finals/
├── backend/                    # NestJS API Server
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── contact/           # Customer management
│   │   ├── product/           # Product catalog
│   │   ├── recurring-plan/    # Subscription plans
│   │   ├── subscription/      # Subscription management
│   │   ├── invoice/           # Billing system
│   │   ├── payment-term/      # Payment conditions
│   │   └── quotation-template/ # Document templates
│   ├── prisma/               # Database schema & migrations
│   ├── test/                 # E2E tests
│   └── docs/                 # API documentation
└── docs/                     # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Odoo-Finals
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in backend directory
   cp .env.example .env
   
   # Configure the following variables:
   DATABASE_URL="postgresql://username:password@localhost:5432/odoo_subscription"
   JWT_SECRET="your-jwt-secret"
   JWT_REFRESH_SECRET="your-refresh-secret"
   ADMIN_EMAIL="admin@example.com"
   ADMIN_NAME="System Administrator"
   PORT=3000
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate deploy
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000`

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start in production mode**
   ```bash
   npm run start:prod
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication Endpoints

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/auth/signup` | POST | Public | Register new user |
| `/auth/login` | POST | Public | User login |
| `/auth/refresh` | POST | Public | Refresh access token |
| `/auth/logout` | POST | Public | User logout |
| `/auth/forgot-password` | POST | Public | Request password reset |
| `/auth/reset-password` | POST | Public | Reset password |
| `/auth/change-password` | POST | Protected | Change password |
| `/auth/internal-user` | POST | Admin Only | Create internal user |

### Business Endpoints

| Module | Endpoints | Description |
|--------|-----------|-------------|
| **Contacts** | `/contacts/*` | Customer management |
| **Products** | `/products/*` | Product catalog |
| **Recurring Plans** | `/recurring-plans/*` | Subscription plan management |
| **Subscriptions** | `/subscriptions/*` | Subscription lifecycle |
| **Invoices** | `/invoices/*` | Billing and invoicing |
| **Payment Terms** | `/payment-terms/*` | Payment conditions |
| **Quotation Templates** | `/quotation-templates/*` | Document templates |

### Authentication Headers
Protected endpoints require:
```
Authorization: Bearer <access_token>
```

## 🗃️ Database Schema

### Core Entities

- **User**: System users with role-based access
- **Contact**: Customer information and relationships
- **Product**: Service/product catalog
- **RecurringPlan**: Subscription plan definitions
- **RecurringPlanPrice**: Pricing tiers per plan
- **Subscription**: Customer subscriptions
- **SubscriptionLine**: Subscription line items
- **Invoice**: Billing documents
- **InvoiceLine**: Invoice line items
- **PaymentTerm**: Payment conditions
- **QuotationTemplate**: Document layouts

### Key Relationships
- Users can have associated Contacts
- Subscriptions link Contacts to RecurringPlans
- RecurringPlans have multiple pricing tiers
- Subscriptions contain multiple product lines
- Invoices are generated from Subscriptions

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start production server |
| `npm run start:dev` | Start development server with watch mode |
| `npm run start:debug` | Start server in debug mode |
| `npm run build` | Build for production |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | - |
| `ADMIN_EMAIL` | Default admin email | - |
| `ADMIN_NAME` | Default admin name | - |
| `PORT` | Server port | 3000 |

### Database Configuration
The application uses PostgreSQL with Prisma ORM. Ensure your database supports the required features and has appropriate indexes for performance.

## 👥 User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **ADMIN** | System administrator | Full system access |
| **INTERNAL** | Internal staff | Business operations |
| **PORTAL** | Customer users | Self-service portal |

## 📈 Subscription Lifecycle

```
DRAFT → QUOTATION_SENT → CONFIRMED → ACTIVE
                                   ↓
                            PAUSED ← → CLOSED
                                   ↓
                                CHURNED
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the UNLICENSED License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Review the [API Documentation](backend/docs/)
- Check the [Testing Guide](backend/docs/TESTING_GUIDE.md)
- Refer to the [Postman Collection](backend/docs/Odoo-Subscription-API.postman_collection.json)

## 🔄 Version History

- **v0.0.1** - Initial release with core subscription management features

---

**Built with ❤️ for modern subscription businesses**
