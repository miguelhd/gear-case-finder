// Admin dashboard component for monitoring system health and data
import React, { useState, useEffect } from 'react';
import { getScraperHealth } from '../lib/monitoring';
import { getCacheStats } from '../lib/cache';

const AdminDashboard = () => {
  const [scraperHealth, setScraperHealth] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [databaseStats, setDatabaseStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch data from API endpoints
        const [healthResponse, cacheResponse, dbResponse] = await Promise.all([
          fetch('/api/admin/scraper-health'),
          fetch('/api/admin/cache-stats'),
          fetch('/api/admin/database-stats')
        ]);
        
        if (!healthResponse.ok || !cacheResponse.ok || !dbResponse.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const healthData = await healthResponse.json();
        const cacheData = await cacheResponse.json();
        const dbData = await dbResponse.json();
        
        setScraperHealth(healthData);
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
      
      // Fetch data from API endpoints
      const [healthResponse, cacheResponse, dbResponse] = await Promise.all([
        fetch('/api/admin/scraper-health'),
        fetch('/api/admin/cache-stats'),
        fetch('/api/admin/database-stats')
      ]);
      
      if (!healthResponse.ok || !cacheResponse.ok || !dbResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const healthData = await healthResponse.json();
      const cacheData = await cacheResponse.json();
      const dbData = await dbResponse.json();
      
      setScraperHealth(healthData);
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
  
  const handleRunScraper = async (marketplace: string) => {
    try {
      const response = await fetch('/api/admin/run-scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ marketplace })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to run ${marketplace} scraper`);
      }
      
      alert(`${marketplace} scraper job started successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };
  
  if (loading && !scraperHealth) {
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
              activeTab === 'scrapers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('scrapers')}
          >
            Scrapers
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
      {activeTab === 'overview' && scraperHealth && cacheStats && databaseStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* System Status Card */}
          <div className={`p-6 rounded-lg shadow-md ${
            scraperHealth.status === 'healthy' ? 'bg-green-50 border border-green-200' :
            scraperHealth.status === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-red-50 border border-red-200'
          }`}>
            <h2 className="text-xl font-semibold mb-4">System Status</h2>
            <div className="flex items-center mb-4">
              <div className={`w-4 h-4 rounded-full mr-2 ${
                scraperHealth.status === 'healthy' ? 'bg-green-500' :
                scraperHealth.status === 'warning' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></div>
              <span className="capitalize">{scraperHealth.status}</span>
            </div>
            <p className="text-sm text-gray-600">Last Updated: {new Date(scraperHealth.lastUpdated).toLocaleString()}</p>
          </div>
          
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
            </div>
          </div>
          
          {/* Cache Stats Card */}
          <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Cache</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Items Cached:</span>
                <span className="font-medium">{cacheStats.itemCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hit Rate:</span>
                <span className="font-medium">{(cacheStats.hitRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Size:</span>
                <span className="font-medium">{cacheStats.size} / {cacheStats.maxSize}</span>
              </div>
            </div>
          </div>
          
          {/* Scraper Summary Card */}
          <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200 md:col-span-3">
            <h2 className="text-xl font-semibold mb-4">Scraper Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-500">Total Requests</p>
                <p className="text-2xl font-bold">{scraperHealth.summary.totalRequests}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-2xl font-bold">
                  {scraperHealth.summary.totalRequests > 0 
                    ? ((scraperHealth.summary.successfulRequests / scraperHealth.summary.totalRequests) * 100).toFixed(1) 
                    : 0}%
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-500">Items Scraped</p>
                <p className="text-2xl font-bold">{scraperHealth.summary.itemsScraped}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-500">Error Count</p>
                <p className="text-2xl font-bold">{scraperHealth.summary.errorCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Scrapers Tab */}
      {activeTab === 'scrapers' && scraperHealth && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Scraper Status</h2>
            <div className="flex space-x-2">
              <button 
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                onClick={() => handleRunScraper('all')}
              >
                Run All Scrapers
              </button>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marketplace
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Run
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recent Errors
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(scraperHealth.marketplaces).map(([marketplace, data]: [string, any]) => (
                  <tr key={marketplace}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{marketplace}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        data.status === 'healthy' ? 'bg-green-100 text-green-800' :
                        data.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {data.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {data.lastRun ? new Date(data.lastRun).toLocaleString() : 'Never'}
                      </div>
                      {data.lastRunAgeHours !== null && (
                        <div className="text-xs text-gray-500">
                          {data.lastRunAgeHours < 1 
                            ? 'Less than an hour ago' 
                            : `${data.lastRunAgeHours} hours ago`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{data.successRate}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{data.recentErrors}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        onClick={() => handleRunScraper(marketplace)}
                      >
                        Run Now
                      </button>
                      <a href={`/admin/logs?marketplace=${marketplace}`} className="text-gray-600 hover:text-gray-900">
                        View Logs
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Database Tab */}
      {activeTab === 'database' && databaseStats && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Database Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-medium mb-4">Audio Gear</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">{databaseStats.gearCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Categories:</span>
                  <span className="font-medium">{databaseStats.gearCategories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Brands:</span>
                  <span className="font-medium">{databaseStats.gearBrands}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-medium mb-4">Cases</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">{databaseStats.caseCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Types:</span>
                  <span className="font-medium">{databaseStats.caseTypes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Brands:</span>
                  <span className="font-medium">{databaseStats.caseBrands}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-medium mb-4">Matches</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Matches:</span>
                  <span className="font-medium">{databaseStats.matchCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Compatibility:</span>
                  <span className="font-medium">{databaseStats.avgCompatibility}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">High Compatibility:</span>
                  <span className="font-medium">{databaseStats.highCompatibilityCount}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Recent Database Activity</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collection
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operation
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {databaseStats.recentActivity.map((activity: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(activity.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.collection}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.operation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Cache Tab */}
      {activeTab === 'cache' && cacheStats && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Cache Statistics</h2>
            <button 
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleClearCache}
            >
              Clear Cache
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-medium mb-4">Cache Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items Cached:</span>
                  <span className="font-medium">{cacheStats.itemCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Items:</span>
                  <span className="font-medium">{cacheStats.maxItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Size:</span>
                  <span className="font-medium">{cacheStats.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Size:</span>
                  <span className="font-medium">{cacheStats.maxSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hit Rate:</span>
                  <span className="font-medium">{(cacheStats.hitRate * 100).toFixed(1)}%</span>
                </div>
              </div>
              
              {/* Cache usage bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Usage</span>
                  <span>{Math.round((cacheStats.size / cacheStats.maxSize) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, (cacheStats.size / cacheStats.maxSize) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-medium mb-4">Cache Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Requests:</span>
                  <span className="font-medium">{cacheStats.totalRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cache Hits:</span>
                  <span className="font-medium">{cacheStats.hits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cache Misses:</span>
                  <span className="font-medium">{cacheStats.misses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Response Time (Cached):</span>
                  <span className="font-medium">{cacheStats.avgCachedResponseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Response Time (Uncached):</span>
                  <span className="font-medium">{cacheStats.avgUncachedResponseTime}ms</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Cache Entries by Type</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cache Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hit Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. TTL
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cacheStats.entriesByType.map((entry: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(entry.hitRate * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.avgTtl / 1000}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
