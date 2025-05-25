import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Header from './components/Header';
import PDFUploader from './components/PDFUploader';
import PDFEditor from './components/PDFEditor';
import { PDFDocument } from './types';

function App() {
  const [pdfDocument, setPdfDocument] = useState<PDFDocument | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleFileUpload = (doc: PDFDocument) => {
    setPdfDocument(doc);
    setIsEditing(true);
  };

  const handleBackToUpload = () => {
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      
      <main className="flex-grow p-4 md:p-6 container mx-auto max-w-7xl">
        {isEditing && pdfDocument ? (
          <>
            <button 
              onClick={handleBackToUpload}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Upload</span>
            </button>
            <PDFEditor document={pdfDocument} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-full max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-2">
                PDF Editor
              </h1>
              <p className="text-center text-gray-600 mb-8">
                Upload a PDF to get started with our advanced editing tools
              </p>
              <PDFUploader onFileUpload={handleFileUpload} />
            </div>
          </div>
        )}
      </main>
      
      <footer className="py-4 border-t border-gray-200">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <p className="text-sm text-gray-500 mb-2">
            © {new Date().getFullYear()} PDF Editor - Designed by Azizul
          </p>
          <div className="flex space-x-4">
            <a
              href="https://facebook.com/browserabbi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Facebook
            </a>
            <a
              href="https://linkedin.com/in/azhakim"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://twitter.com/azhakim03"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;