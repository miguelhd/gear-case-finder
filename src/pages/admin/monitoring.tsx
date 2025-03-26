import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

// API handler for fetching system health metrics
const fetchSystemHealth = async () => {
  try {
    const response = await fetch('/api/admin/monitoring/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch system health:', error);
    throw error;
  }
};

// API handler for fetching logs
const fetchLogs = async (filter = 'all', timeRange = '24h', limit = 100) => {
  try {
    const response = await fetch(`/api/admin/monitoring/logs?filter=${filter}&timeRange=${timeRange}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    throw error;
  }
};

// Log entry component
const LogEntry = ({ timestamp, level, source, message, onExpand }) => {
  const levelColors = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    debug: 'bg-gray-100 text-gray-800'
  };

  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
    if (onExpand) {
      onExpand();
    }
  };

  return (
    <div className="px-4 py-3 border-b border-gray-200 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${levelColors[level]}`}>
            {level.toUpperCase()}
          </span>
          <span className="ml-2 text-sm text-gray-500">{timestamp}</span>
          <span className="ml-2 text-sm font-medium text-gray-700">{source}</span>
        </div>
        <button
          type="button"
          className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={toggleExpand}
        >
          <svg 
            className={`h-4 w-4 transform ${expanded ? 'rotate-180' : ''}`} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      <div className={`mt-1 text-sm text-gray-900 ${expanded ? '' : 'line-clamp-2'}`}>
        {message}
      </div>
      {expanded && (
        <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <div><strong>Timestamp:</strong> {timestamp}</div>
          <div><strong>Level:</strong> {level}</div>
          <div><strong>Source:</strong> {source}</div>
          <div><strong>Message:</strong> {message}</div>
        </div>
      )}
    </div>
  );
};

// System health card component
const HealthCard = ({ id, name, status, value, description }) => {
  const statusColors = {
    healthy: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{name}</h3>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        <div className="mt-1 text-3xl font-semibold text-gray-900">{value}</div>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
};

// Performance chart component
const PerformanceChart = ({ title, data, type }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Chart for {type} would be displayed here</p>
        </div>
      </div>
    </div>
  );
};

const MonitoringPage = () => {
  // State for health metrics
  const [healthMetrics, setHealthMetrics] = useState([
    {
      id: 'cpu',
      name: 'CPU Usage',
      status: 'healthy',
      value: '12%',
      description: 'Average over last 5 minutes'
    },
    {
      id: 'memory',
      name: 'Memory Usage',
      status: 'healthy',
      value: '1.2 GB',
      description: '30% of available memory'
    },
    {
      id: 'disk',
      name: 'Disk Space',
      status: 'warning',
      value: '75%',
      description: '25% free space remaining'
    },
    {
      id: 'api',
      name: 'API Response',
      status: 'healthy',
      value: '120 ms',
      description: 'Average response time'
    },
    {
      id: 'database',
      name: 'Database',
      status: 'healthy',
      value: 'Connected',
      description: 'MongoDB Atlas - M0 Cluster'
    },
    {
      id: 'scrapers',
      name: 'Scrapers',
      status: 'healthy',
      value: '5/5',
      description: 'All scrapers operational'
    }
  ]);

  // State for logs
  const [logs, setLogs] = useState([
    {
      id: 1,
      timestamp: '2025-03-26 18:45:12',
      level: 'info',
      source: 'Amazon Scraper',
      message: 'Scraper started for category: Audio Equipment'
    },
    {
      id: 2,
      timestamp: '2025-03-26 18:47:35',
      level: 'warning',
      source: 'Amazon Scraper',
      message: 'Rate limiting detected, slowing down requests'
    },
    {
      id: 3,
      timestamp: '2025-03-26 18:52:08',
      level: 'info',
      source: 'Amazon Scraper',
      message: 'Scraper completed. 124 products scraped successfully'
    },
    {
      id: 4,
      timestamp: '2025-03-26 19:01:45',
      level: 'error',
      source: 'Database Import',
      message: 'Failed to import 3 products due to validation errors'
    },
    {
      id: 5,
      timestamp: '2025-03-26 19:05:22',
      level: 'info',
      source: 'Database Import',
      message: 'Successfully imported 121 products to AudioGear collection'
    },
    {
      id: 6,
      timestamp: '2025-03-26 19:10:17',
      level: 'debug',
      source: 'Match Algorithm',
      message: 'Processing matches for gear ID: 5f8d43e1c812d8e6b324a123'
    }
  ]);

  // State for log filters
  const [logFilter, setLogFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [isLoading, setIsLoading] = useState(false);
  const [activeChart, setActiveChart] = useState('cpu');

  // Fetch health metrics and logs on load
  useEffect(() => {
    const loadMonitoringData = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, these would be API calls
        // const healthData = await fetchSystemHealth();
        // setHealthMetrics(healthData.metrics);
        
        // const logsData = await fetchLogs(logFilter, timeRange);
        // setLogs(logsData.logs);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error('Error loading monitoring data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMonitoringData();
  }, []);

  // Refresh data when filters change
  useEffect(() => {
    const refreshLogs = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, this would be an API call
        // const logsData = await fetchLogs(logFilter, timeRange);
        // setLogs(logsData.logs);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Filter logs based on selected filter
        if (logFilter !== 'all') {
          setLogs(prevLogs => prevLogs.filter(log => log.level === logFilter));
        } else {
          // Reset to original logs (in a real implementation, this would fetch all logs)
          setLogs([
            {
              id: 1,
              timestamp: '2025-03-26 18:45:12',
              level: 'info',
              source: 'Amazon Scraper',
              message: 'Scraper started for category: Audio Equipment'
            },
            {
              id: 2,
              timestamp: '2025-03-26 18:47:35',
              level: 'warning',
              source: 'Amazon Scraper',
              message: 'Rate limiting detected, slowing down requests'
            },
            {
              id: 3,
              timestamp: '2025-03-26 18:52:08',
              level: 'info',
              source: 'Amazon Scraper',
              message: 'Scraper completed. 124 products scraped successfully'
            },
            {
              id: 4,
              timestamp: '2025-03-26 19:01:45',
              level: 'error',
              source: 'Database Import',
              message: 'Failed to import 3 products due to validation errors'
            },
            {
              id: 5,
              timestamp: '2025-03-26 19:05:22',
              level: 'info',
              source: 'Database Import',
              message: 'Successfully imported 121 products to AudioGear collection'
            },
            {
              id: 6,
              timestamp: '2025-03-26 19:10:17',
              level: 'debug',
              source: 'Match Algorithm',
              message: 'Processing matches for gear ID: 5f8d43e1c812d8e6b324a123'
            }
          ]);
        }
        
      } catch (error) {
        console.error('Error refreshing logs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    refreshLogs();
  }, [logFilter, timeRange]);

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, these would be API calls
      // const healthData = await fetchSystemHealth();
      // setHealthMetrics(healthData.metrics);
      
      // const logsData = await fetchLogs(logFilter, timeRange);
      // setLogs(logsData.logs);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update a random health metric to simulate changes
      const randomIndex = Math.floor(Math.random() * healthMetrics.length);
      const updatedMetrics = [...healthMetrics];
      
      if (updatedMetrics[randomIndex].id === 'cpu') {
        const newValue = Math.floor(Math.random() * 80) + '%';
        updatedMetrics[randomIndex] = {
          ...updatedMetrics[randomIndex],
          value: newValue,
          status: parseInt(newValue) > 70 ? 'warning' : 'healthy'
        };
      } else if (updatedMetrics[randomIndex].id === 'memory') {
        const newValue = (Math.random() * 3.5).toFixed(1) + ' GB';
        updatedMetrics[randomIndex] = {
          ...updatedMetrics[randomIndex],
          value: newValue
        };
      }
      
      setHealthMetrics(updatedMetrics);
      
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadLogs = () => {
    // In a real implementation, this would generate and download a log file
    const logText = logs.map(log => 
      `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(log => {
    if (logFilter === 'all') return true;
    return log.level === logFilter;
  });

  return (
    <AdminLayout title="Monitoring" subtitle="Monitor system health and logs">
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Refreshing...
            </>
          ) : (
            <>
              <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {healthMetrics.map((metric) => (
          <HealthCard key={metric.id} {...metric} />
        ))}
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">System Logs</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">View and filter system activity logs</p>
          </div>
          <div className="flex space-x-3">
            <select
              id="log-filter"
              name="log-filter"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
              disabled={isLoading}
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="debug">Debug</option>
            </select>
            <select
              id="time-range"
              name="time-range"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              disabled={isLoading}
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Refresh
            </button>
          </div>
        </div>
        <div className="border-t border-gray-200 divide-y divide-gray-200">
          {isLoading ? (
            <div className="px-4 py-5 text-center">
              <svg className="animate-spin mx-auto h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-sm text-gray-500">Loading logs...</p>
            </div>
          ) : filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <LogEntry key={log.id} {...log} />
            ))
          ) : (
            <div className="px-4 py-5 text-center text-sm text-gray-500">
              No logs found matching the current filters.
            </div>
          )}
        </div>
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={handleDownloadLogs}
          >
            Download Logs
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Performance Metrics</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">System performance over time</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            {activeChart === 'cpu' && (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-500">CPU Usage Chart</p>
              </div>
            )}
            {activeChart === 'memory' && (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-500">Memory Usage Chart</p>
              </div>
            )}
            {activeChart === 'api' && (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-500">API Response Time Chart</p>
              </div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              type="button"
              className={`inline-flex items-center justify-center px-4 py-2 border ${
                activeChart === 'cpu' 
                  ? 'border-indigo-500 text-indigo-700 bg-indigo-50' 
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              } shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              onClick={() => setActiveChart('cpu')}
            >
              CPU Usage
            </button>
            <button
              type="button"
              className={`inline-flex items-center justify-center px-4 py-2 border ${
                activeChart === 'memory' 
                  ? 'border-indigo-500 text-indigo-700 bg-indigo-50' 
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              } shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              onClick={() => setActiveChart('memory')}
            >
              Memory Usage
            </button>
            <button
              type="button"
              className={`inline-flex items-center justify-center px-4 py-2 border ${
                activeChart === 'api' 
                  ? 'border-indigo-500 text-indigo-700 bg-indigo-50' 
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              } shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              onClick={() => setActiveChart('api')}
            >
              API Response Time
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">System Alerts</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Recent system alerts and notifications</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="space-y-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Disk space is running low (75% used). Consider clearing unused data.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      All scrapers are operational and running as scheduled.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Resource Usage</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Current system resource utilization</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-500">CPU Usage</div>
                  <div className="text-sm font-medium text-gray-900">12%</div>
                </div>
                <div className="mt-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '12%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-500">Memory Usage</div>
                  <div className="text-sm font-medium text-gray-900">1.2 GB / 4 GB</div>
                </div>
                <div className="mt-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-500">Disk Space</div>
                  <div className="text-sm font-medium text-gray-900">15 GB / 20 GB</div>
                </div>
                <div className="mt-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-500">Network I/O</div>
                  <div className="text-sm font-medium text-gray-900">2.5 MB/s</div>
                </div>
                <div className="mt-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MonitoringPage;
