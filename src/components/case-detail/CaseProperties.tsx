import React from 'react';

interface CasePropertiesProps {
  waterproof: boolean;
  shockproof: boolean;
  hasHandle: boolean;
  hasWheels: boolean;
}

const CaseProperties: React.FC<CasePropertiesProps> = ({
  waterproof,
  shockproof,
  hasHandle,
  hasWheels
}) => {
  return (
    <div className="grid grid-cols-4 gap-2 mb-6">
      <div className={`flex flex-col items-center p-3 rounded-lg ${waterproof ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
        <svg className="h-6 w-6 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <span className="text-xs font-medium">Waterproof</span>
      </div>
      <div className={`flex flex-col items-center p-3 rounded-lg ${shockproof ? 'bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
        <svg className="h-6 w-6 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="text-xs font-medium">Shockproof</span>
      </div>
      <div className={`flex flex-col items-center p-3 rounded-lg ${hasHandle ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
        <svg className="h-6 w-6 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span className="text-xs font-medium">Handle</span>
      </div>
      <div className={`flex flex-col items-center p-3 rounded-lg ${hasWheels ? 'bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
        <svg className="h-6 w-6 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <span className="text-xs font-medium">Wheels</span>
      </div>
    </div>
  );
};

export default CaseProperties;
