import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Navigation items for the sidebar - only showing features that have actual backend implementations
const navigationItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  },
  {
    name: 'Database',
    href: '/admin/database',
    icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4'
  }
];

const AdminSidebar = () => {
  const router = useRouter();
  
  return (
    <div className="h-screen flex-none w-64 bg-gray-800 text-white">
      <div className="p-4">
        <h1 className="text-xl font-bold">Gear Case Finder</h1>
        <p className="text-sm text-gray-400">Admin Dashboard</p>
      </div>
      
      <nav className="mt-5">
        <ul>
          {navigationItems.map((item) => {
            const isActive = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
            
            return (
              <li key={item.name} className="mb-2">
                <Link href={item.href} className={`flex items-center px-4 py-2 text-sm ${isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                    <svg 
                      className="mr-3 h-5 w-5" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-700">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
            <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-gray-400">View Profile</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
