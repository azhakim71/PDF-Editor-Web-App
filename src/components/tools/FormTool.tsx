import React, { useState, useEffect } from 'react';
import { PDFDocument } from '../../types';
import { hasForms } from '../../utils/pdfUtils';
import { Plus, Trash2, Save } from 'lucide-react';

interface FormToolProps {
  document: PDFDocument;
}

interface FormField {
  id: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown';
  name: string;
  value: string;
  options?: string[]; // For dropdown and radio
  required?: boolean;
  placeholder?: string;
}

const FormTool: React.FC<FormToolProps> = ({ document }) => {
  const [hasFormFields, setHasFormFields] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  
  // New form field state
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

  const handleFieldChange = (id: string, value: string) => {
    setFormFields(prev => 
      prev.map(field => 
        field.id === id ? { ...field, value } : field
      )
    );
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

  const handleSaveForm = () => {
    // In a real implementation, we would save the form structure to the PDF
    console.log('Form structure:', formFields);
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
        </div>
      )}
      
      {formFields.length > 0 ? (
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
              
              {field.type === 'text' && (
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required={field.required}
                />
              )}
              
              {field.type === 'checkbox' && (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={field.value === 'true'}
                    onChange={(e) => handleFieldChange(field.id, e.target.checked.toString())}
                    className="mr-2"
                    required={field.required}
                  />
                  <span className="text-sm text-gray-700">{field.name}</span>
                </label>
              )}
              
              {field.type === 'radio' && field.options && (
                <div className="space-y-2">
                  {field.options.map((option, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="radio"
                        name={field.id}
                        value={option}
                        checked={field.value === option}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="mr-2"
                        required={field.required}
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {field.type === 'dropdown' && field.options && (
                <select
                  value={field.value}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required={field.required}
                >
                  <option value="">Select an option</option>
                  {field.options.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
          
          <button
            onClick={handleSaveForm}
            className="flex items-center gap-2 w-full justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            <Save size={16} />
            Save Form Structure
          </button>
        </div>
      ) : (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            {showCreator 
              ? "Start by adding form fields above" 
              : "No form fields yet. Click 'Show Creator' to add fields"
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default FormTool;