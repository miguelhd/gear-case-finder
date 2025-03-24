import React from 'react';

interface Seller {
  name: string;
  url: string;
  rating: number;
}

interface SellerInfoProps {
  seller: Seller;
  marketplace: string;
}

const SellerInfo: React.FC<SellerInfoProps> = ({ seller, marketplace }) => {
  return (
    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Seller Information</h3>
      <p className="text-gray-600 dark:text-gray-400">
        {seller.name} {seller.rating ? `(${seller.rating.toFixed(1)} stars)` : ''}
      </p>
      {seller.url && (
        <a 
          href={seller.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm mt-1 inline-block"
        >
          View seller on {marketplace}
        </a>
      )}
    </div>
  );
};

export default SellerInfo;
