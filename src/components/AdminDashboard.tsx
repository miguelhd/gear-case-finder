// Admin dashboard component for monitoring system health and data
import React, { useState, useEffect } from 'react';
import { getCacheStats } from '../lib/cache';

const AdminDashboard = () => {
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [databaseStats, setDatabaseStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch data from API endpoints - only fetch from endpoints that actually exist
        const [cacheResponse, dbResponse] = await Promise.all([
          fetch('/api/admin/cache-stats'),
          fetch('/api/admin/database-stats')
        ]);
        
        if (!cacheResponse.ok || !dbResponse.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const cacheData = await cacheResponse.json();
        const dbData = await dbResponse.json();
        
        setCacheStats(cacheData);
        setDatabaseStats(dbData);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchData, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const handleRefresh = async () => {
    try {
      setLoading(true);
      
      // Fetch data from API endpoints - only fetch from endpoints that actually exist
      const [cacheResponse, dbResponse] = await Promise.all([
        fetch('/api/admin/cache-stats'),
        fetch('/api/admin/database-stats')
      ]);
      
      if (!cacheResponse.ok || !dbResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const cacheData = await cacheResponse.json();
      const dbData = await dbResponse.json();
      
      setCacheStats(cacheData);
      setDatabaseStats(dbData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };
  
  const handleClearCache = async () => {
    try {
      const response = await fetch('/api/admin/clear-cache', { method: 'POST' });
      
      if (!response.ok) {
        throw new Error('Failed to clear cache');
      }
      
      // Refresh cache stats
      const cacheResponse = await fetch('/api/admin/cache-stats');
      const cacheData = await cacheResponse.json();
      setCacheStats(cacheData);
      
      alert('Cache cleared successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };
  
  if (loading && (!cacheStats || !databaseStats)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
        <button 
          className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleRefresh}
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <button 
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleClearCache}
          >
            Clear Cache
          </button>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`${
              activeTab === 'database'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('database')}
          >
            Database
          </button>
          <button
            className={`${
              activeTab === 'cache'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('cache')}
          >
            Cache
          </button>
        </nav>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && cacheStats && databaseStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Database Stats Card */}
          <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Database</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Gear Items:</span>
                <span className="font-medium">{databaseStats.gearCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cases:</span>
                <span className="font-medium">{databaseStats.caseCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Matches:</span>
                <span className="font-medium">{databaseStats.matchCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Connection Status:</span>
                <span className={`font-medium ${databaseStats.connected ? 'text-green-600' : 'text-red-600'}`}>
                  {databaseStats.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Cache Stats Card */}
          <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Cache</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${cacheStats.enabled ? 'text-green-600' : 'text-gray-600'}`}>
                  {cacheStats.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Items Cached:</span>
                <span className="font-medium">{cacheStats.itemCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hit Rate:</span>
                <span className="font-medium">{cacheStats.hitRate ? `${cacheStats.hitRate.toFixed(1)}%` : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Database Tab */}
      {activeTab === 'database' && databaseStats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Database Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Collection Statistics</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collection</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {databaseStats.collections && databaseStats.collections.map((collection: any) => (
                    <tr key={collection.name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{collection.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{collection.count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{collection.size} KB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Connection Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-2">
                  <span className="font-medium">Status: </span>
                  <span className={databaseStats.connected ? 'text-green-600' : 'text-red-600'}>
                    {databaseStats.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-medium">Host: </span>
                  <span>{databaseStats.host || 'N/A'}</span>
                </div>
                <div className="mb-2">
                  <span className="font-medium">Database: </span>
                  <span>{databaseStats.database || 'N/A'}</span>
                </div>
                <div className="mb-2">
                  <span className="font-medium">Version: </span>
                  <span>{databaseStats.version || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Cache Tab */}
      {activeTab === 'cache' && cacheStats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Cache Details</h2>
            <button 
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleClearCache}
            >
              Clear Cache
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Cache Statistics</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-2">
                  <span className="font-medium">Status: </span>
                  <span className={cacheStats.enabled ? 'text-green-600' : 'text-gray-600'}>
                    {cacheStats.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-medium">Items Cached: </span>
                  <span>{cacheStats.itemCount || 0}</span>
                </div>
                <div className="mb-2">
                  <span className="font-medium">Hit Rate: </span>
                  <span>{cacheStats.hitRate ? `${cacheStats.hitRate.toFixed(1)}%` : 'N/A'}</span>
                </div>
                <div className="mb-2">
                  <span className="font-medium">Hits: </span>
                  <span>{cacheStats.hits || 0}</span>
                </div>
                <div className="mb-2">
                  <span className="font-medium">Misses: </span>
                  <span>{cacheStats.misses || 0}</span>
                </div>
              </div>
            </div>
            
            {cacheStats.namespaceStats && (
              <div>
                <h3 className="text-lg font-medium mb-3">Cache Namespaces</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Namespace</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cacheStats.namespaceStats.map((ns: any) => (
                      <tr key={ns.namespace}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ns.namespace}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ns.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
