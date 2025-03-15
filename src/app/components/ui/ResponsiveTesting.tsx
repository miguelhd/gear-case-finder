'use client';

import React, { useEffect, useState } from 'react';
import { useDeviceDetect } from '../lib/useDeviceDetect';

interface ResponsiveTestingProps {
  children: React.ReactNode;
}

const ResponsiveTesting: React.FC<ResponsiveTestingProps> = ({ children }) => {
  const { deviceInfo, loading } = useDeviceDetect();
  const [showDevTools, setShowDevTools] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);

  // Check if we're in development mode
  useEffect(() => {
    setIsTestMode(process.env.NODE_ENV === 'development');
  }, []);

  if (!isTestMode) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {showDevTools && deviceInfo && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-2 z-50 text-sm">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <span className="font-bold mr-2">Device:</span>
              <span className={`px-2 py-1 rounded mr-4 ${
                deviceInfo.deviceType === 'mobile' ? 'bg-blue-600' :
                deviceInfo.deviceType === 'tablet' ? 'bg-green-600' : 'bg-purple-600'
              }`}>
                {deviceInfo.deviceType}
              </span>
              
              <span className="font-bold mr-2">Viewport:</span>
              <span className="px-2 py-1 rounded bg-gray-700">
                {deviceInfo.viewport?.width}×{deviceInfo.viewport?.height}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowDevTools(false)}
                className="px-2 py-1 bg-red-600 rounded hover:bg-red-700 transition-colors"
              >
                Hide
              </button>
            </div>
          </div>
        </div>
      )}
      
      {!showDevTools && isTestMode && (
        <button 
          onClick={() => setShowDevTools(true)}
          className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg z-50 opacity-70 hover:opacity-100 transition-opacity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>
      )}
      
      {children}
    </div>
  );
};

export default ResponsiveTesting;
