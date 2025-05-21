import React, { useState } from 'react';
import { PDFDocument, CompressionSettings } from '../../types';
import { compressPDF, savePDF } from '../../utils/pdfUtils';

interface CompressToolProps {
  document: PDFDocument;
}

const CompressTool: React.FC<CompressToolProps> = ({ document }) => {
  const [targetSize, setTargetSize] = useState(100); // Default target size in KB
  const [quality, setQuality] = useState(90); // Default quality 0-100
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  
  const originalSizeKB = Math.round(document.size / 1024);

  const handleCompress = async () => {
    if (!document) return;
    
    try {
      setIsCompressing(true);
      setCompressedSize(null);
      
      // Convert quality to 0-1 range
      const settings: CompressionSettings = {
        targetSize,
        quality: quality / 100
      };
      
      const compressedDoc = await compressPDF(document, settings);
      
      // In a real implementation, we would actually compress the PDF
      // This is a placeholder that simulates compression
      const simulatedCompressedSize = Math.max(
        document.size * (settings.quality * 0.8),
        document.size * 0.1
      );
      
      setCompressedSize(Math.round(simulatedCompressedSize / 1024));
      
      // Save the compressed PDF
      await savePDF(compressedDoc);
    } catch (error) {
      console.error('Error compressing PDF:', error);
    } finally {
      setIsCompressing(false);
    }
  };

  const compressionRatio = compressedSize 
    ? Math.round((1 - (compressedSize / originalSizeKB)) * 100) 
    : null;

  return (
    <div className="compress-tool">
      <h3 className="text-lg font-medium mb-3">Compress PDF</h3>
      
      <div className="mb-4 p-4 bg-blue-50 rounded-md">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Original Size:</span>
          <span className="text-sm">{originalSizeKB} KB</span>
        </div>
        {compressedSize && (
          <>
            <div className="flex justify-between mt-1">
              <span className="text-sm font-medium">Compressed Size:</span>
              <span className="text-sm">{compressedSize} KB</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-sm font-medium">Reduction:</span>
              <span className="text-sm text-green-600">{compressionRatio}%</span>
            </div>
          </>
        )}
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Target Size (KB)
        </label>
        <input
          type="range"
          min={Math.max(10, Math.round(originalSizeKB * 0.1))}
          max={originalSizeKB}
          value={targetSize}
          onChange={(e) => setTargetSize(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{Math.max(10, Math.round(originalSizeKB * 0.1))} KB</span>
          <span>{targetSize} KB</span>
          <span>{originalSizeKB} KB</span>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quality
        </label>
        <div className="flex items-center">
          <input
            type="range"
            min={10}
            max={100}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="ml-2 w-8 text-sm text-gray-700">{quality}%</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>
      
      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
        <p>
          Higher quality results in larger file sizes. Lower quality may affect readability and image clarity.
        </p>
      </div>
      
      <button
        onClick={handleCompress}
        disabled={isCompressing}
        className="w-full py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isCompressing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2"></div>
            <span>Compressing...</span>
          </div>
        ) : (
          'Compress PDF'
        )}
      </button>
    </div>
  );
};

export default CompressTool;