'use client';

import React from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import SearchBar from './components/search/SearchBar';
import CaseGrid from './components/cases/CaseGrid';
import CaseDetail from './components/cases/CaseDetail';
import GearCard from './components/cases/GearCard';
import GearDetail from './components/cases/GearDetail';
import ResponsiveTesting from './components/ui/ResponsiveTesting';
import { AudioGear, Case, SearchFilters } from './types';
import { useCache } from './lib/useCache';

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

export default function Home() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchFilters, setSearchFilters] = React.useState<SearchFilters>({});
  const [selectedGear, setSelectedGear] = React.useState<AudioGear | null>(null);
  const [selectedCase, setSelectedCase] = React.useState<Case | null>(null);
  const [compatibleCases, setCompatibleCases] = React.useState<Case[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'gear' | 'cases'>('gear');

  // Use cache hooks for gear and cases data
  const gearCache = useCache<AudioGear[]>({ key: 'gear_data', initialData: [] });
  const casesCache = useCache<Case[]>({ key: 'cases_data', initialData: [] });

  // Fetch initial data
  React.useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch gear data with caching
        await gearCache.fetchWithCache(async () => {
          const response = await fetch('/api/gear');
          const data = await response.json();
          return data;
        });

        // Fetch cases data with caching
        await casesCache.fetchWithCache(async () => {
          const response = await fetch('/api/cases');
          const data = await response.json();
          return data;
        });
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setLoading(true);
    
    try {
      if (activeTab === 'gear') {
        const params = new URLSearchParams({
          query,
          ...(searchFilters.gearType ? { gearType: searchFilters.gearType } : {}),
          ...(searchFilters.brand ? { brand: searchFilters.brand } : {})
        });
        
        // Use cache for search results
        const cacheKey = `gear_search_${params.toString()}`;
        const searchCache = useCache<AudioGear[]>({ key: cacheKey, initialData: [] });
        
        const gearData = await searchCache.fetchWithCache(async () => {
          const response = await fetch(`/api/gear?${params}`);
          const data = await response.json();
          return data;
        });
        
        gearCache.updateCache(gearData);
      } else {
        const params = new URLSearchParams({
          query,
          ...(searchFilters.caseType ? { caseType: searchFilters.caseType } : {}),
          ...(searchFilters.brand ? { brand: searchFilters.brand } : {}),
          ...(searchFilters.priceRange?.min ? { minPrice: searchFilters.priceRange.min.toString() } : {}),
          ...(searchFilters.priceRange?.max ? { maxPrice: searchFilters.priceRange.max.toString() } : {})
        });
        
        // Use cache for search results
        const cacheKey = `cases_search_${params.toString()}`;
        const searchCache = useCache<Case[]>({ key: cacheKey, initialData: [] });
        
        const casesData = await searchCache.fetchWithCache(async () => {
          const response = await fetch(`/api/cases?${params}`);
          const data = await response.json();
          return data;
        });
        
        casesCache.updateCache(casesData);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filters: SearchFilters) => {
    setSearchFilters(filters);
    handleSearch(searchQuery);
  };

  // Find compatible cases for a gear item
  const findCompatibleCases = async (gear: AudioGear) => {
    setLoading(true);
    try {
      // Use cache for compatible cases
      const cacheKey = `compatible_${gear.id}`;
      const compatibleCache = useCache<Case[]>({ key: cacheKey, initialData: [] });
      
      const compatibleData = await compatibleCache.fetchWithCache(async () => {
        const response = await fetch(`/api/matching?gearId=${gear.id}`);
        const data = await response.json();
        return data;
      });
      
      setCompatibleCases(compatibleData);
      setSelectedGear(gear);
    } catch (error) {
      console.error('Error finding compatible cases:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle gear selection
  const handleGearSelect = (gear: AudioGear) => {
    setSelectedGear(gear);
  };

  // Handle case selection
  const handleCaseSelect = (caseItem: Case) => {
    setSelectedCase(caseItem);
  };

  return (
    <ResponsiveTesting>
      <div className="flex flex-col min-h-screen">
        <Header title="Gear Case Finder" />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Find the Perfect Case for Your Audio Gear
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Search for your audio equipment and discover compatible cases, or browse our collection of protective cases for musicians and audio professionals.
            </p>
          </div>
          
          <div className="mb-8">
            <SearchBar 
              onSearch={handleSearch} 
              onFilterChange={handleFilterChange} 
            />
          </div>
          
          {loading ? (
            <LoadingFallback />
          ) : (
            <>
              {activeTab === 'gear' ? (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Audio Gear</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gearCache.data.map((item) => (
                      <GearCard 
                        key={item.id} 
                        gear={item} 
                        onClick={handleGearSelect} 
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Available Cases</h2>
                  <CaseGrid cases={casesCache.data} onCaseSelect={handleCaseSelect} />
                </div>
              )}
              
              {selectedGear && compatibleCases.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Compatible Cases for {selectedGear.name}
                  </h2>
                  <CaseGrid cases={compatibleCases} onCaseSelect={handleCaseSelect} />
                </div>
              )}
            </>
          )}
        </main>
        
        <Footer />
        
        {selectedGear && (
          <GearDetail 
            gear={selectedGear} 
            onClose={() => setSelectedGear(null)} 
            onFindCase={findCompatibleCases} 
          />
        )}
        
        {selectedCase && (
          <CaseDetail 
            caseItem={selectedCase} 
            onClose={() => setSelectedCase(null)} 
            compatibleGear={selectedGear ? [selectedGear] : undefined}
          />
        )}
      </div>
    </ResponsiveTesting>
  );
}
