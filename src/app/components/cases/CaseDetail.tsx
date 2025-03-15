import React from 'react';
import { Case, AudioGear } from '../../types';

interface CaseDetailProps {
  caseItem: Case;
  compatibleGear?: AudioGear[];
  onClose: () => void;
}

const CaseDetail: React.FC<CaseDetailProps> = ({ caseItem, compatibleGear, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{caseItem.name}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {caseItem.imageUrl ? (
                <img 
                  src={caseItem.imageUrl} 
                  alt={caseItem.name} 
                  className="w-full h-auto rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>
            
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Brand</p>
                    <p className="font-medium">{caseItem.brand}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium">{caseItem.type}</p>
                  </div>
                  {caseItem.price && (
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-medium text-blue-600">${caseItem.price.toFixed(2)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Max Weight</p>
                    <p className="font-medium">{caseItem.maxWeight} kg</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Dimensions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Inner (W×H×D)</p>
                    <p className="font-medium">
                      {caseItem.dimensions.innerWidth}×{caseItem.dimensions.innerHeight}×{caseItem.dimensions.innerDepth} cm
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Outer (W×H×D)</p>
                    <p className="font-medium">
                      {caseItem.dimensions.outerWidth}×{caseItem.dimensions.outerHeight}×{caseItem.dimensions.outerDepth} cm
                    </p>
                  </div>
                </div>
              </div>
              
              {caseItem.features && caseItem.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Features</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {caseItem.features.map((feature, index) => (
                      <li key={index} className="text-gray-700">{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {compatibleGear && compatibleGear.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Compatible Gear</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {compatibleGear.map((gear) => (
                  <div key={gear.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-800">{gear.name}</h4>
                    <p className="text-sm text-gray-600">{gear.brand}</p>
                    {gear.dimensions && (
                      <p className="text-xs text-gray-500 mt-1">
                        {gear.dimensions.width}×{gear.dimensions.height}×{gear.dimensions.depth} cm
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors mr-2"
          >
            Close
          </button>
          <a
            href="#"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Buy Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default CaseDetail;
