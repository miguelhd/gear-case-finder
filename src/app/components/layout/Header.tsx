import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
        <nav className="mt-4 md:mt-0">
          <ul className="flex space-x-6">
            <li><a href="/" className="hover:text-blue-200 transition-colors">Home</a></li>
            <li><a href="/about" className="hover:text-blue-200 transition-colors">About</a></li>
            <li><a href="/contact" className="hover:text-blue-200 transition-colors">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
