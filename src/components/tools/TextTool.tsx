import React, { useState } from 'react';
import { fabric } from 'fabric';

interface TextToolProps {
  canvas: fabric.Canvas;
}

const TextTool: React.FC<TextToolProps> = ({ canvas }) => {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState('#000000');
  
  const fontOptions = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Verdana', label: 'Verdana' }
  ];
  
  const [fontFamily, setFontFamily] = useState(fontOptions[0].value);

  const addTextToPdf = () => {
    if (!text.trim()) return;
    
    const fabricText = new fabric.IText(text, {
      left: 100,
      top: 100,
      fontFamily,
      fontSize,
      fill: textColor,
      cornerSize: 10,
      transparentCorners: false,
      borderColor: '#2196F3',
      cornerColor: '#2196F3'
    });
    
    canvas.add(fabricText);
    canvas.setActiveObject(fabricText);
    canvas.renderAll();
    
    // Reset text input
    setText('');
  };

  return (
    <div className="text-tool">
      <h3 className="text-lg font-medium mb-3">Text Tool</h3>
      
      <div className="mb-4">
        <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-1">
          Enter Text
        </label>
        <textarea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Type your text here..."
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="font-family" className="block text-sm font-medium text-gray-700 mb-1">
            Font
          </label>
          <select
            id="font-family"
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {fontOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="font-size" className="block text-sm font-medium text-gray-700 mb-1">
            Font Size
          </label>
          <input
            type="number"
            id="font-size"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            min={8}
            max={72}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="text-color" className="block text-sm font-medium text-gray-700 mb-1">
          Text Color
        </label>
        <div className="flex items-center">
          <input
            type="color"
            id="text-color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="h-10 w-10 border border-gray-300 rounded-md mr-2"
          />
          <input 
            type="text"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Preview</h4>
        <div 
          className="border rounded-lg p-3 bg-gray-50 flex items-center justify-center"
          style={{ minHeight: '80px' }}
        >
          {text ? (
            <p style={{ 
              fontFamily, 
              fontSize: `${fontSize}px`, 
              color: textColor 
            }}>
              {text}
            </p>
          ) : (
            <p className="text-gray-400 italic">Text preview will appear here</p>
          )}
        </div>
      </div>
      
      <button
        onClick={addTextToPdf}
        disabled={!text.trim()}
        className="w-full py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Add to PDF
      </button>
    </div>
  );
};

export default TextTool;