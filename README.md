# Gear Case Finder

A web application for matching audio gear with traditional and non-traditional protective cases.

## Features

- Search for audio gear and find compatible cases
- Browse available cases with detailed specifications
- Advanced matching algorithm based on dimensions and weight
- Responsive design for mobile, tablet, and desktop
- Performance optimizations including caching and code splitting
- Web scraping capabilities for gathering gear and case data

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Data Handling**: TypeScript with strong typing
- **Performance**: Client and server-side caching
- **Web Scraping**: Axios, Cheerio

## Project Structure

- `/src/app`: Main application code
  - `/components`: React components organized by feature
  - `/api`: Backend API routes
  - `/lib`: Utility functions and hooks
  - `/types`: TypeScript type definitions

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

- `/api/gear`: Get and filter audio gear
- `/api/cases`: Get and filter protective cases
- `/api/matching`: Find compatible cases for specific gear
- `/api/scraper`: Scrape gear and case data from external sources
- `/api/device-detect`: Detect device type for responsive testing

## Responsive Testing

The application includes built-in responsive testing tools that can be accessed in development mode. Click the device icon in the bottom right corner to view device information and viewport dimensions.

## Performance Optimizations

- Client-side caching using localStorage
- Server-side caching for scraped data
- Code splitting with React.lazy and Suspense
- Optimized matching algorithm

## Future Enhancements

- User accounts and saved favorites
- Price comparison from multiple retailers
- Community reviews and ratings
- More sophisticated matching algorithm with machine learning
