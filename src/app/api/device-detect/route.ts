import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get the user agent string
  const userAgent = request.headers.get('user-agent') || '';
  
  // Check if the device is mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  // Check if the device is a tablet (simplified check)
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
  
  // Determine device type
  let deviceType = 'desktop';
  if (isMobile) deviceType = 'mobile';
  if (isTablet) deviceType = 'tablet';
  
  // Get viewport size from query params if available (for testing)
  const searchParams = request.nextUrl.searchParams;
  const width = searchParams.get('width');
  const height = searchParams.get('height');
  
  return NextResponse.json({
    userAgent,
    deviceType,
    isMobile,
    isTablet,
    viewport: width && height ? { width, height } : undefined
  });
}
