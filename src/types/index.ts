import { PDFDocumentProxy } from 'pdfjs-dist';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';

export interface PDFDocument {
  file: File;
  name: string;
  size: number;
  pdfJsDoc?: PDFDocumentProxy;
  pdfLibDoc?: PDFLibDocument;
  dataUrl?: string;
}

export interface TextProperties {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
}

export interface SignatureProperties {
  dataUrl: string;
  width: number;
  height: number;
}

export type EditorTool = 
  | 'signature' 
  | 'text' 
  | 'highlight' 
  | 'form' 
  | 'compress'
  | null;

export interface CompressionSettings {
  targetSize: number; // in KB
  quality: number; // 0-1
}

export interface ToolbarItem {
  name: string;
  tool: EditorTool;
  icon: React.ReactNode;
}