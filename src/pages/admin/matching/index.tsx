import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import AlgorithmConfigModal from '../../../components/admin/modals/AlgorithmConfigModal';
import ManualMatchingModal from '../../../components/admin/modals/ManualMatchingModal';
import MatchStatisticsModal from '../../../components/admin/modals/MatchStatisticsModal';

interface MatchingStats {
  totalMatches: number;
  highQualityMatches: number;
  averageScore: number;
  recentMatches: {
    gearName: string;
    caseName: string;
    score: number;
    date: string;
  }[];
}

const MatchingSystemPage: React.FC = () => {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isMatchingModalOpen, setIsMatchingModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchingStats, setMatchingStats] = useState<MatchingStats | null>(null);
  const [lastRunInfo, setLastRunInfo] = useState<{
    date: string;
    matchesCreated: number;
    duration: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch matching statistics
      const statsResponse = await fetch('/api/admin/matching/dashboard-stats');
      
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch matching statistics');
      }
      
      const statsData = await statsResponse.json();
      setMatchingStats(statsData.stats);
      setLastRunInfo(statsData.lastRun);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAlgorithmConfig = async (parameters: any[]) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/admin/matching/parameters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ parameters })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save algorithm parameters');
      }
      
      setIsConfigModalOpen(false);
      // Show success message or notification
    } catch (err) {
      console.error('Error saving algorithm parameters:', err);
      // Show error message or notification
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRunMatching = async (options: any) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/admin/matching/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      });
      
      if (!response.ok) {
        throw new Error('Failed to run matching operation');
      }
      
      const result = await response.json();
      setIsMatchingModalOpen(false);
      
      // Update last run info
      setLastRunInfo({
        date: new Date().toISOString(),
        matchesCreated: result.matchesCreated,
        duration: result.duration
      });
      
      // Refresh dashboard data
      fetchDashboardData();
      
      // Show success message or notification
    } catch (err) {
      console.error('Error running matching operation:', err);
      // Show error message or notification
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AdminLayout title="Matching System" subtitle="Configure and run the gear-case matching algorithm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Matching System</h1>
            <p className="mt-2 text-sm text-gray-700">
              Configure matching algorithm parameters, run manual matching operations, and view match statistics.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
            <button
              type="button"
              onClick={() => setIsConfigModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Configure Algorithm
            </button>
            <button
              type="button"
              onClick={() => setIsMatchingModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
            >
              Run Matching
            </button>
            <button
              type="button"
              onClick={() => setIsStatsModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:w-auto"
            >
              View Statistics
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="mt-8 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading dashboard data</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Matches</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{matchingStats?.totalMatches || 0}</dd>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">High Quality Matches</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{matchingStats?.highQualityMatches || 0}</dd>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Average Match Score</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{matchingStats?.averageScore?.toFixed(1) || 0}%</dd>
                </div>
              </div>
            </div>
            
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Last Matching Run</h3>
                  {lastRunInfo ? (
                    <div className="mt-5">
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Date</dt>
                          <dd className="mt-1 text-sm text-gray-900">{new Date(lastRunInfo.date).toLocaleString()}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Matches Created</dt>
                          <dd className="mt-1 text-sm text-gray-900">{lastRunInfo.matchesCreated}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Duration</dt>
                          <dd className="mt-1 text-sm text-gray-900">{lastRunInfo.duration}</dd>
                        </div>
                      </dl>
                    </div>
                  ) : (
                    <div className="mt-5 text-sm text-gray-500">
                      No matching operations have been run yet.
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Matches</h3>
                  <div className="mt-5">
                    {matchingStats?.recentMatches && matchingStats.recentMatches.length > 0 ? (
                      <div className="flow-root">
                        <ul className="-my-5 divide-y divide-gray-200">
                          {matchingStats.recentMatches.map((match, index) => (
                            <li key={index} className="py-4">
                              <div className="flex items-center space-x-4">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {match.gearName}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate">
                                    {match.caseName}
                                  </p>
                                </div>
                                <div>
                                  <div className="flex items-center">
                                    <span className="mr-2 text-sm font-medium text-gray-900">{match.score}%</span>
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full ${
                                          match.score >= 80 ? 'bg-green-600' : 
                                          match.score >= 50 ? 'bg-yellow-400' : 
                                          'bg-red-600'
                                        }`} 
                                        style={{ width: `${match.score}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(match.date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        No recent matches found.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <AlgorithmConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={handleSaveAlgorithmConfig}
        isProcessing={isProcessing}
      />
      
      <ManualMatchingModal
        isOpen={isMatchingModalOpen}
        onClose={() => setIsMatchingModalOpen(false)}
        onRunMatching={handleRunMatching}
        isProcessing={isProcessing}
      />
      
      <MatchStatisticsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
      />
    </AdminLayout>
  );
};

export default MatchingSystemPage;
