import React from 'react';
import { Case } from '../../types';

interface CaseGridProps {
  cases: Case[];
  onCaseSelect: (caseItem: Case) => void;
  loading?: boolean;
}

const CaseGrid: React.FC<CaseGridProps> = ({ cases, onCaseSelect, loading = false }) => {
  if (loading) {
    return (
      <div className="w-full py-12 text-center">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <p className="text-gray-600 mt-4">Loading cases...</p>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="w-full py-12 text-center">
        <p className="text-gray-600 text-lg">No cases found matching your criteria.</p>
        <p className="text-gray-500 mt-2">Try adjusting your search filters or search for a different gear type.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cases.map((caseItem) => (
        <div 
          key={caseItem.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
          onClick={() => onCaseSelect(caseItem)}
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
            {caseItem.fitScore && (
              <span className={`absolute top-2 left-2 text-white text-xs px-2 py-1 rounded-full ${
                caseItem.fitScore > 80 ? 'bg-green-600' : 
                caseItem.fitScore > 60 ? 'bg-yellow-500' : 'bg-orange-500'
              }`}>
                {caseItem.fitScore}% fit
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
      ))}
    </div>
  );
};

export default CaseGrid;
