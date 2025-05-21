import React from 'react';
import { EditorTool, ToolbarItem } from '../types';

interface ToolbarProps {
  items: ToolbarItem[];
  activeTool: EditorTool;
  onToolChange: (tool: EditorTool) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ items, activeTool, onToolChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-3 md:w-60">
      <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">Tools</h3>
      <div className="space-y-1">
        {items.map((item) => (
          <button
            key={item.name}
            onClick={() => onToolChange(item.tool)}
            className={`
              w-full px-3 py-2 rounded-md text-left flex items-center gap-2
              transition-colors
              ${activeTool === item.tool 
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <span className={activeTool === item.tool ? 'text-blue-600' : 'text-gray-500'}>
              {item.icon}
            </span>
            <span>{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Toolbar;