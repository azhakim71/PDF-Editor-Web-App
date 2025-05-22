import React from 'react';
import { FileText } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center">
        <div className="flex items-center space-x-2">
          <FileText size={28} className="text-white" />
          <span className="text-xl font-bold">PDF Editor</span>
        </div>
      </div>
    </header>
  );
};

export default Header;