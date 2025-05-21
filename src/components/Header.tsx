import React from 'react';
import { FileText, Download } from 'lucide-react';

interface HeaderProps {
  onDownload?: () => void;
  canDownload?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onDownload, canDownload = false }) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText size={28} className="text-white" />
          <span className="text-xl font-bold">PDF Editor</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-white hover:text-blue-200 transition-colors">
            Features
          </a>
          <a href="#" className="text-white hover:text-blue-200 transition-colors">
            Tutorials
          </a>
          <a href="#" className="text-white hover:text-blue-200 transition-colors">
            Contact
          </a>
        </nav>
        
        <div className="flex items-center gap-2">
          {canDownload && onDownload && (
            <button
              onClick={onDownload}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              <span>Download PDF</span>
            </button>
          )}
          <button className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;