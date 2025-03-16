import React, { ReactNode } from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/" className="text-2xl font-bold">
                Gear Case Finder
              </Link>
              <p className="text-sm">Find the perfect case for your audio gear</p>
            </div>
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <Link href="/gear" className="hover:text-blue-200 transition-colors">
                    Browse Gear
                  </Link>
                </li>
                <li>
                  <Link href="/cases" className="hover:text-blue-200 transition-colors">
                    Browse Cases
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-4">Gear Case Finder</h3>
              <p className="text-gray-400">Finding the perfect protection for your audio equipment</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white">Home</Link></li>
                <li><Link href="/gear" className="text-gray-400 hover:text-white">Gear</Link></li>
                <li><Link href="/cases" className="text-gray-400 hover:text-white">Cases</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Gear Case Finder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
