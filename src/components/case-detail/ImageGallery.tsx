import React from 'react';
import Image from 'next/image';

/**
 * Props for the ImageGallery component
 */
export interface ImageGalleryProps {
  /**
   * Array of image URLs to display in the gallery
   */
  imageUrls: string[];
  
  /**
   * Name of the item being displayed, used for alt text
   */
  name: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ imageUrls, name }) => {
  // Default image to use if imageUrls is empty or undefined
  const defaultImage = '/images/placeholder.jpg';
  
  return (
    <div className="md:w-1/2 p-6">
      <div className="relative h-80 w-full md:h-96 mb-4">
        {imageUrls && imageUrls.length > 0 ? (
          <Image
            src={imageUrls[0] || defaultImage}
            alt={name}
            layout="fill"
            objectFit="contain"
            className="rounded-lg"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
            <svg className="h-24 w-24 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Thumbnail gallery */}
      {imageUrls && imageUrls.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {imageUrls.slice(0, 4).map((imageUrl: string, index: number) => (
            <div key={index} className="relative h-20 w-full">
              <Image
                src={imageUrl || defaultImage}
                alt={`${name} - Image ${index + 1}`}
                layout="fill"
                objectFit="cover"
                className="rounded-md cursor-pointer hover:opacity-80"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
