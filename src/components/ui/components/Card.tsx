import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface CardProps {
  title: string;
  image?: string;
  description?: string;
  link: string;
  badges?: string[];
  price?: string;
  rating?: number;
  reviewCount?: number;
}

const Card: React.FC<CardProps> = ({ title, image, description, link, badges, price, rating, reviewCount }) => {
  return (
    <Link href={link}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col">
        {image && (
          <div className="relative h-48 w-full">
            <Image 
              src={image} 
              alt={title}
              layout="fill"
              objectFit="cover"
              className="transition-opacity duration-300 hover:opacity-90"
            />
          </div>
        )}
        <div className="p-4 flex-grow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {badges.map((badge, index) => (
                <span key={index} className="px-2 py-1 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                  {badge}
                </span>
              ))}
            </div>
          )}
          {price && (
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{price}</p>
          )}
          {rating !== undefined && (
            <div className="flex items-center mb-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              {reviewCount !== undefined && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({reviewCount})</span>
              )}
            </div>
          )}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default Card;