# MongoDB Atlas Database Setup Guide

This guide provides step-by-step instructions for setting up the MongoDB Atlas database structure for the Gear Case Finder application.

## Prerequisites

1. MongoDB Atlas account (free tier is sufficient)
2. MongoDB Atlas cluster created
3. Network access configured to allow connections from your IP address
4. Database user created with read/write permissions

## Setup Steps

### 1. Configure Environment Variables

Create or update your `.env.local` file with your MongoDB Atlas connection string:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
```

Replace `<username>`, `<password>`, `<cluster-url>`, and `<database-name>` with your MongoDB Atlas credentials.

### 2. Test Connection

Before setting up the database structure, test your connection to MongoDB Atlas:

```bash
npm run db:test-connection
```

This will verify that your connection string is correct and that you can connect to your MongoDB Atlas cluster.

### 3. Run Database Setup Script

Once the connection is verified, run the database setup script to create all collections and indexes:

```bash
npm run db:setup
```

This script will:
- Create all required collections if they don't exist
- Set up schema validation for each collection
- Create appropriate indexes for optimized queries

### 4. Verify Setup

After running the setup script, you can verify the setup by:

1. Logging into your MongoDB Atlas account
2. Navigating to your cluster
3. Opening the "Collections" tab
4. Confirming that all seven collections are created:
   - AudioGear
   - Case
   - GearCaseMatch
   - User
   - Content
   - Analytics
   - Affiliate
5. Checking that indexes are created for each collection

## Troubleshooting

### Connection Issues

If you encounter connection issues:

1. Verify that your MongoDB Atlas cluster is running
2. Check that your IP address is whitelisted in the Network Access settings
3. Confirm that your database user credentials are correct
4. Ensure that your connection string format is correct

### Schema Validation Errors

If you encounter schema validation errors when inserting data:

1. Check the schema validation rules in the collection setup scripts
2. Ensure your data matches the required schema
3. Update the schema validation rules if necessary

## Next Steps

After setting up the database structure, you can:

1. Import data into the collections
2. Connect the admin dashboard to MongoDB
3. Test the application with real data

For more information on the database structure, refer to the [README.md](./README.md) file in this directory.
