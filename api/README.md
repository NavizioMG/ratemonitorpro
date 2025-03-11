# Mortgage Rate Monitor API

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Set up environment-specific configurations:
   - For staging: Copy `.env.example` to `.env.staging`
   - For production: Copy `.env.example` to `.env.production`

3. Update the environment files with the appropriate values for each environment.

## Deployment

### Staging

To deploy to the staging environment:

```bash
npm run deploy:staging
```

This will:
- Load staging environment variables
- Deploy database migrations
- Deploy Edge Functions
- Set up secrets

### Production

To deploy to the production environment:

```bash
npm run deploy:production
```

This will:
- Prompt for confirmation
- Load production environment variables
- Deploy database migrations
- Deploy Edge Functions
- Set up secrets

## Security Notes

- Never commit environment files (`.env.*`) to version control
- Keep production credentials secure and separate from staging
- Use different API keys and secrets for each environment
- Regularly rotate production secrets

## Available Scripts

- `npm run dev` - Start local development environment
- `npm run deploy:staging` - Deploy to staging
- `npm run deploy:production` - Deploy to production
- `npm run setup-secrets` - Set up environment secrets
- `npm test` - Run tests
- `npm run lint` - Run linting