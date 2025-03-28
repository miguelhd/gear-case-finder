import React, { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader, { HeaderProps } from './AdminHeader';

interface AdminLayoutProps {
  /**
   * Content to be rendered inside the layout
   */
  children: ReactNode;
  
  /**
   * Title to display in the header
   */
  title: string;
  
  /**
   * Optional subtitle to display below the title
   */
  subtitle?: string | undefined;
}

const AdminLayout = ({ children, title, subtitle }: AdminLayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title={title} subtitle={subtitle} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        
        <footer className="bg-white border-t border-gray-200 p-4">
          <div className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Gear Case Finder Admin Dashboard
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
