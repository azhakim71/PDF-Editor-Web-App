import React, { useState, useEffect } from 'react';
import { PDFDocument } from '../../types';
import { hasForms } from '../../utils/pdfUtils';

interface FormToolProps {
  document: PDFDocument;
}

interface FormField {
  id: string;
  type: string;
  name: string;
  value: string;
}

const FormTool: React.FC<FormToolProps> = ({ document }) => {
  const [hasFormFields, setHasFormFields] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  
  useEffect(() => {
    const checkForms = async () => {
      if (!document.pdfJsDoc) return;
      
      try {
        setIsLoading(true);
        const hasFields = await hasForms(document.pdfJsDoc);
        setHasFormFields(hasFields);
        
        // In a real implementation, we would extract form fields here
        // This is a placeholder for demonstration
        if (hasFields) {
          setFormFields([
            { id: 'field1', type: 'text', name: 'Name', value: '' },
            { id: 'field2', type: 'text', name: 'Email', value: '' },
            { id: 'field3', type: 'text', name: 'Address', value: '' }
          ]);
        }
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

  const handleSaveForm = () => {
    // In a real implementation, we would save the form values to the PDF
    console.log('Form values:', formFields);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Checking for form fields...</span>
      </div>
    );
  }

  if (!hasFormFields) {
    return (
      <div className="p-6 text-center">
        <div className="mb-3 text-gray-500">
          <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-700">No form fields detected</h3>
        <p className="text-gray-500 mt-1">
          This PDF does not contain any fillable form fields.
        </p>
      </div>
    );
  }

  return (
    <div className="form-tool">
      <h3 className="text-lg font-medium mb-3">Fill Form</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-4">
          This PDF contains fillable form fields. You can fill them out below.
        </p>
        
        <div className="space-y-4">
          {formFields.map((field) => (
            <div key={field.id}>
              <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
                {field.name}
              </label>
              <input
                type="text"
                id={field.id}
                value={field.value}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Enter ${field.name.toLowerCase()}`}
              />
            </div>
          ))}
        </div>
      </div>
      
      <button
        onClick={handleSaveForm}
        className="w-full py-2 bg-blue-600 text-white rounded-lg"
      >
        Save Form Data
      </button>
    </div>
  );
};

export default FormTool;