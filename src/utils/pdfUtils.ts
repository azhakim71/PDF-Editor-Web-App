import { PDFDocument as PDFLibDocument, PDFName, PDFDict, PDFStream, PDFNumber } from 'pdf-lib';
import { getDocument, PDFDocumentProxy } from 'pdfjs-dist';
import { PDFDocument, CompressionSettings } from '../types';
import { fabric } from 'fabric';

export const readPdfDocument = async (file: File): Promise<PDFDocument> => {
  const arrayBuffer = await file.arrayBuffer();
  const dataUrl = await arrayBufferToDataUrl(arrayBuffer);
  
  const uint8ArrayForPdfJs = new Uint8Array(arrayBuffer.slice(0));
  const uint8ArrayForPdfLib = new Uint8Array(arrayBuffer.slice(0));
  
  const pdfJsDoc = await getDocument(uint8ArrayForPdfJs).promise;
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

export const arrayBufferToDataUrl = (arrayBuffer: ArrayBuffer): Promise<string> => {
  return new Promise((resolve) => {
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

export const compressPDF = async (
  pdfDocument: PDFDocument, 
  settings: CompressionSettings
): Promise<PDFDocument> => {
  if (!pdfDocument.pdfLibDoc) {
    throw new Error('PDF document not available');
  }

  const pdfDoc = pdfDocument.pdfLibDoc;
  const pages = pdfDoc.getPages();
  
  try {
    // Apply compression settings to each page
    for (const page of pages) {
      const { width, height } = page.getSize();
      
      // Scale down images based on quality setting
      const resources = page.node.Resources();
      if (!resources) continue;

      const images = await resources.lookup(PDFName.of('XObject'), PDFDict);
      if (!images || !(images instanceof PDFDict)) continue;

      for (const [name, xObject] of Object.entries(images.dict)) {
        if (xObject instanceof PDFStream) {
          const imageData = await xObject.fetch(PDFStream);
          if (imageData && imageData.dict.get(PDFName.of('Subtype')) === PDFName.of('Image')) {
            // Apply compression based on quality setting
            imageData.dict.set(PDFName.of('Filter'), PDFName.of('DCTDecode'));
            imageData.dict.set(PDFName.of('ColorSpace'), PDFName.of('DeviceRGB'));
            imageData.dict.set(PDFName.of('BitsPerComponent'), PDFNumber.of(8));
          }
        }
      }
    }

    // Save with compression
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
      compress: true
    });

    // Create new document with compressed data
    const compressedDoc = await PDFLibDocument.load(compressedBytes);
    
    return {
      ...pdfDocument,
      pdfLibDoc: compressedDoc,
      size: compressedBytes.length
    };
  } catch (error) {
    console.error('Error in compression:', error);
    throw new Error('Failed to compress PDF: Invalid or unsupported PDF structure');
  }
};

export const savePDF = async (
  pdfDocument: PDFDocument, 
  fabricCanvas: fabric.Canvas | null,
  currentPage: number
): Promise<Blob> => {
  if (!pdfDocument.pdfLibDoc || !fabricCanvas) {
    throw new Error('PDF document or canvas not available');
  }

  try {
    // Increase resolution significantly for better quality
    const scaleFactor = 4; // Increased for better quality
    const canvasDataUrl = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: scaleFactor
    });

    const base64Data = canvasDataUrl.split(',')[1];
    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    const pdfDoc = pdfDocument.pdfLibDoc;
    const page = pdfDoc.getPages()[currentPage - 1];
    const image = await pdfDoc.embedPng(imageBytes);

    const { width, height } = page.getSize();

    // Draw high-resolution image
    page.drawImage(image, {
      x: 0,
      y: 0,
      width,
      height,
      opacity: 1
    });

    // Save with maximum quality settings
    const pdfBytes = await pdfDoc.save({
      useObjectStreams: false,
      addDefaultPage: false,
      objectsPerTick: 100,
      compress: false
    });

    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error saving PDF:', error);
    throw error;
  }
};

export const renderPageToCanvas = async (
  pdfJsDoc: PDFDocumentProxy, 
  pageNumber: number, 
  scale: number = 0.5 // Default scale is 50%
): Promise<HTMLCanvasElement> => {
  const page = await pdfJsDoc.getPage(pageNumber);
  
  // Increase DPI significantly for better quality
  const dpiScale = 2; // Base DPI multiplier
  const viewport = page.getViewport({ scale: scale * dpiScale });
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: false })!;
  
  // Set canvas dimensions to high resolution
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  // Enable high-quality rendering
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  
  // Render with high-quality settings
  await page.render({
    canvasContext: context,
    viewport,
    intent: 'print', // Use print intent for highest quality
    renderInteractiveForms: true,
    enableWebGL: true,
  }).promise;
  
  // Set display size while maintaining high resolution
  canvas.style.width = `${viewport.width / dpiScale}px`;
  canvas.style.height = `${viewport.height / dpiScale}px`;
  
  return canvas;
};

export const hasForms = async (pdfJsDoc: PDFDocumentProxy): Promise<boolean> => {
  const page = await pdfJsDoc.getPage(1);
  const annotations = await page.getAnnotations();
  return annotations.some(annotation => annotation.subtype === 'Widget');
};