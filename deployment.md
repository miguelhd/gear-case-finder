# Deployment Configuration for Gear Case Finder

This file contains the necessary configuration for deploying the Gear Case Finder application to production.

## Environment Variables

Create a `.env.production` file with the following variables:

```
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/gear-case-finder
API_URL=https://api.gear-case-finder.com
NEXT_PUBLIC_SITE_URL=https://gear-case-finder.com
```

## Build Configuration

The application uses Next.js for both frontend and backend. The build process compiles TypeScript, optimizes assets, and generates static files where possible.

## Deployment Steps

1. Install dependencies: `npm install`
2. Build the application: `npm run build`
3. Start the production server: `npm start`

## Server Requirements

- Node.js 16.x or higher
- MongoDB 5.x or higher
- 1GB RAM minimum (2GB recommended)
- 10GB storage minimum

## Monitoring Configuration

The application includes built-in monitoring for:
- API performance
- Database connections
- Scraper jobs
- Cache performance

Logs are stored in the `/logs` directory and should be rotated regularly.

## Backup Strategy

Database backups should be performed daily and stored in a secure location.

## Scaling Considerations

The application can be scaled horizontally by deploying multiple instances behind a load balancer.
