import React, { useState } from 'react';
import { fabric } from 'fabric';

interface HighlightToolProps {
  canvas: fabric.Canvas;
}

const HighlightTool: React.FC<HighlightToolProps> = ({ canvas }) => {
  const [highlightColor, setHighlightColor] = useState('#FFFF00');
  const [isActive, setIsActive] = useState(false);
  
  const colorOptions = [
    { value: '#FFFF00', label: 'Yellow' },
    { value: '#00FF00', label: 'Green' },
    { value: '#FF9999', label: 'Pink' },
    { value: '#99CCFF', label: 'Blue' },
    { value: '#FF9933', label: 'Orange' }
  ];

  React.useEffect(() => {
    if (!canvas) return;
    
    const startHighlighting = () => {
      if (!isActive) return;
      
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = highlightColor;
      canvas.freeDrawingBrush.width = 20;
      canvas.freeDrawingBrush.opacity = 0.5;
    };
    
    const stopHighlighting = () => {
      canvas.isDrawingMode = false;
    };
    
    if (isActive) {
      startHighlighting();
    } else {
      stopHighlighting();
    }
    
    return () => {
      stopHighlighting();
    };
  }, [canvas, isActive, highlightColor]);

  return (
    <div className="highlight-tool">
      <h3 className="text-lg font-medium mb-3">Highlight Tool</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Highlight Color
        </label>
        <div className="grid grid-cols-5 gap-2">
          {colorOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setHighlightColor(option.value)}
              className={`
                h-10 rounded-md border
                ${highlightColor === option.value ? 'ring-2 ring-offset-2 ring-blue-500' : 'hover:opacity-80'}
              `}
              style={{ backgroundColor: option.value }}
              title={option.label}
            />
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="custom-color" className="block text-sm font-medium text-gray-700 mb-1">
          Custom Color
        </label>
        <div className="flex items-center">
          <input
            type="color"
            id="custom-color"
            value={highlightColor}
            onChange={(e) => setHighlightColor(e.target.value)}
            className="h-10 w-10 border border-gray-300 rounded-md mr-2"
          />
          <input 
            type="text"
            value={highlightColor}
            onChange={(e) => setHighlightColor(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <label htmlFor="highlight-active" className="text-sm font-medium text-gray-700">
            Enable Highlight Mode
          </label>
          <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
            <input
              type="checkbox"
              id="highlight-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="absolute w-0 h-0 opacity-0"
            />
            <label
              htmlFor="highlight-active"
              className={`
                absolute top-0 left-0 right-0 bottom-0 block rounded-full cursor-pointer
                transition-all duration-200 ease-in-out
                ${isActive ? 'bg-blue-600' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  absolute left-1 top-1 bg-white h-4 w-4 rounded-full shadow
                  transition-transform duration-200 ease-in-out
                  ${isActive ? 'transform translate-x-6' : ''}
                `}
              />
            </label>
          </div>
        </div>
      </div>
      
      <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
        <h4 className="text-sm font-medium mb-2">Instructions:</h4>
        <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
          <li>Select a highlight color</li>
          <li>Toggle the highlight mode on</li>
          <li>Draw over text in the PDF to highlight it</li>
          <li>Toggle highlight mode off when done</li>
        </ol>
      </div>
      
      {isActive && (
        <div className="p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
          Highlight mode is active. Draw over text to highlight it.
        </div>
      )}
    </div>
  );
};

export default HighlightTool;