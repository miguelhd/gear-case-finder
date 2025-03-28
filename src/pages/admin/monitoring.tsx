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
        // This would normally be done server-side
        let filteredLogs = [...logs];
        if (logFilter !== 'all') {
          filteredLogs = logs.filter(log => log.level === logFilter);
        }
        
        // Apply time range filter
        // This would normally be done server-side
        const now = new Date();
        let timeLimit;
        
        switch (timeRange) {
          case '1h':
            timeLimit = new Date(now.getTime() - 60 * 60 * 1000);
            break;
          case '6h':
            timeLimit = new Date(now.getTime() - 6 * 60 * 60 * 1000);
            break;
          case '24h':
            timeLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7d':
            timeLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            timeLimit = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            timeLimit = new Date(0); // No time limit
        }
        
        // In a real implementation, this filtering would be done server-side
        // filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= timeLimit);
        
      } catch (error) {
        console.error('Error refreshing logs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    refreshLogs();
  }, [logFilter, timeRange]);

  // Handle log filter change
  const handleFilterChange = (e) => {
    setLogFilter(e.target.value);
  };

  // Handle time range change
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  // Handle chart type change
  const handleChartChange = (chartId) => {
    setActiveChart(chartId);
  };

  // Filter logs based on selected filter
  const filteredLogs = logFilter === 'all' 
    ? logs 
    : logs.filter(log => log.level === logFilter);

  // Handle log entry expansion
  const handleLogExpand = () => {
    // In a real implementation, this might fetch additional details for the log
    console.log('Log entry expanded');
  };

  return (
    <AdminLayout title="Monitoring" subtitle="Monitor system health and logs">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">System Monitoring</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">System Health</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {healthMetrics.map((metric) => (
                  <HealthCard
                    key={metric.id}
                    id={metric.id}
                    name={metric.name}
                    status={metric.status}
                    value={metric.value}
                    description={metric.description}
                  />
                ))}
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex" aria-label="Tabs">
                    {healthMetrics.map((metric) => (
                      <button
                        key={metric.id}
                        className={`
                          w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm
                          ${activeChart === metric.id
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                        `}
                        onClick={() => handleChartChange(metric.id)}
                      >
                        {metric.name}
                      </button>
                    ))}
                  </nav>
                </div>
                <div className="p-4">
                  <PerformanceChart
                    title={`${healthMetrics.find(m => m.id === activeChart)?.name} Over Time`}
                    data={[]}
                    type={activeChart}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">System Logs</h2>
                <div className="flex space-x-2">
                  <select
                    id="log-filter"
                    name="log-filter"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={logFilter}
                    onChange={handleFilterChange}
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
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={timeRange}
                    onChange={handleTimeRangeChange}
                  >
                    <option value="1h">Last Hour</option>
                    <option value="6h">Last 6 Hours</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                </div>
              </div>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="divide-y divide-gray-200">
                  {isLoading ? (
                    <div className="px-4 py-5 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading logs...</p>
                    </div>
                  ) : filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <LogEntry 
                        key={log.id} 
                        timestamp={log.timestamp} 
                        level={log.level} 
                        source={log.source} 
                        message={log.message} 
                        onExpand={handleLogExpand} 
                      />
                    ))
                  ) : (
                    <div className="px-4 py-5 text-center text-sm text-gray-500">
                      No logs found matching the selected filters.
                    </div>
                  )}
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
