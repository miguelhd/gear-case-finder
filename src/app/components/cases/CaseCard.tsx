import React from 'react';
import { Case } from '../../types';

interface CaseCardProps {
  caseItem: Case;
  onClick: (caseItem: Case) => void;
}

const CaseCard: React.FC<CaseCardProps> = ({ caseItem, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => onClick(caseItem)}
    >
      <div className="h-48 overflow-hidden relative">
        {caseItem.imageUrl ? (
          <img 
            src={caseItem.imageUrl} 
            alt={caseItem.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
        {caseItem.type && (
          <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            {caseItem.type}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{caseItem.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{caseItem.brand}</p>
        
        <div className="flex justify-between items-center mt-3">
          <div className="text-sm text-gray-700">
            <span className="font-medium">Dimensions:</span> 
            <span className="ml-1">
              {caseItem.dimensions.innerWidth}×{caseItem.dimensions.innerHeight}×{caseItem.dimensions.innerDepth} cm
            </span>
          </div>
          {caseItem.price && (
            <span className="text-blue-600 font-bold">${caseItem.price.toFixed(2)}</span>
          )}
        </div>
        
        {caseItem.features && caseItem.features.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {caseItem.features.slice(0, 3).map((feature, index) => (
                <span 
                  key={index} 
                  className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                >
                  {feature}
                </span>
              ))}
              {caseItem.features.length > 3 && (
                <span className="text-xs text-gray-500">+{caseItem.features.length - 3} more</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseCard;
