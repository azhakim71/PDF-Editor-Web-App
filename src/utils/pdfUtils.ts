import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { getDocument, PDFDocumentProxy } from 'pdfjs-dist';
import { PDFDocument, CompressionSettings } from '../types';
import { fabric } from 'fabric';

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

// Save the edited PDF with all canvas modifications
export const savePDF = async (
  pdfDocument: PDFDocument, 
  fabricCanvas: fabric.Canvas | null,
  currentPage: number
): Promise<Blob> => {
  if (!pdfDocument.pdfLibDoc || !fabricCanvas) {
    throw new Error('PDF document or canvas not available');
  }

  try {
    // Get the canvas as a high-resolution PNG
    const scaleFactor = 4; // Increase resolution for better quality
    const canvasDataUrl = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: scaleFactor
    });

    // Convert data URL to Uint8Array
    const base64Data = canvasDataUrl.split(',')[1];
    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Embed the image into the PDF
    const pdfDoc = pdfDocument.pdfLibDoc;
    const page = pdfDoc.getPages()[currentPage - 1];
    const image = await pdfDoc.embedPng(imageBytes);

    // Get page dimensions
    const { width, height } = page.getSize();

    // Draw the image on the page, preserving aspect ratio and maintaining quality
    page.drawImage(image, {
      x: 0,
      y: 0,
      width,
      height,
      opacity: 1,
    });

    // Save the modified PDF with maximum quality
    const pdfBytes = await pdfDoc.save({
      useObjectStreams: false,
      addDefaultPage: false,
      objectsPerTick: 50,
    });

    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error saving PDF:', error);
    throw error;
  }
};

// Get a page as canvas element (for editing)
export const renderPageToCanvas = async (
  pdfJsDoc: PDFDocumentProxy, 
  pageNumber: number, 
  scale: number = 0.5
): Promise<HTMLCanvasElement> => {
  const page = await pdfJsDoc.getPage(pageNumber);
  
  // Calculate viewport with high DPI for better quality
  const dpiScale = 2; // Increase DPI for better quality
  const viewport = page.getViewport({ scale: scale * dpiScale });
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: false })!;
  
  // Set canvas size to match viewport
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  // Enable high-quality image rendering
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  
  // Render the page with high quality settings
  await page.render({
    canvasContext: context,
    viewport,
    intent: 'display', // Use display intent for screen viewing
    renderInteractiveForms: true,
    enableWebGL: true,
  }).promise;
  
  // Scale down the canvas size for display while maintaining the high-resolution render
  canvas.style.width = `${viewport.width / dpiScale}px`;
  canvas.style.height = `${viewport.height / dpiScale}px`;
  
  return canvas;
};

// Check if PDF has form fields
export const hasForms = async (pdfJsDoc: PDFDocumentProxy): Promise<boolean> => {
  // In a real implementation, we would check for AcroForm fields
  // This is a placeholder for the real implementation
  return false;
};