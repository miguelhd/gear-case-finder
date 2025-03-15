'use client';

import { useEffect, useState } from 'react';

interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  isMobile: boolean;
  isTablet: boolean;
  viewport?: {
    width: string;
    height: string;
  };
}

export function useDeviceDetect() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectDevice = async () => {
      try {
        // Get current viewport dimensions
        const width = window.innerWidth.toString();
        const height = window.innerHeight.toString();
        
        // Call the device detection API
        const response = await fetch(`/api/device-detect?width=${width}&height=${height}`);
        const data = await response.json();
        
        setDeviceInfo(data);
      } catch (error) {
        console.error('Error detecting device:', error);
        // Fallback device detection if API fails
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        setDeviceInfo({
          deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
          isMobile,
          isTablet,
          viewport: {
            width: window.innerWidth.toString(),
            height: window.innerHeight.toString()
          }
        });
      } finally {
        setLoading(false);
      }
    };

    detectDevice();

    // Add resize listener for responsive testing
    const handleResize = () => {
      detectDevice();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return { deviceInfo, loading };
}
