import React from 'react';
import Link from 'next/link';

interface BreadcrumbsProps {
  name: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ name }) => {
  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link href="/">
            <span className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Home</span>
          </Link>
        </li>
        <li>
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </li>
        <li>
          <Link href="/cases">
            <span className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Cases</span>
          </Link>
        </li>
        <li>
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </li>
        <li>
          <span className="text-gray-900 dark:text-white font-medium">{name}</span>
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
