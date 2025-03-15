import React from 'react';
import { useRouter } from 'next/router';
import { useQuery, gql } from '@apollo/client';
import Layout from '../../components/Layout';
import { Button, Spinner, Badge, Alert } from '../../components/ui';
import Image from 'next/image';
import Link from 'next/link';

// GraphQL query to get case details
const GET_CASE_DETAIL = gql`
  query GetCaseDetail($id: ID!) {
    case(id: $id) {
      id
      name
      brand
      type
      marketplace
      externalDimensions {
        length
        width
        height
        unit
      }
      internalDimensions {
        length
        width
        height
        unit
      }
      weight {
        value
        unit
      }
      price
      currency
      url
      imageUrls
      description
      features
      rating
      reviewCount
      availability
      seller {
        name
        url
        rating
      }
      protectionLevel
      waterproof
      shockproof
      hasHandle
      hasWheels
      material
      color
      compatibleGear(limit: 6) {
        id
        name
        brand
        category
        type
        imageUrl
        dimensions {
          length
          width
          height
          unit
        }
      }
    }
  }
`;

const CaseDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const { loading, error, data } = useQuery(GET_CASE_DETAIL, {
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

  // Generate affiliate link
  const generateAffiliateLink = (url: string, marketplace: string) => {
    // In a real implementation, this would add the appropriate affiliate parameters
    // based on the marketplace
    if (marketplace === 'Amazon') {
      return `${url}?tag=musiciancase-20`;
    } else if (marketplace === 'eBay') {
      return `${url}?mkcid=1&mkrid=711-53200-19255-0&campid=5338722076`;
    } else if (marketplace === 'AliExpress') {
      return `${url}?aff_platform=link-c-tool`;
    } else if (marketplace === 'Etsy') {
      return `${url}?utm_source=musiciancase&utm_medium=affiliate`;
    } else {
      return url;
    }
  };

  if (loading) {
    return (
      <Layout title="Loading Case Details...">
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
      <Layout title="Error Loading Case Details">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert type="error" title="Error Loading Case">
            We couldn't load the case details. Please try again later.
          </Alert>
        </div>
      </Layout>
    );
  }

  if (!data?.case) {
    return (
      <Layout title="Case Not Found">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert type="warning" title="Case Not Found">
            The case you're looking for doesn't exist or has been removed.
          </Alert>
          <div className="mt-6 text-center">
            <Link href="/cases">
              <Button variant="primary">Browse All Cases</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const caseItem = data.case;
  const affiliateLink = generateAffiliateLink(caseItem.url, caseItem.marketplace);

  return (
    <Layout 
      title={`${caseItem.name} - Musician Case Finder`} 
      description={`${caseItem.name} - ${caseItem.brand || 'Unknown Brand'} - ${caseItem.type} case for music gear. Internal dimensions: ${formatDimensions(caseItem.internalDimensions)}`}
    >
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
              <span className="text-gray-900 dark:text-white font-medium">{caseItem.name}</span>
            </li>
          </ol>
        </nav>

        {/* Main content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Image Gallery */}
            <div className="md:w-1/2 p-6">
              <div className="relative h-80 w-full md:h-96 mb-4">
                {caseItem.imageUrls && caseItem.imageUrls.length > 0 ? (
                  <Image
                    src={caseItem.imageUrls[0]}
                    alt={caseItem.name}
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
              {caseItem.imageUrls && caseItem.imageUrls.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {caseItem.imageUrls.slice(0, 4).map((imageUrl: string, index: number) => (
                    <div key={index} className="relative h-20 w-full">
                      <Image
                        src={imageUrl}
                        alt={`${caseItem.name} - Image ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md cursor-pointer hover:opacity-80"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="md:w-1/2 p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge color="blue">{caseItem.type}</Badge>
                <Badge color="purple">{caseItem.marketplace}</Badge>
                {caseItem.protectionLevel && (
                  <Badge color={
                    caseItem.protectionLevel === 'high' ? 'green' : 
                    caseItem.protectionLevel === 'medium' ? 'yellow' : 'gray'
                  }>
                    {caseItem.protectionLevel.charAt(0).toUpperCase() + caseItem.protectionLevel.slice(1)} Protection
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{caseItem.name}</h1>
              <h2 className="text-xl text-gray-700 dark:text-gray-300 mb-4">{caseItem.brand || 'Unknown Brand'}</h2>

              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`h-5 w-5 ${i < Math.round(caseItem.rating || 0) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {caseItem.rating ? caseItem.rating.toFixed(1) : 'No ratings'} 
                  {caseItem.reviewCount ? ` (${caseItem.reviewCount} reviews)` : ''}
                </span>
              </div>

              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">
                {formatPrice(caseItem.price, caseItem.currency)}
              </div>

              {caseItem.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-6">{caseItem.description}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Internal Dimensions</h3>
                  <p className="text-base text-gray-900 dark:text-white">{formatDimensions(caseItem.internalDimensions)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">External Dimensions</h3>
                  <p className="text-base text-gray-900 dark:text-white">{formatDimensions(caseItem.externalDimensions)}</p>
                </div>
                {caseItem.weight && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Weight</h3>
                    <p className="text-base text-gray-900 dark:text-white">{formatWeight(caseItem.weight)}</p>
                  </div>
                )}
                {caseItem.material && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Material</h3>
                    <p className="text-base text-gray-900 dark:text-white">{caseItem.material}</p>
                  </div>
                )}
                {caseItem.color && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Color</h3>
                    <p className="text-base text-gray-900 dark:text-white">{caseItem.color}</p>
                  </div>
                )}
                {caseItem.availability && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Availability</h3>
                    <p className="text-base text-gray-900 dark:text-white">{caseItem.availability}</p>
                  </div>
                )}
              </div>

              {/* Features */}
              {caseItem.features && caseItem.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Features</h3>
                  <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-1">
                    {caseItem.features.map((feature: string, index: number) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Special features */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className={`flex flex-col items-center p-3 rounded-lg ${caseItem.waterproof ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
                  <svg className="h-6 w-6 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="text-xs font-medium">Waterproof</span>
                </div>
                <div className={`flex flex-col items-center p-3 rounded-lg ${caseItem.shockproof ? 'bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
                  <svg className="h-6 w-6 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs font-medium">Shockproof</span>
                </div>
                <div className={`flex flex-col items-center p-3 rounded-lg ${caseItem.hasHandle ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
                  <svg className="h-6 w-6 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-xs font-medium">Handle</span>
                </div>
                <div className={`flex flex-col items-center p-3 rounded-lg ${caseItem.hasWheels ? 'bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
                  <svg className="h-6 w-6 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span className="text-xs font-medium">Wheels</span>
                </div>
              </div>

              {/* Seller info */}
              {caseItem.seller && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Seller Information</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                 <response clipped><NOTE>To save on context only part of this file has been shown to you. You should retry this tool after you have searched inside the file with `grep -n` in order to find the line numbers of what you are looking for.</NOTE>