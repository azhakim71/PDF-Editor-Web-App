import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import { PDFDocument } from '../../types';
import { hasForms } from '../../utils/pdfUtils';
import { Plus, Trash2, Save } from 'lucide-react';

interface FormToolProps {
  document: PDFDocument;
  canvas: fabric.Canvas;
}

interface FormField {
  id: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown';
  name: string;
  value: string;
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

const FormTool: React.FC<FormToolProps> = ({ document, canvas }) => {
  const [hasFormFields, setHasFormFields] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  
  const [newField, setNewField] = useState<FormField>({
    id: '',
    type: 'text',
    name: '',
    value: '',
    required: false,
    placeholder: '',
  });

  useEffect(() => {
    const checkForms = async () => {
      if (!document.pdfJsDoc) return;
      
      try {
        setIsLoading(true);
        const hasFields = await hasForms(document.pdfJsDoc);
        setHasFormFields(hasFields);
      } catch (error) {
        console.error('Error checking forms:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkForms();
  }, [document]);

  const addFormFieldToCanvas = (field: FormField) => {
    let formElement;
    
    switch (field.type) {
      case 'text':
        formElement = new fabric.Textbox('Text Field', {
          width: 200,
          height: 40,
          fill: '#000000',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          hasControls: true,
          borderColor: '#2196F3',
          cornerColor: '#2196F3',
          padding: 10,
          data: { ...field }
        });
        break;
        
      case 'checkbox':
        formElement = new fabric.Rect({
          width: 20,
          height: 20,
          fill: 'rgba(255, 255, 255, 0.8)',
          stroke: '#000000',
          strokeWidth: 1,
          hasControls: true,
          borderColor: '#2196F3',
          cornerColor: '#2196F3',
          data: { ...field }
        });
        break;
        
      case 'radio':
        formElement = new fabric.Circle({
          radius: 10,
          fill: 'rgba(255, 255, 255, 0.8)',
          stroke: '#000000',
          strokeWidth: 1,
          hasControls: true,
          borderColor: '#2196F3',
          cornerColor: '#2196F3',
          data: { ...field }
        });
        break;
        
      case 'dropdown':
        formElement = new fabric.Rect({
          width: 200,
          height: 40,
          fill: 'rgba(255, 255, 255, 0.8)',
          stroke: '#000000',
          strokeWidth: 1,
          hasControls: true,
          borderColor: '#2196F3',
          cornerColor: '#2196F3',
          data: { ...field }
        });
        break;
    }
    
    if (formElement) {
      formElement.set({
        left: 100,
        top: 100,
        cornerSize: 10,
        transparentCorners: false
      });
      
      canvas.add(formElement);
      canvas.setActiveObject(formElement);
      canvas.renderAll();
    }
  };

  const handleAddField = () => {
    if (!newField.name.trim()) return;
    
    const field: FormField = {
      ...newField,
      id: `field-${Date.now()}`,
      value: '',
      options: newField.type === 'dropdown' || newField.type === 'radio' 
        ? ['Option 1'] 
        : undefined
    };
    
    setFormFields(prev => [...prev, field]);
    addFormFieldToCanvas(field);
    
    setNewField({
      id: '',
      type: 'text',
      name: '',
      value: '',
      required: false,
      placeholder: '',
    });
  };

  const handleRemoveField = (id: string) => {
    setFormFields(prev => prev.filter(field => field.id !== id));
    const objects = canvas.getObjects();
    const fieldObject = objects.find(obj => obj.data?.id === id);
    if (fieldObject) {
      canvas.remove(fieldObject);
      canvas.renderAll();
    }
  };

  const handleAddOption = (fieldId: string) => {
    setFormFields(prev => prev.map(field => {
      if (field.id === fieldId && field.options) {
        return {
          ...field,
          options: [...field.options, `Option ${field.options.length + 1}`]
        };
      }
      return field;
    }));
  };

  const handleOptionChange = (fieldId: string, optionIndex: number, value: string) => {
    setFormFields(prev => prev.map(field => {
      if (field.id === fieldId && field.options) {
        const newOptions = [...field.options];
        newOptions[optionIndex] = value;
        return { ...field, options: newOptions };
      }
      return field;
    }));
  };

  const handleRemoveOption = (fieldId: string, optionIndex: number) => {
    setFormFields(prev => prev.map(field => {
      if (field.id === fieldId && field.options) {
        return {
          ...field,
          options: field.options.filter((_, index) => index !== optionIndex)
        };
      }
      return field;
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Checking for form fields...</span>
      </div>
    );
  }

  return (
    <div className="form-tool">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Form Fields</h3>
        <button
          onClick={() => setShowCreator(!showCreator)}
          className="text-blue-600 hover:text-blue-800"
        >
          {showCreator ? 'Hide Creator' : 'Show Creator'}
        </button>
      </div>
      
      {showCreator && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium mb-3">Add New Field</h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Name
              </label>
              <input
                type="text"
                value={newField.name}
                onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter field name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Type
              </label>
              <select
                value={newField.type}
                onChange={(e) => setNewField(prev => ({ 
                  ...prev, 
                  type: e.target.value as FormField['type']
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="text">Text</option>
                <option value="checkbox">Checkbox</option>
                <option value="radio">Radio</option>
                <option value="dropdown">Dropdown</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <input
                type="text"
                value={newField.placeholder}
                onChange={(e) => setNewField(prev => ({ ...prev, placeholder: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter placeholder text"
              />
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newField.required}
                  onChange={(e) => setNewField(prev => ({ ...prev, required: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Required field</span>
              </label>
            </div>
          </div>
          
          <button
            onClick={handleAddField}
            disabled={!newField.name.trim()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
          >
            <Plus size={16} />
            Add Field
          </button>
          
          <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
            Drag and drop the form fields onto the PDF after adding them
          </div>
        </div>
      )}
      
      {formFields.length > 0 && (
        <div className="space-y-4">
          {formFields.map((field) => (
            <div key={field.id} className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium">{field.name}</h4>
                  <p className="text-sm text-gray-500">Type: {field.type}</p>
                </div>
                <button
                  onClick={() => handleRemoveField(field.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              {(field.type === 'dropdown' || field.type === 'radio') && field.options && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options
                  </label>
                  {field.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(field.id, index, e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md"
                      />
                      <button
                        onClick={() => handleRemoveOption(field.id, index)}
                        className="text-red-600 hover:text-red-800"
                        disabled={field.options?.length === 1}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddOption(field.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Option
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {!formFields.length && !showCreator && (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            No form fields yet. Click 'Show Creator' to add fields
          </p>
        </div>
      )}
    </div>
  );
};

export default FormTool;