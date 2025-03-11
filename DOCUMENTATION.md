# Mortgage Rate Monitor Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Architecture](#architecture)
4. [Frontend](#frontend)
5. [Backend](#backend)
6. [Database](#database)
7. [API Reference](#api-reference)
8. [Deployment](#deployment)
9. [Security](#security)
10. [Development Guidelines](#development-guidelines)
11. [Features & Functionality](#features-functionality)
12. [Troubleshooting](#troubleshooting)
13. [Best Practices](#best-practices)
14. [Integrations](#integrations)
15. [Maintenance](#maintenance)
16. [Scaling & Performance](#scaling-performance)
17. [Compliance & Regulations](#compliance-regulations)
18. [Disaster Recovery](#disaster-recovery)

## Project Overview

Mortgage Rate Monitor is a comprehensive platform for mortgage professionals to track rates and manage client relationships. The system consists of:

- React-based frontend with TypeScript
- Supabase backend for database and authentication
- Edge Functions for serverless computing
- Real-time rate monitoring system
- Client management portal
- Subscription-based billing system

### Key Features
- Real-time mortgage rate tracking
- Client portfolio management
- Automated rate alerts
- Subscription management
- Analytics dashboard
- Secure authentication

### Business Logic
- Rate monitoring during business hours (9 AM - 5 PM EST)
- Automated alerts when rates meet client criteria
- Client data synchronization with CRM systems
- Subscription tier limitations and features
- Analytics and reporting calculations
- Rate caching and validation
- Automated notification delivery
- Client portfolio optimization

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm 9.x or higher
- Git
- Supabase CLI
- Stripe CLI (for local webhook testing)
- Docker (optional, for local development)

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/mortgage-rate-monitor.git
cd mortgage-rate-monitor
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
cd api && npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

### Environment Setup
Required environment variables:
\`\`\`
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_ACCESS_TOKEN=your_access_token
SUPABASE_PROJECT_ID=your_project_id
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API Keys
VITE_FRED_API_KEY=your_fred_api_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Feature Flags
ENABLE_NOTIFICATIONS=true
ENABLE_RATE_ALERTS=true

# Rate Monitoring
RATE_UPDATE_INTERVAL=3600000
BUSINESS_HOURS_START=8
BUSINESS_HOURS_END=18
RATE_CACHE_DURATION=3600000

# Performance
MAX_CONNECTIONS=100
QUERY_TIMEOUT=30000
RATE_LIMIT=100
\`\`\`

## Architecture

### System Overview
The application follows a modern web architecture:

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase + Edge Functions
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Deployment**: Netlify (frontend) + Supabase (backend)

### Directory Structure
\`\`\`
├── src/                  # Frontend source code
│   ├── components/       # React components
│   │   ├── auth/        # Authentication components
│   │   ├── clients/     # Client management components
│   │   └── layout/      # Layout components
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   │   ├── debug/       # Debugging utilities
│   │   └── utils/       # Helper functions
│   ├── pages/           # Page components
│   ├── services/        # API services
│   └── types/           # TypeScript types
├── api/                 # Backend code
│   ├── supabase/        # Supabase configuration
│   │   ├── functions/   # Edge Functions
│   │   └── migrations/  # Database migrations
├── public/              # Static assets
└── .github/             # GitHub Actions workflows
\`\`\`

### Data Flow
1. User interactions trigger React component events
2. Events handled by custom hooks or context
3. API calls made through service layer
4. Edge Functions process requests
5. Database operations through RLS policies
6. Real-time updates via Supabase subscriptions
7. Error handling and recovery
8. Cache management
9. Event logging and monitoring

### System Components
1. Rate Monitoring Service
   - FRED API integration
   - Rate validation
   - Cache management
   - Alert processing

2. Client Management System
   - Portfolio tracking
   - Document management
   - Communication tools
   - Activity logging

3. Notification System
   - Email notifications
   - In-app alerts
   - Push notifications (future)
   - Notification preferences

4. Analytics Engine
   - Rate trend analysis
   - Portfolio metrics
   - Performance tracking
   - Custom reports

5. Subscription Management
   - Stripe integration
   - Plan management
   - Usage tracking
   - Billing history

## Frontend

### Component Architecture
The frontend uses a component-based architecture with React:

- **Pages**: Top-level route components
- **Components**: Reusable UI components
- **Contexts**: Global state management
- **Hooks**: Shared business logic

### State Management
- React Context for global state
- Custom hooks for data fetching
- Local component state where appropriate
- Real-time subscriptions for live updates
- Optimistic updates
- Error boundary handling

### Key Technologies
- React 18
- TypeScript
- Tailwind CSS
- Vite
- React Router
- Recharts for data visualization

### Performance Optimizations
- Code splitting with React.lazy
- Memoization with useMemo and useCallback
- Debounced API calls
- Cached responses
- Optimized re-renders
- Image lazy loading
- Bundle size optimization
- Tree shaking
- Resource prefetching
- Service worker caching

### Error Handling
- Global error boundary
- API error recovery
- Network error handling
- Retry mechanisms
- Fallback UI components
- Error logging and tracking

## Backend

### Supabase Configuration
The backend uses Supabase for:
- Database
- Authentication
- Real-time subscriptions
- Edge Functions
- Storage
- Row Level Security
- Automated backups
- Rate limiting

### Edge Functions
Located in \`api/supabase/functions/\`:
- \`fetch-rates\`: Fetches current mortgage rates
- \`stripe-webhook\`: Handles Stripe webhook events
- \`create-checkout-session\`: Creates Stripe checkout sessions
- \`get-subscription\`: Retrieves subscription status
- \`cancel-subscription\`: Handles subscription cancellation
- \`sync-client-data\`: Syncs client data with CRM
- \`send-notifications\`: Handles notification delivery
- \`generate-analytics\`: Generates analytics reports

### Rate Monitoring System
- Fetches rates during business hours
- Caches responses for 1 hour
- Handles rate limit restrictions
- Provides fallback mechanisms
- Validates rate data
- Triggers notifications
- Historical data tracking
- Rate comparison logic
- Alert processing
- Cache invalidation

### Error Recovery
- Automatic retries
- Circuit breaker pattern
- Fallback data sources
- Error logging
- Alert notifications
- Manual intervention procedures

## Database

### Tables

#### profiles
\`\`\`sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
\`\`\`

#### clients
\`\`\`sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID REFERENCES profiles(id) NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
\`\`\`

#### mortgages
\`\`\`sql
CREATE TABLE mortgages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  current_rate DECIMAL(5,3) NOT NULL,
  target_rate DECIMAL(5,3) NOT NULL,
  loan_amount DECIMAL(12,2) NOT NULL,
  term_years INTEGER NOT NULL,
  start_date DATE NOT NULL,
  lender TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
\`\`\`

#### rate_history
\`\`\`sql
CREATE TABLE rate_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_date DATE NOT NULL,
  rate_type TEXT NOT NULL,
  rate_value DECIMAL(5,3) NOT NULL,
  term_years INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
\`\`\`

#### subscriptions
\`\`\`sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL,
  price_id TEXT NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
\`\`\`

### Database Indexes
\`\`\`sql
-- Performance indexes
CREATE INDEX mortgages_client_id_idx ON mortgages(client_id);
CREATE INDEX mortgages_rates_idx ON mortgages(current_rate, target_rate);
CREATE INDEX rate_history_date_idx ON rate_history(rate_date);
CREATE INDEX rate_history_term_idx ON rate_history(term_years);
CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX clients_broker_id_idx ON clients(broker_id);
CREATE INDEX profiles_updated_at_idx ON profiles(updated_at);
\`\`\`

### Row Level Security (RLS)
All tables implement RLS policies to ensure data security:
- Users can only access their own data
- Brokers can only access their own clients
- Rate history is publicly readable
- Service role has full access
- Automated policy testing

### Database Maintenance
- Regular vacuuming
- Index optimization
- Query performance monitoring
- Connection pooling
- Backup procedures
- Recovery testing

## API Reference

### Rate Monitoring

#### Fetch Current Rates
\`\`\`typescript
GET /functions/fetch-rates
Response: MortgageRate[]
\`\`\`

#### Get Rate History
\`\`\`typescript
GET /rest/v1/rate_history
Query params: 
  - start_date: string
  - end_date: string
Response: RateHistory[]
\`\`\`

### Client Management

#### Create Client
\`\`\`typescript
POST /rest/v1/clients
Body: {
  first_name: string
  last_name: string
  email: string
  phone?: string
}
\`\`\`

#### Update Client
\`\`\`typescript
PATCH /rest/v1/clients
Body: {
  id: string
  [field]: value
}
\`\`\`

### Subscription Management

#### Create Checkout Session
\`\`\`typescript
POST /functions/create-checkout-session
Body: {
  priceId: string
}
\`\`\`

#### Cancel Subscription
\`\`\`typescript
POST /functions/cancel-subscription
\`\`\`

## Deployment

### Frontend Deployment (Netlify)
The frontend is automatically deployed via GitHub Actions:
- Production: On merge to main branch
- Preview: On pull requests
- Staging: On specific branch pushes
- Environment-specific configurations
- Build optimization
- Cache management

### Backend Deployment (Supabase)
Edge Functions and database migrations are deployed via GitHub Actions:
- Staging deployment on pull requests
- Production deployment on merge to main
- Database migration safety checks
- Rollback procedures
- Zero-downtime updates

### Environment Variables
Required environment variables:
\`\`\`
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_FRED_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
\`\`\`

### Deployment Checklist
1. Run test suite
2. Build optimization
3. Database migration check
4. Environment variable validation
5. SSL certificate check
6. DNS configuration
7. Cache warming
8. Health check verification
9. Monitoring setup
10. Backup verification

## Security

### Authentication
- Email/password authentication
- JWT tokens with refresh
- Session management
- Password reset flow
- MFA support (future)
- Session timeout
- Device tracking
- Login attempt monitoring

### Data Protection
- Row Level Security (RLS) policies
- Encrypted data in transit and at rest
- Regular security audits
- GDPR compliance measures
- Data backup procedures
- Access logging
- Data retention policies
- Encryption key management

### API Security
- Rate limiting
- CORS policies
- Input validation
- Request authentication
- API key rotation
- Request signing
- IP whitelisting
- Security headers

### Security Best Practices
- Regular dependency updates
- Security patch management
- Audit logging
- Incident response plan
- Security training
- Penetration testing
- Vulnerability scanning
- Security documentation

## Development Guidelines

### Code Style
- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Component naming conventions
- Code documentation requirements
- Import ordering
- Error handling patterns
- Testing requirements

### Git Workflow
1. Create feature branch
2. Make changes
3. Submit pull request
4. Code review
5. Merge to main
6. Version tagging
7. Changelog updates
8. Documentation updates

### Testing
- Unit tests with Vitest
- Integration tests
- E2E tests (future)
- Test coverage requirements
- Performance testing
- Load testing
- Security testing
- Accessibility testing

### Performance
- Code splitting
- Lazy loading
- Image optimization
- Caching strategies
- Bundle size monitoring
- Performance budgets
- Lighthouse scores
- Core Web Vitals

### Monitoring
- Error tracking
- Performance monitoring
- Usage analytics
- Uptime monitoring
- User behavior tracking
- Resource utilization
- Cost monitoring
- SLA compliance

## Features & Functionality

### Rate Monitoring
- Real-time rate tracking
- Historical rate analysis
- Rate comparison tools
- Custom rate alerts
- Rate trend visualization
- Market analysis
- Prediction modeling
- Alert customization

### Client Management
- Client portfolio overview
- Client communication tools
- Document management
- Task tracking
- Client notes and history
- Activity logging
- Communication history
- Document versioning

### Analytics
- Portfolio performance metrics
- Rate trend analysis
- Client engagement metrics
- Revenue tracking
- Custom reports
- Export capabilities
- Data visualization
- Predictive analytics

### Notifications
- Rate alert notifications
- System updates
- Client activity alerts
- Task reminders
- Custom notification rules
- Delivery preferences
- Notification history
- Priority levels

## Troubleshooting

### Common Issues
1. Rate fetching errors
   - Check API key validity
   - Verify business hours
   - Check rate limits
   - Validate response format
   - Network connectivity
   - Cache status

2. Authentication issues
   - Clear browser cache
   - Check token expiration
   - Verify credentials
   - Check network connectivity
   - Session status
   - Cookie settings

3. Performance issues
   - Monitor API response times
   - Check database query performance
   - Analyze client-side rendering
   - Review caching implementation
   - Network latency
   - Resource utilization

### Debugging Tools
- Browser DevTools
- Network request logging
- Error tracking system
- Performance monitoring
- Database query analyzer
- Log aggregation
- Metrics dashboard
- Trace analysis

## Best Practices

### Code Organization
- Feature-based directory structure
- Consistent naming conventions
- Clear separation of concerns
- Modular component design
- Reusable utility functions
- Type safety
- Error boundaries
- Performance optimization

### Performance
- Optimize bundle size
- Implement caching
- Use proper memoization
- Optimize database queries
- Minimize network requests
- Image optimization
- Code splitting
- Resource prefetching

### Security
- Input validation
- Data sanitization
- Secure authentication
- Regular security audits
- Access control implementation
- Encryption
- Security headers
- Rate limiting

### Testing
- Unit test coverage
- Integration testing
- End-to-end testing
- Performance testing
- Security testing
- Load testing
- Accessibility testing
- Cross-browser testing

## Integrations

### Third-Party Services
- Stripe for payments
- FRED API for rate data
- Email service providers
- Analytics platforms
- CRM systems
- Document storage
- Monitoring services
- Error tracking

### API Integrations
- Rate data providers
- Payment processors
- Notification services
- Analytics services
- Document storage
- CRM systems
- Email providers
- SMS gateways

## Maintenance

### Regular Tasks
- Database backups
- Security updates
- Dependency updates
- Performance monitoring
- Error log review
- Cache clearing
- Index optimization
- SSL renewal

### Update Procedures
1. Review change requirements
2. Test in staging environment
3. Deploy to production
4. Monitor for issues
5. Document changes
6. Update documentation
7. Notify stakeholders
8. Verify functionality

### Backup Procedures
- Daily database backups
- File storage backups
- Configuration backups
- Disaster recovery plan
- Backup testing schedule
- Retention policies
- Recovery testing
- Verification procedures

### Monitoring
- System health checks
- Performance metrics
- Error tracking
- User activity monitoring
- Resource utilization
- Cost tracking
- Security monitoring
- Compliance checks

## Scaling & Performance

### Database Scaling
- Connection pooling
- Query optimization
- Index management
- Partitioning strategy
- Replication setup
- Backup procedures
- Recovery testing
- Performance monitoring

### Application Scaling
- Load balancing
- Caching strategy
- Resource allocation
- Auto-scaling rules
- Performance budgets
- Monitoring setup
- Alert thresholds
- Capacity planning

### Performance Optimization
- Code optimization
- Asset optimization
- Caching strategy
- CDN configuration
- Database tuning
- Network optimization
- Resource management
- Monitoring tools

## Compliance & Regulations

### Data Protection
- GDPR compliance
- Data retention
- Privacy policy
- Terms of service
- Cookie policy
- Consent management
- Data portability
- Right to be forgotten

### Security Standards
- SSL/TLS encryption
- Data encryption
- Access controls
- Audit logging
- Security monitoring
- Incident response
- Vulnerability management
- Security training

### Regulatory Requirements
- Financial regulations
- Data protection laws
- Industry standards
- Compliance reporting
- Audit procedures
- Documentation requirements
- Training requirements
- Update procedures

## Disaster Recovery

### Backup Strategy
- Database backups
- File backups
- Configuration backups
- Code repository
- Documentation
- Recovery procedures
- Testing schedule
- Verification process

### Recovery Procedures
1. Assess incident
2. Initiate recovery plan
3. Restore from backup
4. Verify data integrity
5. Test functionality
6. Document incident
7. Update procedures
8. Preventive measures

### Business Continuity
- Failover procedures
- Alternative systems
- Communication plan
- Team responsibilities
- Recovery timeline
- Testing schedule
- Documentation
- Training requirements