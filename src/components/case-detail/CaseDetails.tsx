import React from 'react';
import { Badge } from '../../components/ui';

interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: string;
}

interface Weight {
  value: number;
  unit: string;
}

interface CaseDetailsProps {
  name: string;
  brand: string;
  type: string;
  marketplace: string;
  protectionLevel: string;
  internalDimensions: Dimensions;
  externalDimensions: Dimensions;
  weight?: Weight;
  material?: string;
  color?: string;
  availability?: string;
  rating?: number;
  reviewCount?: number;
  price: number;
  currency: string;
  description?: string;
  features?: string[];
  formatDimensions: (dimensions: Dimensions) => string;
  formatWeight: (weight: Weight) => string;
  formatPrice: (price: number, currency: string) => string;
}

const CaseDetails: React.FC<CaseDetailsProps> = ({
  name,
  brand,
  type,
  marketplace,
  protectionLevel,
  internalDimensions,
  externalDimensions,
  weight,
  material,
  color,
  availability,
  rating,
  reviewCount,
  price,
  currency,
  description,
  features,
  formatDimensions,
  formatWeight,
  formatPrice
}) => {
  return (
    <div className="md:w-1/2 p-6">
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge color="blue">{type}</Badge>
        <Badge color="purple">{marketplace}</Badge>
        {protectionLevel && (
          <Badge color={
            protectionLevel === 'high' ? 'green' : 
            protectionLevel === 'medium' ? 'yellow' : 'gray'
          }>
            {protectionLevel.charAt(0).toUpperCase() + protectionLevel.slice(1)} Protection
          </Badge>
        )}
      </div>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{name}</h1>
      <h2 className="text-xl text-gray-700 dark:text-gray-300 mb-4">{brand || 'Unknown Brand'}</h2>

      <div className="flex items-center mb-4">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <svg 
              key={i} 
              className={`h-5 w-5 ${i < Math.round(rating || 0) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">
          {rating ? rating.toFixed(1) : 'No ratings'} 
          {reviewCount ? ` (${reviewCount} reviews)` : ''}
        </span>
      </div>

      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">
        {formatPrice(price, currency)}
      </div>

      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Internal Dimensions</h3>
          <p className="text-base text-gray-900 dark:text-white">{formatDimensions(internalDimensions)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">External Dimensions</h3>
          <p className="text-base text-gray-900 dark:text-white">{formatDimensions(externalDimensions)}</p>
        </div>
        {weight && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Weight</h3>
            <p className="text-base text-gray-900 dark:text-white">{formatWeight(weight)}</p>
          </div>
        )}
        {material && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Material</h3>
            <p className="text-base text-gray-900 dark:text-white">{material}</p>
          </div>
        )}
        {color && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Color</h3>
            <p className="text-base text-gray-900 dark:text-white">{color}</p>
          </div>
        )}
        {availability && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Availability</h3>
            <p className="text-base text-gray-900 dark:text-white">{availability}</p>
          </div>
        )}
      </div>

      {/* Features */}
      {features && features.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Features</h3>
          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-1">
            {features.map((feature: string, index: number) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CaseDetails;
