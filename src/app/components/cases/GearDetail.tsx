import React from 'react';
import { AudioGear } from '../../types';

interface GearDetailProps {
  gear: AudioGear;
  onClose: () => void;
  onFindCase: (gear: AudioGear) => void;
}

const GearDetail: React.FC<GearDetailProps> = ({ gear, onClose, onFindCase }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{gear.name}</h2>
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
              {gear.imageUrl ? (
                <img 
                  src={gear.imageUrl} 
                  alt={gear.name} 
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
                    <p className="font-medium">{gear.brand}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium">{gear.type}</p>
                  </div>
                  {gear.weight && (
                    <div>
                      <p className="text-sm text-gray-500">Weight</p>
                      <p className="font-medium">{gear.weight} kg</p>
                    </div>
                  )}
                </div>
              </div>
              
              {gear.dimensions && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Dimensions</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Width × Height × Depth</p>
                      <p className="font-medium">
                        {gear.dimensions.width}×{gear.dimensions.height}×{gear.dimensions.depth} cm
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors mr-2"
          >
            Close
          </button>
          <button
            onClick={() => onFindCase(gear)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Find Compatible Cases
          </button>
        </div>
      </div>
    </div>
  );
};

export default GearDetail;
