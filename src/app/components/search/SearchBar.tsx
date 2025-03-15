import React from 'react';
import { SearchFilters } from '../../types';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: SearchFilters) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onFilterChange }) => {
  const [query, setQuery] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);
  const [filters, setFilters] = React.useState<SearchFilters>({});
  const [activeTab, setActiveTab] = React.useState<'gear' | 'cases'>('gear');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleTabChange = (tab: 'gear' | 'cases') => {
    setActiveTab(tab);
    // Reset filters when changing tabs
    setFilters({});
    onFilterChange({});
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              activeTab === 'gear'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => handleTabChange('gear')}
          >
            Search by Gear
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              activeTab === 'cases'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => handleTabChange('cases')}
          >
            Browse Cases
          </button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
        <div className="flex-grow relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={activeTab === 'gear' ? "Search for audio gear..." : "Search for cases..."}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>
      </form>

      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeTab === 'gear' ? (
              <>
                <div>
                  <label htmlFor="gearType" className="block text-sm font-medium text-gray-700 mb-1">
                    Gear Type
                  </label>
                  <select
                    id="gearType"
                    name="gearType"
                    value={filters.gearType || ''}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="mixer">Mixer</option>
                    <option value="synthesizer">Synthesizer</option>
                    <option value="drum machine">Drum Machine</option>
                    <option value="controller">MIDI Controller</option>
                    <option value="interface">Audio Interface</option>
                    <option value="microphone">Microphone</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <select
                    id="brand"
                    name="brand"
                    value={filters.brand || ''}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Brands</option>
                    <option value="roland">Roland</option>
                    <option value="korg">Korg</option>
                    <option value="yamaha">Yamaha</option>
                    <option value="moog">Moog</option>
                    <option value="focusrite">Focusrite</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="caseType" className="block text-sm font-medium text-gray-700 mb-1">
                    Case Type
                  </label>
                  <select
                    id="caseType"
                    name="caseType"
                    value={filters.caseType || ''}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Cases</option>
                    <option value="hard">Hard Case</option>
                    <option value="soft">Soft Case</option>
                    <option value="bag">Gig Bag</option>
                    <option value="flight">Flight Case</option>
                    <option value="waterproof">Waterproof</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <select
                    id="brand"
                    name="brand"
                    value={filters.brand || ''}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Brands</option>
                    <option value="gator">Gator</option>
                    <option value="skb">SKB</option>
                    <option value="pelican">Pelican</option>
                    <option value="magma">Magma</option>
                    <option value="udg">UDG</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">
                    Price Range
                  </label>
                  <select
                    id="priceRange"
                    name="priceRange"
                    value={filters.priceRange ? `${filters.priceRange.min}-${filters.priceRange.max}` : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      let priceRange;
                      
                      if (value) {
                        const [min, max] = value.split('-').map(Number);
                        priceRange = { min, max };
                      } else {
                        priceRange = undefined;
                      }
                      
                      const updatedFilters = { ...filters, priceRange };
                      setFilters(updatedFilters);
                      onFilterChange(updatedFilters);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Any Price</option>
                    <option value="0-50">Under $50</option>
                    <option value="50-100">$50 - $100</option>
                    <option value="100-150">$100 - $150</option>
                    <option value="150-200">$150 - $200</option>
                    <option value="200-1000">$200+</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
