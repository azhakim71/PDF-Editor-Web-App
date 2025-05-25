import React, { useState, useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { 
  Pen, 
  Type, 
  Highlighter, 
  FileSpreadsheet, 
  Download, 
  Minimize,
  Save
} from 'lucide-react';
import { PDFDocument, EditorTool, ToolbarItem } from '../types';
import { renderPageToCanvas, savePDF } from '../utils/pdfUtils';
import Toolbar from './Toolbar';
import SignatureTool from './tools/SignatureTool';
import TextTool from './tools/TextTool';
import HighlightTool from './tools/HighlightTool';
import FormTool from './tools/FormTool';
import CompressTool from './tools/CompressTool';

interface PDFEditorProps {
  document: PDFDocument;
}

const PDFEditor: React.FC<PDFEditorProps> = ({ document }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTool, setActiveTool] = useState<EditorTool>(null);
  const [scale, setScale] = useState(0.5); // Set initial scale to 50%
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  const toolbarItems: ToolbarItem[] = [
    { name: 'Signature', tool: 'signature', icon: <Pen size={20} /> },
    { name: 'Text', tool: 'text', icon: <Type size={20} /> },
    { name: 'Highlight', tool: 'highlight', icon: <Highlighter size={20} /> },
    { name: 'Fill Form', tool: 'form', icon: <FileSpreadsheet size={20} /> },
    { name: 'Compress', tool: 'compress', icon: <Minimize size={20} /> },
  ];

  useEffect(() => {
    const initializeEditor = async () => {
      if (!document.pdfJsDoc || !canvasRef.current) return;
      
      setTotalPages(document.pdfJsDoc.numPages);
      
      // Initialize fabric.js canvas
      if (!fabricCanvasRef.current) {
        fabricCanvasRef.current = new fabric.Canvas(canvasRef.current);
        
        // Listen for canvas modifications
        fabricCanvasRef.current.on('object:modified', () => setHasUnsavedChanges(true));
        fabricCanvasRef.current.on('object:added', () => setHasUnsavedChanges(true));
        fabricCanvasRef.current.on('object:removed', () => setHasUnsavedChanges(true));
      }
      
      await renderCurrentPage();
    };

    initializeEditor();
    
    return () => {
      // Cleanup
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [document]);

  useEffect(() => {
    renderCurrentPage();
  }, [currentPage, scale]);

  const renderCurrentPage = async () => {
    if (!document.pdfJsDoc || !fabricCanvasRef.current || !canvasRef.current) return;
    
    try {
      const canvas = await renderPageToCanvas(
        document.pdfJsDoc, 
        currentPage,
        scale
      );
      
      const fabricCanvas = fabricCanvasRef.current;
      
      // Clear existing canvas
      fabricCanvas.clear();
      
      // Set canvas dimensions
      fabricCanvas.setWidth(canvas.width);
      fabricCanvas.setHeight(canvas.height);
      
      // Create background image from the rendered PDF page
      fabric.Image.fromURL(canvas.toDataURL(), (img) => {
        if (fabricCanvas && img) {
          fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas));
        }
      });
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  };

  const handleDownload = async () => {
    if (typeof window === 'undefined' || !window.document) {
      console.error('Cannot download PDF in this environment');
      return;
    }

    try {
      setIsSaving(true);
      const pdfBlob = await savePDF(document, fabricCanvasRef.current, currentPage);
      
      const url = window.URL.createObjectURL(pdfBlob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `edited_${document.name}`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await savePDF(document, fabricCanvasRef.current, currentPage);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving PDF:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleToolChange = (tool: EditorTool) => {
    setActiveTool(tool === activeTool ? null : tool);
  };

  const renderToolOptions = () => {
    if (!fabricCanvasRef.current) return null;
    
    switch (activeTool) {
      case 'signature':
        return <SignatureTool canvas={fabricCanvasRef.current} />;
      case 'text':
        return <TextTool canvas={fabricCanvasRef.current} />;
      case 'highlight':
        return <HighlightTool canvas={fabricCanvasRef.current} />;
      case 'form':
        return <FormTool canvas={fabricCanvasRef.current} document={document} />;
      case 'compress':
        return <CompressTool document={document} />;
      default:
        return null;
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex flex-wrap justify-between items-center">
          <div className="mb-2 md:mb-0">
            <h2 className="text-xl font-semibold text-gray-800">
              {document.name}
            </h2>
            <p className="text-sm text-gray-500">
              {(document.size / 1024).toFixed(2)} KB • {totalPages} page{totalPages !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-gray-400"
            >
              <Save size={20} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            
            <button
              onClick={handleDownload}
              disabled={isSaving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-blue-400"
            >
              <Download size={20} />
              {isSaving ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 h-full">
        <Toolbar 
          items={toolbarItems} 
          activeTool={activeTool} 
          onToolChange={handleToolChange} 
        />
        
        <div className="flex-1 flex flex-col">
          {activeTool && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              {renderToolOptions()}
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md flex-1 flex flex-col p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  disabled={scale <= 0.5}
                  className="px-2 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                >
                  -
                </button>
                <span className="text-sm">{Math.round(scale * 100)}%</span>
                <button
                  onClick={handleZoomIn}
                  disabled={scale >= 3}
                  className="px-2 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto flex justify-center bg-gray-100 rounded-md">
              <div className="relative my-4 shadow-lg">
                <canvas ref={canvasRef} className="border border-gray-300"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFEditor;