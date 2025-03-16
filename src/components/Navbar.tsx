import React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

interface NavbarProps {
  transparent?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ transparent = false }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // After mounting, we have access to the theme
  React.useEffect(() => setMounted(true), []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className={`w-full z-30 ${transparent ? 'absolute' : 'bg-white dark:bg-gray-900 shadow-md'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  MusicianCaseFinder
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/gear">
                <span className="border-transparent text-gray-900 dark:text-gray-100 hover:border-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Gear
                </span>
              </Link>
              <Link href="/cases">
                <span className="border-transparent text-gray-900 dark:text-gray-100 hover:border-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Cases
                </span>
              </Link>
              <Link href="/finder">
                <span className="border-transparent text-gray-900 dark:text-gray-100 hover:border-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Case Finder
                </span>
              </Link>
              <Link href="/guides">
                <span className="border-transparent text-gray-900 dark:text-gray-100 hover:border-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Guides
                </span>
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              <button
                onClick={toggleTheme}
                className="p-1 rounded-full text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {mounted && theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="ml-3 relative">
              <Link href="/search">
                <button className="p-1 rounded-full text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/gear">
              <span className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-700 dark:hover:text-indigo-300 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium">
                Gear
              </span>
            </Link>
            <Link href="/cases">
              <span className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-700 dark:hover:text-indigo-300 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium">
                Cases
              </span>
            </Link>
            <Link href="/finder">
              <span className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-700 dark:hover:text-indigo-300 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium">
                Case Finder
              </span>
            </Link>
            <Link href="/guides">
              <span className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-700 dark:hover:text-indigo-300 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium">
                Guides
              </span>
            </Link>
            <Link href="/search">
              <span className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-700 dark:hover:text-indigo-300 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium">
                Search
              </span>
            </Link>
            <button
              onClick={toggleTheme}
              className="w-full text-left text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-700 dark:hover:text-indigo-300 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium"
            >
              {mounted && theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
