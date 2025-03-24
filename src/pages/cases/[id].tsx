import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, gql } from '@apollo/client';
import Layout from '../../components/Layout';
import { Button, Spinner, Alert } from '../../components/ui';
import Breadcrumbs from '../../components/case-detail/Breadcrumbs';
import ImageGallery from '../../components/case-detail/ImageGallery';
import CaseDetails from '../../components/case-detail/CaseDetails';
import CaseProperties from '../../components/case-detail/CaseProperties';
import SellerInfo from '../../components/case-detail/SellerInfo';

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
        <Breadcrumbs name={caseItem.name} />

        {/* Main content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Image Gallery */}
            <ImageGallery 
              imageUrls={caseItem.imageUrls} 
              name={caseItem.name} 
            />

            {/* Details */}
            <CaseDetails
              name={caseItem.name}
              brand={caseItem.brand}
              type={caseItem.type}
              marketplace={caseItem.marketplace}
              protectionLevel={caseItem.protectionLevel}
              internalDimensions={caseItem.internalDimensions}
              externalDimensions={caseItem.externalDimensions}
              weight={caseItem.weight}
              material={caseItem.material}
              color={caseItem.color}
              availability={caseItem.availability}
              rating={caseItem.rating}
              reviewCount={caseItem.reviewCount}
              price={caseItem.price}
              currency={caseItem.currency}
              description={caseItem.description}
              features={caseItem.features}
              formatDimensions={formatDimensions}
              formatWeight={formatWeight}
              formatPrice={formatPrice}
            />
          </div>
          
          <div className="p-6">
            {/* Properties */}
            <CaseProperties
              waterproof={caseItem.waterproof}
              shockproof={caseItem.shockproof}
              hasHandle={caseItem.hasHandle}
              hasWheels={caseItem.hasWheels}
            />
            
            {/* Seller info */}
            {caseItem.seller && (
              <SellerInfo 
                seller={caseItem.seller} 
                marketplace={caseItem.marketplace} 
              />
            )}
            
            {/* Buy button */}
            <div className="mt-8 text-center">
              <a 
                href={affiliateLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Buy on {caseItem.marketplace}
                <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            
            {/* Compatible gear */}
            {caseItem.compatibleGear && caseItem.compatibleGear.length > 0 && (
              <div className="mt-12">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Compatible Gear</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {caseItem.compatibleGear.map((gear: any) => (
                    <Link href={`/gear/${gear.id}`} key={gear.id}>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer">
                        <h3 className="font-medium text-gray-900 dark:text-white">{gear.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{gear.brand} - {gear.type}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          {gear.dimensions ? formatDimensions(gear.dimensions) : 'Dimensions not available'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CaseDetailPage;
