import React from 'react';
import { useRouter } from 'next/router';
import { useQuery, gql } from '@apollo/client';
import Layout from '../../components/Layout';
import { Button, Spinner, Badge, Alert } from '../../components/ui';
import Image from 'next/image';
import Link from 'next/link';

// GraphQL query to get gear details
const GET_GEAR_DETAIL = gql`
  query GetGearDetail($id: ID!) {
    gear(id: $id) {
      id
      name
      brand
      category
      type
      dimensions {
        length
        width
        height
        unit
      }
      weight {
        value
        unit
      }
      imageUrl
      productUrl
      description
      popularity
      releaseYear
      discontinued
      compatibleCases(limit: 6) {
        id
        name
        brand
        type
        marketplace
        price
        currency
        imageUrls
        protectionLevel
        rating
        reviewCount
      }
    }
  }
`;

const GearDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const { loading, error, data } = useQuery(GET_GEAR_DETAIL, {
    variables: { id },
    skip: !id,
  });

  // Format dimensions
  const formatDimensions = (dimensions: any) => {
    if (!dimensions) return 'N/A';
    return `${dimensions.length} × ${dimensions.width} × ${dimensions.height} ${dimensions.unit}`;
  };

  // Format weight
  const formatWeight = (weight: any) => {
    if (!weight) return 'N/A';
    return `${weight.value} ${weight.unit}`;
  };

  // Format price with currency
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  if (loading) {
    return (
      <Layout title="Loading Gear Details...">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Error Loading Gear Details">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert type="error" title="Error Loading Gear">
            We couldn't load the gear details. Please try again later.
          </Alert>
        </div>
      </Layout>
    );
  }

  if (!data?.gear) {
    return (
      <Layout title="Gear Not Found">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert type="warning" title="Gear Not Found">
            The gear you're looking for doesn't exist or has been removed.
          </Alert>
          <div className="mt-6 text-center">
            <Link href="/gear">
              <Button variant="primary">Browse All Gear</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const gear = data.gear;

  return (
    <Layout title={`${gear.name} - Musician Case Finder`} description={`Find the perfect case for your ${gear.name}. Dimensions: ${formatDimensions(gear.dimensions)}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
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
              <Link href="/gear">
                <span className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Gear</span>
              </Link>
            </li>
            <li>
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <span className="text-gray-900 dark:text-white font-medium">{gear.name}</span>
            </li>
          </ol>
        </nav>

        {/* Main content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Image */}
            <div className="md:w-1/2 p-6">
              <div className="relative h-80 w-full md:h-96">
                {gear.imageUrl ? (
                  <Image
                    src={gear.imageUrl}
                    alt={gear.name}
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
            </div>

            {/* Details */}
            <div className="md:w-1/2 p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge color="blue">{gear.category}</Badge>
                <Badge color="purple">{gear.type}</Badge>
                {gear.discontinued && (
                  <Badge color="red">Discontinued</Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{gear.name}</h1>
              <h2 className="text-xl text-gray-700 dark:text-gray-300 mb-4">{gear.brand}</h2>

              {gear.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-6">{gear.description}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dimensions</h3>
                  <p className="text-base text-gray-900 dark:text-white">{formatDimensions(gear.dimensions)}</p>
                </div>
                {gear.weight && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Weight</h3>
                    <p className="text-base text-gray-900 dark:text-white">{formatWeight(gear.weight)}</p>
                  </div>
                )}
                {gear.releaseYear && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Release Year</h3>
                    <p className="text-base text-gray-900 dark:text-white">{gear.releaseYear}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link href={`/finder?gearId=${gear.id}`}>
                  <Button variant="primary" fullWidth>Find Compatible Cases</Button>
                </Link>
                {gear.productUrl && (
                  <a href={gear.productUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" fullWidth>View Product Details</Button>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Compatible Cases Section */}
          <div className="px-6 py-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Compatible Cases</h2>
            
            {gear.compatibleCases && gear.compatibleCases.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gear.compatibleCases.map((caseItem: any) => (
                    <div key={caseItem.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
                      <Link href={`/cases/${caseItem.id}`}>
                        <div className="p-4">
                          <div className="relative h-40 w-full mb-4">
                            <Image
                              src={caseItem.imageUrls?.[0] || '/images/placeholder-case.jpg'}
                              alt={caseItem.name}
                              layout="fill"
                              objectFit="contain"
                            />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{caseItem.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{caseItem.brand || 'Unknown Brand'}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                              {formatPrice(caseItem.price, caseItem.currency)}
                            </span>
                            <div className="flex items-center">
                              <svg className="h-4 w-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                                {caseItem.rating ? caseItem.rating.toFixed(1) : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <Link href={`/finder?gearId=${gear.id}`}>
                    <Button variant="secondary">View All Compatible Cases</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">No compatible cases found for this gear yet.</p>
                <Link href={`/finder?gearId=${gear.id}`}>
                  <Button variant="primary">Find Cases</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GearDetailPage;
