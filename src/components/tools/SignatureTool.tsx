import React, { useState, useRef } from 'react';
import { fabric } from 'fabric';

interface SignatureToolProps {
  canvas: fabric.Canvas;
}

const SignatureTool: React.FC<SignatureToolProps> = ({ canvas }) => {
  const [signature, setSignature] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const signatureContextRef = useRef<CanvasRenderingContext2D | null>(null);

  const initCanvas = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Set canvas properties
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.lineCap = 'round';
    
    signatureContextRef.current = context;
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const context = signatureContextRef.current;
    if (!context) return;
    
    setIsDrawing(true);
    
    // Get mouse/touch position
    const pos = getEventPosition(event);
    if (!pos) return;
    
    context.beginPath();
    context.moveTo(pos.x, pos.y);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const context = signatureContextRef.current;
    if (!context) return;
    
    // Get mouse/touch position
    const pos = getEventPosition(event);
    if (!pos) return;
    
    context.lineTo(pos.x, pos.y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    const context = signatureContextRef.current;
    if (!context) return;
    
    context.closePath();
    setIsDrawing(false);
    
    // Save signature
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      setSignature(canvas.toDataURL());
    }
  };

  const getEventPosition = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return null;
    
    let clientX, clientY;
    
    if ('touches' in event) {
      // Touch event
      if (event.touches.length === 0) return null;
      const touch = event.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      // Mouse event
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const clearSignature = () => {
    const context = signatureContextRef.current;
    const canvas = signatureCanvasRef.current;
    if (!context || !canvas) return;
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };

  const addSignatureToPdf = () => {
    if (!signature || !canvas) return;
    
    fabric.Image.fromURL(signature, (img) => {
      if (!img || !canvas) return;
      
      img.scaleToWidth(200);
      img.set({
        left: 100,
        top: 100,
        cornerSize: 10,
        transparentCorners: false,
        borderColor: '#2196F3',
        cornerColor: '#2196F3'
      });
      
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    });
  };
  
  const uploadSignature = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setSignature(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  React.useEffect(() => {
    initCanvas();
  }, []);

  return (
    <div className="signature-tool">
      <h3 className="text-lg font-medium mb-3">Signature Tool</h3>
      
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <h4 className="text-sm font-medium mr-2">Draw Signature</h4>
          <button 
            onClick={clearSignature}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear
          </button>
        </div>
        
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg bg-white"
          style={{ height: '150px' }}
        >
          <canvas
            ref={signatureCanvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full cursor-crosshair"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Upload Signature</h4>
        <input
          type="file"
          accept="image/*"
          onChange={uploadSignature}
          className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-md file:border-0
                     file:text-sm file:font-medium
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
        />
      </div>
      
      {signature && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Preview</h4>
          <div className="border rounded-lg p-3 bg-gray-50">
            <img 
              src={signature} 
              alt="Signature" 
              className="max-h-24 max-w-full"
            />
          </div>
        </div>
      )}
      
      <button
        onClick={addSignatureToPdf}
        disabled={!signature}
        className="w-full py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Add to PDF
      </button>
    </div>
  );
};

export default SignatureTool;