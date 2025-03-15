import { NextRequest, NextResponse } from 'next/server';
import { scrapeGearData, scrapeCaseData } from '@/app/lib/scraper';

// Cache for scraped data to avoid repeated scraping
let gearCache: any[] = [];
let caseCache: any[] = [];
let lastScrapeTime = {
  gear: 0,
  cases: 0
};

// Cache expiration time (1 hour in milliseconds)
const CACHE_EXPIRATION = 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'all';
  const url = searchParams.get('url');
  const forceRefresh = searchParams.get('refresh') === 'true';
  
  if (!url) {
    return NextResponse.json(
      { error: 'Missing required parameter: url' },
      { status: 400 }
    );
  }
  
  try {
    let result: any = {};
    const currentTime = Date.now();
    
    if (type === 'gear' || type === 'all') {
      // Check if we need to refresh the gear cache
      if (forceRefresh || gearCache.length === 0 || (currentTime - lastScrapeTime.gear) > CACHE_EXPIRATION) {
        const scrapedGear = await scrapeGearData(url);
        gearCache = scrapedGear;
        lastScrapeTime.gear = currentTime;
      }
      
      result.gear = gearCache;
    }
    
    if (type === 'cases' || type === 'all') {
      // Check if we need to refresh the case cache
      if (forceRefresh || caseCache.length === 0 || (currentTime - lastScrapeTime.cases) > CACHE_EXPIRATION) {
        const scrapedCases = await scrapeCaseData(url);
        caseCache = scrapedCases;
        lastScrapeTime.cases = currentTime;
      }
      
      result.cases = caseCache;
    }
    
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: currentTime,
      cached: !forceRefresh && (
        (type === 'gear' && (currentTime - lastScrapeTime.gear) <= CACHE_EXPIRATION) ||
        (type === 'cases' && (currentTime - lastScrapeTime.cases) <= CACHE_EXPIRATION)
      )
    });
  } catch (error) {
    console.error('Error in scraper API:', error);
    return NextResponse.json(
      { error: 'Failed to scrape data from the provided URL' },
      { status: 500 }
    );
  }
}
