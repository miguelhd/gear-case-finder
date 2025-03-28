import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { IGearCaseMatch } from '../../../lib/models/gear-models';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../../../components/ui/StatusComponents';

// Component for the Match Management page
const MatchManagementPage = () => {
  // State for match data
  const [matches, setMatches] = useState<IGearCaseMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterGearType, setFilterGearType] = useState<string>('');
  const [filterCaseType, setFilterCaseType] = useState<string>('');
  const [minScore, setMinScore] = useState<string>('');
  const [maxScore, setMaxScore] = useState<string>('');
  const [sortField, setSortField] = useState<string>('compatibilityScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // State for gear and case types (for filter dropdowns)
  const [gearTypes, setGearTypes] = useState<string[]>([]);
  const [caseTypes, setCaseTypes] = useState<string[]>([]);
  
  // State for selected match (for edit/delete operations)
  const [selectedMatch, setSelectedMatch] = useState<IGearCaseMatch | null>(null);
  
  // State for modal visibility
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  
  // Fetch match data
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        params.append('limit', itemsPerPage.toString());
        params.append('sort', sortField);
        params.append('direction', sortDirection);
        
        if (searchTerm) params.append('search', searchTerm);
        if (filterGearType) params.append('gearType', filterGearType);
        if (filterCaseType) params.append('caseType', filterCaseType);
        if (minScore) params.append('minScore', minScore);
        if (maxScore) params.append('maxScore', maxScore);
        
        // Fetch data from API
        const response = await fetch(`/api/admin/matches?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch match data');
        }
        
        const data = await response.json();
        setMatches(data.items);
        setTotalItems(data.total);
        setLoading(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };
    
    // For now, use mock data until we implement the API endpoint
    const mockData = [
      {
        _id: '1',
        gearId: '1',
        caseId: '1',
        gear: {
          _id: '1',
          name: 'Moog Subsequent 37',
          brand: 'Moog',
          category: 'Synthesizer',
          type: 'Analog Synthesizer',
          dimensions: {
            length: 22.5,
            width: 14.8,
            height: 5.1,
            unit: 'in'
          }
        },
        case: {
          _id: '1',
          name: 'Pelican 1510 Case',
          brand: 'Pelican',
          type: 'Hard Case',
          dimensions: {
            interior: {
              length: 19.75,
              width: 11.00,
              height: 7.60,
              unit: 'in'
            }
          },
          protectionLevel: 'high'
        },
        compatibilityScore: 87,
        dimensionScore: 85,
        featureScore: 90,
        userFeedbackScore: 88,
        positiveFeedbackCount: 12,
        negativeFeedbackCount: 2,
        dimensionFit: {
          length: {
            fits: false,
            difference: -2.75,
            unit: 'in'
          },
          width: {
            fits: false,
            difference: -3.8,
            unit: 'in'
          },
          height: {
            fits: true,
            difference: 2.5,
            unit: 'in'
          }
        },
        createdAt: '2023-05-15T10:30:00Z',
        updatedAt: '2023-06-20T14:45:00Z'
      },
      {
        _id: '2',
        gearId: '2',
        caseId: '2',
        gear: {
          _id: '2',
          name: 'Roland TR-8S',
          brand: 'Roland',
          category: 'Drum Machine',
          type: 'Digital Drum Machine',
          dimensions: {
            length: 16.3,
            width: 10.4,
            height: 2.6,
            unit: 'in'
          }
        },
        case: {
          _id: '2',
          name: 'Gator GK-49 Case',
          brand: 'Gator',
          type: 'Soft Case',
          dimensions: {
            interior: {
              length: 49.00,
              width: 18.00,
              height: 6.00,
              unit: 'in'
            }
          },
          protectionLevel: 'medium'
        },
        compatibilityScore: 92,
        dimensionScore: 95,
        featureScore: 85,
        userFeedbackScore: 94,
        positiveFeedbackCount: 28,
        negativeFeedbackCount: 1,
        dimensionFit: {
          length: {
            fits: true,
            difference: 32.7,
            unit: 'in'
          },
          width: {
            fits: true,
            difference: 7.6,
            unit: 'in'
          },
          height: {
            fits: true,
            difference: 3.4,
            unit: 'in'
          }
        },
        createdAt: '2023-05-16T11:20:00Z',
        updatedAt: '2023-06-21T15:30:00Z'
      },
      {
        _id: '3',
        gearId: '3',
        caseId: '3',
        gear: {
          _id: '3',
          name: 'Elektron Digitakt',
          brand: 'Elektron',
          category: 'Drum Machine',
          type: 'Digital Drum Machine',
          dimensions: {
            length: 8.5,
            width: 7.1,
            height: 2.2,
            unit: 'in'
          }
        },
        case: {
          _id: '3',
          name: 'SKB 3i-2015-7 Case',
          brand: 'SKB',
          type: 'Hard Case',
          dimensions: {
            interior: {
              length: 20.50,
              width: 15.50,
              height: 7.50,
              unit: 'in'
            }
          },
          protectionLevel: 'high'
        },
        compatibilityScore: 78,
        dimensionScore: 75,
        featureScore: 95,
        userFeedbackScore: 70,
        positiveFeedbackCount: 8,
        negativeFeedbackCount: 3,
        dimensionFit: {
          length: {
            fits: true,
            difference: 12.0,
            unit: 'in'
          },
          width: {
            fits: true,
            difference: 8.4,
            unit: 'in'
          },
          height: {
            fits: true,
            difference: 5.3,
            unit: 'in'
          }
        },
        createdAt: '2023-05-17T09:15:00Z',
        updatedAt: '2023-06-22T12:10:00Z'
      }
    ];
    
    // Extract unique gear and case types for filters
    const fetchGearAndCaseTypes = async () => {
      try {
        const response = await fetch('/api/admin/matches/gear-case-types');
        if (!response.ok) {
          throw new Error('Failed to fetch gear and case types');
        }
        const data = await response.json();
        setGearTypes(data.gearTypes);
        setCaseTypes(data.caseTypes);
      } catch (err) {
        console.error('Error fetching gear and case types:', err);
        // Fallback to extracting from current items if API fails
        const uniqueGearTypes = [...new Set(matches.map(item => 
          typeof item.gearId === 'object' && item.gearId && 'type' in item.gearId 
            ? (item.gearId as any).type 
            : 'Unknown'
        ))];
        const uniqueCaseTypes = [...new Set(matches.map(item => 
          typeof item.caseId === 'object' && item.caseId && 'type' in item.caseId 
            ? (item.caseId as any).type 
            : 'Unknown'
        ))];
        setGearTypes(uniqueGearTypes);
        setCaseTypes(uniqueCaseTypes);
      }
    };

    // Fetch match data
    fetchMatches();
    
    // Fetch gear and case types for filters
    fetchGearAndCaseTypes();
  }, [currentPage, itemsPerPage, searchTerm, filterGearType, filterCaseType, minScore, maxScore, sortField, sortDirection]);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Handle items per page change
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };
  
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };
  
  // Handle gear type filter change
  const handleGearTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterGearType(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };
  
  // Handle case type filter change
  const handleCaseTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterCaseType(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };
  
  // Handle min score change
  const handleMinScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinScore(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };
  
  // Handle max score change
  const handleMaxScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxScore(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };
  
  // Handle sort change
  const handleSortChange = (field: string) => {
    if (field === sortField) {
      // Toggle sort direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to descending for scores, ascending for other fields
      setSortField(field);
      setSortDirection(field.includes('Score') ? 'desc' : 'asc');
    }
  };
  
  // Handle add match
  const handleAddMatch = () => {
    setShowAddModal(true);
  };
  
  // Handle edit match
  const handleEditMatch = (match: IGearCaseMatch) => {
    setSelectedMatch(match);
    setShowEditModal(true);
  };
  
  // Handle delete match
  const handleDeleteMatch = (match: IGearCaseMatch) => {
    setSelectedMatch(match);
    setShowDeleteModal(true);
  };
  
  // Handle view match details
  const handleViewDetails = (match: IGearCaseMatch) => {
    setSelectedMatch(match);
    setShowDetailsModal(true);
  };
  
  // Handle import
  const handleImport = () => {
    setShowImportModal(true);
  };
  
  // Handle export
  const handleExport = async () => {
    try {
      // In a real implementation, this would call an API endpoint to generate the export
      alert('Export functionality will be implemented in a future update.');
    } catch (err) {
      setError('Failed to export data');
    }
  };
  
  // Handle run matching algorithm
  const handleRunMatching = async () => {
    try {
      // In a real implementation, this would call an API endpoint to run the matching algorithm
      alert('Matching algorithm functionality will be implemented in a future update.');
    } catch (err) {
      setError('Failed to run matching algorithm');
    }
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(startItem + itemsPerPage - 1, totalItems);
  
  // Generate page numbers for pagination
  const pageNumbers: (number | string)[] = [];
  const maxPageButtons = 5;
  
  if (totalPages <= maxPageButtons) {
    // Show all pages if there are fewer than maxPageButtons
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // Show a subset of pages with ellipsis
    if (currentPage <= 3) {
      // Near the start
      for (let i = 1; i <= 4; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push('...');
      pageNumbers.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Near the end
      pageNumbers.push(1);
      pageNumbers.push('...');
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // In the middle
      pageNumbers.push(1);
      pageNumbers.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push('...');
      pageNumbers.push(totalPages);
    }
  }
  
  // Function to render compatibility score with color coding
  const renderCompatibilityScore = (score: number) => {
    let colorClass = '';
    if (score >= 90) {
      colorClass = 'bg-green-100 text-green-800';
    } else if (score >= 75) {
      colorClass = 'bg-yellow-100 text-yellow-800';
    } else {
      colorClass = 'bg-red-100 text-red-800';
    }
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
        {score}%
      </span>
    );
  };
  
  // Function to render dimension fit status
  const renderDimensionFit = (dimensionFit: any) => {
    const allFit = dimensionFit.length.fits && dimensionFit.width.fits && dimensionFit.height.fits;
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${allFit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {allFit ? 'Fits' : 'Does Not Fit'}
      </span>
    );
  };
  
  return (
    <AdminLayout title="Match Management" subtitle="View, add, edit, and delete gear-case matches">
      {/* Filters and Actions */}
      <div className="mb-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              {/* Search */}
              <div className="w-full md:w-1/3">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Search matches"
                    type="search"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleAddMatch}
                >
                  Add Match
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={handleRunMatching}
                >
                  Run Matching
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleImport}
                >
                  Import
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleExport}
                >
                  Export
                </button>
              </div>
            </div>
            
            {/* Additional Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Gear Type Filter */}
              <div>
                <label htmlFor="gearType" className="block text-sm font-medium text-gray-700">Gear Type</label>
                <select
                  id="gearType"
                  name="gearType"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filterGearType}
                  onChange={handleGearTypeChange}
                >
                  <option value="">All Gear Types</option>
                  {gearTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              {/* Case Type Filter */}
              <div>
                <label htmlFor="caseType" className="block text-sm font-medium text-gray-700">Case Type</label>
                <select
                  id="caseType"
                  name="caseType"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filterCaseType}
                  onChange={handleCaseTypeChange}
                >
                  <option value="">All Case Types</option>
                  {caseTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              {/* Score Range Filters */}
              <div>
                <label htmlFor="minScore" className="block text-sm font-medium text-gray-700">Min Score</label>
                <input
                  type="number"
                  id="minScore"
                  name="minScore"
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  placeholder="Min"
                  min="0"
                  max="100"
                  value={minScore}
                  onChange={handleMinScoreChange}
                />
              </div>
              
              <div>
                <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700">Max Score</label>
                <input
                  type="number"
                  id="maxScore"
                  name="maxScore"
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  placeholder="Max"
                  min="0"
                  max="100"
                  value={maxScore}
                  onChange={handleMaxScoreChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Match Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : matches.length === 0 ? (
          <EmptyState 
            message="No matches found. Try adjusting your filters or run the matching algorithm."
            actionLabel="Run Matching"
            onAction={handleRunMatching}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Gear
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Case
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('compatibilityScore')}
                  >
                    <div className="flex items-center">
                      <span>Compatibility</span>
                      {sortField === 'compatibilityScore' && (
                        <svg className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? '' : 'transform rotate-180'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('dimensionScore')}
                  >
                    <div className="flex items-center">
                      <span>Dimension Score</span>
                      {sortField === 'dimensionScore' && (
                        <svg className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? '' : 'transform rotate-180'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Dimension Fit
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('userFeedbackScore')}
                  >
                    <div className="flex items-center">
                      <span>User Feedback</span>
                      {sortField === 'userFeedbackScore' && (
                        <svg className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? '' : 'transform rotate-180'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {matches.map((match) => {
                  // Handle populated or non-populated gear/case references
                  const gear = typeof match.gearId === 'object' && match.gearId ? match.gearId as any : { name: 'Unknown', brand: 'Unknown', type: 'Unknown' };
                  const caseItem = typeof match.caseId === 'object' && match.caseId ? match.caseId as any : { name: 'Unknown', brand: 'Unknown', type: 'Unknown' };
                  
                  return (
                  <tr key={match._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{gear.name}</div>
                          <div className="text-sm text-gray-500">{gear.brand} • {gear.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{caseItem.name}</div>
                          <div className="text-sm text-gray-500">{caseItem.brand} • {caseItem.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderCompatibilityScore(match.compatibilityScore)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {match.dimensionScore}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderDimensionFit(match.dimensionFit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="text-green-500 mr-1">+{match.positiveCount || 0}</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="text-red-500 ml-1">-{match.negativeCount || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(match)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleEditMatch(match)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMatch(match)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && !error && matches.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{' '}
                  <span className="font-medium">{totalItems}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {pageNumbers.map((page, index) => (
                    page === '...' ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={`page-${page}`}
                        onClick={() => handlePageChange(page as number)}
                        className={`relative inline-flex items-center px-4 py-2 border ${currentPage === page ? 'bg-indigo-50 border-indigo-500 text-indigo-600 z-10' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'} text-sm font-medium`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Add/Edit/Delete/Import/Details Modals will be implemented here */}
      {/* These will be implemented in the next phase */}
    </AdminLayout>
  );
};

export default MatchManagementPage;
