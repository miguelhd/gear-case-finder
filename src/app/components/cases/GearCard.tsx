import React from 'react';
import { AudioGear } from '../../types';

interface GearCardProps {
  gear: AudioGear;
  onClick: (gear: AudioGear) => void;
}

const GearCard: React.FC<GearCardProps> = ({ gear, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => onClick(gear)}
    >
      <div className="h-48 overflow-hidden relative">
        {gear.imageUrl ? (
          <img 
            src={gear.imageUrl} 
            alt={gear.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
        {gear.type && (
          <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
            {gear.type}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{gear.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{gear.brand}</p>
        
        {gear.dimensions && (
          <div className="text-sm text-gray-700 mt-3">
            <span className="font-medium">Dimensions:</span> 
            <span className="ml-1">
              {gear.dimensions.width}×{gear.dimensions.height}×{gear.dimensions.depth} cm
            </span>
          </div>
        )}
        
        {gear.weight && (
          <div className="text-sm text-gray-700 mt-1">
            <span className="font-medium">Weight:</span> 
            <span className="ml-1">{gear.weight} kg</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GearCard;
