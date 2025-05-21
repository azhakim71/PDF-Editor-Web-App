import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { getDocument, PDFDocumentProxy } from 'pdfjs-dist';
import { PDFDocument, CompressionSettings } from '../types';

// Read and prepare PDF document
export const readPdfDocument = async (file: File): Promise<PDFDocument> => {
  const arrayBuffer = await file.arrayBuffer();
  
  // Create a data URL for preview first
  const dataUrl = await arrayBufferToDataUrl(arrayBuffer);
  
  // Create independent copies of the Uint8Array for each operation
  const uint8ArrayForPdfJs = new Uint8Array(arrayBuffer.slice(0));
  const uint8ArrayForPdfLib = new Uint8Array(arrayBuffer.slice(0));
  
  // Load with PDF.js for rendering using the first copy
  const pdfJsDoc = await getDocument(uint8ArrayForPdfJs).promise;
  
  // Load with PDF-lib for editing using the second copy
  const pdfLibDoc = await PDFLibDocument.load(uint8ArrayForPdfLib);
  
  return {
    file,
    name: file.name,
    size: file.size,
    pdfJsDoc,
    pdfLibDoc,
    dataUrl
  };
};

// Convert ArrayBuffer to data URL
export const arrayBufferToDataUrl = (arrayBuffer: ArrayBuffer): Promise<string> => {
  return new Promise((resolve) => {
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

// Compress PDF with specified settings
export const compressPDF = async (
  pdfDocument: PDFDocument, 
  settings: CompressionSettings
): Promise<PDFDocument> => {
  // In a real implementation, we would use PDF-lib or another library
  // to compress the PDF based on settings.quality
  // This is a placeholder for the real implementation
  
  // Clone document to not modify the original
  const clonedDoc = { ...pdfDocument };
  
  return clonedDoc;
};

// Save the edited PDF
export const savePDF = async (pdfDocument: PDFDocument): Promise<Blob> => {
  if (!pdfDocument.pdfLibDoc) {
    throw new Error('PDF document not loaded correctly');
  }
  
  const pdfBytes = await pdfDocument.pdfLibDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

// Get a page as canvas element (for editing)
export const renderPageToCanvas = async (
  pdfJsDoc: PDFDocumentProxy, 
  pageNumber: number, 
  scale: number = 1.5
): Promise<HTMLCanvasElement> => {
  const page = await pdfJsDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  await page.render({
    canvasContext: context,
    viewport,
  }).promise;
  
  return canvas;
};

// Check if PDF has form fields
export const hasForms = async (pdfJsDoc: PDFDocumentProxy): Promise<boolean> => {
  // In a real implementation, we would check for AcroForm fields
  // This is a placeholder for the real implementation
  return false;
};