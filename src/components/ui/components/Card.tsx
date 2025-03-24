import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface CardProps {
  title: string;
  image?: string;
  description?: string;
  link: string;
  badges?: string[];
}

const Card: React.FC<CardProps> = ({ title, image, description, link, badges }) => {
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
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default Card;