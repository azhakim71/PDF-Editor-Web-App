import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File } from 'lucide-react';
import { PDFDocument } from '../types';
import { readPdfDocument } from '../utils/pdfUtils';

interface PDFUploaderProps {
  onFileUpload: (document: PDFDocument) => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onFileUpload }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const pdfDocument = await readPdfDocument(file);
      onFileUpload(pdfDocument);
    } catch (err) {
      setError('Failed to load the PDF file. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  return (
    <div 
      className="w-full"
      data-testid="pdf-uploader"
    >
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 
          flex flex-col items-center justify-center
          transition-colors cursor-pointer
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center text-center">
          {isDragActive ? (
            <Upload size={48} className="text-blue-500 mb-4" />
          ) : (
            <File size={48} className="text-blue-500 mb-4" />
          )}
          
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {isDragActive 
              ? 'Drop your PDF here' 
              : 'Drag & drop your PDF file'
            }
          </h3>
          
          <p className="text-gray-500 mb-4">
            or click to browse your files
          </p>
          
          <button 
            type="button" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
          >
            Browse Files
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {isLoading && (
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      <div className="mt-6">
        <h4 className="font-medium text-gray-700 mb-2">Features:</h4>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            'Add signatures',
            'Compress PDFs',
            'Fill forms',
            'Add text',
            'Highlight text',
            'Customize everything'
          ].map((feature, index) => (
            <li key={index} className="flex items-center text-gray-600">
              <span className="mr-2 text-blue-500">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PDFUploader;