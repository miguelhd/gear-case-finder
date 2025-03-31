import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Link from 'next/link';

// Dashboard card component
const DashboardCard = ({ title, value, icon, color }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd>
              <div className="text-lg font-medium text-gray-900">{value}</div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

// Recent activity component
const ActivityItem = ({ title, time, description, icon }) => (
  <div className="relative pb-8">
    <div className="relative flex items-start space-x-3">
      <div className="relative">
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
          <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div>
          <div className="text-sm">
            <span className="font-medium text-gray-900">{title}</span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">{time}</p>
        </div>
        <div className="mt-2 text-sm text-gray-700">
          <p>{description}</p>
        </div>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = React.useState([
    { 
      title: 'Total Audio Gear', 
      value: 'Loading...', 
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', 
      color: 'bg-blue-500' 
    },
    { 
      title: 'Total Cases', 
      value: 'Loading...', 
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z', 
      color: 'bg-green-500' 
    },
    { 
      title: 'Matches Found', 
      value: 'Loading...', 
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', 
      color: 'bg-purple-500' 
    },
    { 
      title: 'Scraper Jobs', 
      value: 'Loading...', 
      icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', 
      color: 'bg-yellow-500' 
    }
  ]);

  const [activities, setActivities] = React.useState([
    {
      title: 'Loading activities...',
      time: '',
      description: 'Please wait while we fetch the latest activities.',
      icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
    }
  ]);
  
  // Fetch real data from the database
  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/admin/database-stats');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        
        // Update stats with real data
        setStats([
          { 
            title: 'Total Audio Gear', 
            value: data.gearCount.toString(), 
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', 
            color: 'bg-blue-500' 
          },
          { 
            title: 'Total Cases', 
            value: data.caseCount.toString(), 
            icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z', 
            color: 'bg-green-500' 
          },
          { 
            title: 'Matches Found', 
            value: data.matchCount.toString(), 
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', 
            color: 'bg-purple-500' 
          },
          { 
            title: 'Categories', 
            value: data.gearCategories.toString(), 
            icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', 
            color: 'bg-yellow-500' 
          }
        ]);
        
        // Transform recent activity data
        if (data.recentActivity && data.recentActivity.length > 0) {
          const formattedActivities = data.recentActivity.map(activity => {
            const timeAgo = getTimeAgo(new Date(activity.timestamp));
            return {
              title: `${activity.collection} ${activity.operation}`,
              time: timeAgo,
              description: `${activity.count} items ${activity.operation}ed in ${activity.collection} collection.`,
              icon: getIconForActivity(activity.operation)
            };
          });
          
          setActivities(formattedActivities);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Helper function to format time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    }
    
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };
  
  // Helper function to get icon for activity type
  const getIconForActivity = (operation) => {
    switch (operation) {
      case 'insert':
        return 'M12 4v16m8-8H4';
      case 'update':
        return 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15';
      case 'delete':
        return 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16';
      default:
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  };

  return (
    <AdminLayout title="Dashboard" subtitle="Overview of your system">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <DashboardCard key={index} {...stat} />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Link href="/admin/database" className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  Manage Database
                </Link>
              </div>
              <div>
                <button onClick={() => fetch('/api/admin/clear-cache', { method: 'POST' }).then(() => alert('Cache cleared successfully'))} className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Clear Cache
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
            <div className="mt-5 flow-root">
              <div className="-mb-8">
                {activities.map((activity, index) => (
                  <ActivityItem key={index} {...activity} />
                ))}
              </div>
            </div>
            <div className="mt-6">
              <button onClick={() => window.location.reload()} className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Refresh Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
