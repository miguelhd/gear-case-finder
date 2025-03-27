# Vercel Deployment Guide

This document provides guidance on deploying the Gear Case Finder application to Vercel, including common issues and their solutions.

## Deployment Architecture

The Gear Case Finder application is designed to work in Vercel's serverless environment with the following considerations:

1. **Directory Structure**
   - Production code is kept in the `src` directory
   - Development and testing scripts are kept in `.vercel-exclude` directory to prevent them from being included in the build

2. **Environment Variables**
   - MongoDB connection string is stored in Vercel environment variables
   - Local development uses `.env.local` for environment variables

3. **File Storage**
   - In production (Vercel), temporary files are stored in `/tmp` directory
   - In local development, files are stored in appropriate directories (`./data`, `./logs`, `./public/images`)

4. **API Routes**
   - API routes are designed to work in a serverless environment
   - Each route handles its own error cases and returns appropriate status codes

## Common Issues and Solutions

### TypeScript Errors

When deploying to Vercel, you might encounter TypeScript errors related to error handling:

```typescript
Type error: 'error' is of type 'unknown'.
```

**Solution**: Properly type the error and add null checks before accessing properties:

```typescript
try {
  // Your code here
} catch (error: any) {
  console.error('Error:', error);
  return res.status(500).json({ 
    error: 'Internal server error', 
    message: error?.message || 'Unknown error occurred' 
  });
}
```

### Module Resolution Issues

If you encounter module resolution issues during build:

```
Cannot find module '../lib/scrapers/enhanced-scraper-manager' or its corresponding type declarations.
```

**Solution**: 
1. Move development scripts outside the build path (to `.vercel-exclude` directory)
2. Create a `.vercelignore` file to exclude these directories from the build
3. Simplify the implementation to avoid complex dependencies

### MongoDB Connection Issues

If you encounter MongoDB connection issues in production:

**Solution**:
1. Ensure the MongoDB connection string is correctly set in Vercel environment variables
2. Use connection pooling to avoid exceeding connection limits
3. Implement proper error handling for database operations

## Deployment Checklist

Before deploying to Vercel, ensure:

1. ✅ All TypeScript errors are resolved (run `npm run build` locally)
2. ✅ Development scripts are excluded from the build
3. ✅ Environment variables are properly configured
4. ✅ API routes handle errors correctly
5. ✅ File paths use environment-specific directories

## Vercel Configuration

The `vercel.json` file configures the deployment:

```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-Requested-With, Content-Type, Accept"
        }
      ]
    }
  ],
  "env": {
    "MONGODB_URI": "mongodb+srv://gearCaseApp:rucwoj-watxor-Rocji5@cluster0.mongodb.net/musician-case-finder"
  }
}
```

## Best Practices for Future Development

1. **Design with deployment in mind from the start**
   - Consider serverless constraints early in the development process
   - Separate development scripts from production code

2. **Test builds locally before pushing**
   - Run `npm run build` to catch TypeScript errors
   - Test API routes locally

3. **Use proper error handling throughout**
   - Type errors correctly
   - Add null checks for properties
   - Return appropriate status codes

4. **Optimize for serverless environment**
   - Keep functions small and focused
   - Avoid long-running operations
   - Use appropriate storage locations for files
