# Gear Case Finder

![Gear Case Finder Logo](https://via.placeholder.com/800x200?text=Gear+Case+Finder)

## 📋 Overview

Gear Case Finder is a specialized web application designed to help musicians and audio professionals find the perfect protective cases for their gear. The application matches audio equipment with compatible cases based on precise dimensions, protection requirements, and user preferences.

### 🎯 Core Features

- **Precise Dimension Matching**: Find cases that perfectly fit your audio gear based on exact measurements
- **Multi-Source Search**: Search across multiple marketplaces and retailers for the best case options
- **Compatibility Scoring**: Advanced algorithm rates case compatibility based on multiple factors
- **Admin Dashboard**: Comprehensive admin interface for monitoring and managing the application
- **API Integration**: Reliable data sourcing through established APIs instead of web scraping

## 🚀 Technology Stack

### Frontend
- **Framework**: Next.js 13.4.12
- **UI Library**: React 18.2.0
- **Styling**: Tailwind CSS 3.3.3
- **Theming**: next-themes for light/dark mode support
- **Data Fetching**: Apollo Client 3.8.0

### Backend
- **API Routes**: Next.js API routes with serverless functions
- **GraphQL**: Apollo Server 4.11.3 with GraphQL 16.7.1
- **Database**: MongoDB 5.7.0 with Mongoose 7.8.6
- **Caching**: node-cache for performance optimization
- **Logging**: Winston 3.17.0

### Testing
- **Unit Testing**: Jest 29.6.1 with React Testing Library
- **E2E Testing**: Cypress 12.17.2
- **TypeScript**: TypeScript 5.8.2 for type safety

### Deployment
- **Platform**: Vercel (optimized for serverless deployment)
- **Database Hosting**: MongoDB Atlas (M0 Sandbox tier)

## 🛠️ Setup and Installation

### Prerequisites
- Node.js 16.x or higher
- npm 8.x or higher
- MongoDB Atlas account (free tier is sufficient)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/miguelhd/gear-case-finder.git
   cd gear-case-finder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/musician-case-finder
   NODE_ENV=development
   ```

4. **Test MongoDB connection**
   ```bash
   npm run db:test-connection
   ```

5. **Set up the database**
   ```bash
   npm run db:setup
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Running Tests

- **Run unit tests**
  ```bash
  npm test
  ```

- **Run tests in watch mode**
  ```bash
  npm run test:watch
  ```

- **Run end-to-end tests**
  ```bash
  npm run test:e2e
  ```

- **Open Cypress test runner**
  ```bash
  npm run cypress
  ```

## 📊 Database Structure

The application uses MongoDB with the following collection structure:

### Collections

- **AudioGear**: Stores information about audio equipment
  - Indexes: `brand`, `category`, `type`, dimensions, text search on name and description

- **Case**: Stores information about protective cases
  - Indexes: `brand`, `type`, interior dimensions, protection features, text search on name and description

- **GearCaseMatch**: Stores matches between gear and cases
  - Indexes: unique compound index on `gearId` and `caseId`, sorted indexes for compatibility scores

- **User**: Stores user information and preferences

- **Content**: Stores static content for the application

- **Analytics**: Stores usage analytics and metrics

- **Affiliate**: Stores affiliate marketing information

## 🔄 API Integration

The application uses API-based data sources instead of web scraping for improved reliability and maintainability.

### API Clients

- **Canopy API Client**: Provides access to product data across multiple marketplaces
- **Reverb API Client**: Specialized API for musical instruments and gear

### Data Flow

1. User searches for gear or cases
2. API clients fetch data from respective sources
3. Data is normalized to a common format
4. Results are cached for performance
5. Matching algorithm finds compatible gear-case pairs
6. Results are presented to the user

## 👨‍💻 Admin Dashboard

The admin dashboard provides comprehensive tools for managing and monitoring the application.

### Dashboard Features

- **System Monitoring**: View system health, performance metrics, and logs
- **Database Management**: Manage database collections, view stats, and import data
- **User Management**: Manage user accounts and permissions
- **Content Management**: Update static content and manage the content database

### Accessing the Admin Dashboard

1. Navigate to `/admin` in the application
2. Log in with admin credentials
3. Access the various admin tools from the sidebar navigation

## 🚢 Deployment

The application is optimized for deployment on Vercel's serverless platform.

### Deployment Checklist

1. Ensure all TypeScript errors are resolved (`npm run build` locally)
2. Verify that development scripts are excluded from the build
3. Configure environment variables in Vercel dashboard
4. Ensure API routes handle errors correctly
5. Verify file paths use environment-specific directories

### Vercel Configuration

The `vercel.json` file configures the deployment with:
- Build commands and output directory
- API route rewrites
- CORS headers for API routes
- Environment variables

## 🧪 Testing

The application includes comprehensive testing at multiple levels:

### Unit Tests

- Component tests using Jest and React Testing Library
- Utility function tests
- API route tests

### Integration Tests

- Database connection and query tests
- API integration tests
- Component integration tests

### End-to-End Tests

- User flow tests using Cypress
- Admin dashboard tests
- Search and matching functionality tests

## 📝 Recent Changes

### March 28, 2025 - Removed Scraper Code and Fixed Deployment Issues

- Completely removed scraper-related code and dependencies
- Updated all references to scraper code throughout the codebase
- Fixed build and deployment issues
- Improved codebase maintainability by removing approximately 6,000 lines of unused code
- Simplified the monitoring system to focus on essential metrics

## 🔮 Future Development

### Planned Enhancements

1. **Enhanced API Integration**
   - Further develop the API-based approach that replaced scrapers
   - Improve error handling and response formatting in API clients
   - Add more comprehensive caching for API responses

2. **Improved User Interface**
   - Update the admin interface to reflect the removal of scraper functionality
   - Enhance the monitoring dashboard with more relevant metrics
   - Improve the case matching interface for better user experience

3. **Comprehensive Testing**
   - Develop more unit tests for core functionality
   - Add integration tests for API clients
   - Implement end-to-end tests for critical user flows

## 📚 Documentation

Additional documentation is available in the repository:

- [Implementation Plan](./IMPLEMENTATION_PLAN.md): Details about MongoDB Atlas setup and admin dashboard implementation
- [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md): Guide for deploying to Vercel, including common issues and solutions
- [Progress Report](./PROGRESS.md): Latest updates and changes to the project
- [TypeScript Style Guide](./TYPESCRIPT_STYLE_GUIDE.md): Guidelines for TypeScript usage in the project

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

Miguel HD - [GitHub Profile](https://github.com/miguelhd)

Project Link: [https://github.com/miguelhd/gear-case-finder](https://github.com/miguelhd/gear-case-finder)
