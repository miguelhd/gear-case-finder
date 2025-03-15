import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white p-6 mt-auto">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-semibold">Gear Case Finder</h2>
            <p className="text-gray-400 mt-1">Find the perfect case for your audio gear</p>
          </div>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
            <div>
              <h3 className="text-lg font-medium mb-2">Resources</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Case Guide</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Legal</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-6 pt-6 text-center md:text-left">
          <p className="text-gray-400">&copy; {new Date().getFullYear()} Gear Case Finder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
