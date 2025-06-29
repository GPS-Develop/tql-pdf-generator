import React, { useState, useCallback } from 'react';
import './App.css';

// Import new components
import FormSection from './components/FormSection';
import FormInput from './components/FormInput';
import MessageDisplay from './components/MessageDisplay';
import RouteSelection from './components/RouteSelection';
import { generateTQLPDF } from './utils/pdfGenerator';

function App() {
  const [formData, setFormData] = useState({
    // User Input Fields Only - Prepopulated for testing
    pickup: {
      name: 'ABC Warehouse',
      address: '6878 Kelly Ave',
      city: 'Morrow',
      state: 'GA',
      zip: '30260',
      date: '2025-06-20'
    },
    
    delivery: {
      name: 'XYZ Distribution Center',
      address: '995 Bruce Lane',
      city: 'Tifton',
      state: 'GA',
      zip: '31794',
      date: '2025-06-27'
    },
    
    commodity: {
      description: '',
      trailerType: 'Refrigerated',
      driverName: 'Gurmail Singh'
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const setCanadaDefaults = useCallback(() => {
      setFormData(prev => ({
        ...prev,
        pickup: {
        name: 'Ontario Food Terminal',
        address: '165 The Queensway',
        city: 'Etobicoke',
        state: 'ON',
        zip: 'M8Y 1H8',
        date: prev.pickup.date
      },
      delivery: {
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        date: prev.delivery.date
        }
      }));
  }, []);

  const setUSADefaults = useCallback(() => {
      setFormData(prev => ({
        ...prev,
      pickup: {
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        date: prev.pickup.date
      },
        delivery: {
        name: 'Ontario Food Terminal',
        address: '165 The Queensway',
        city: 'Etobicoke',
        state: 'ON',
        zip: 'M8Y 1H8',
        date: prev.delivery.date
        }
      }));
  }, []);

  const handleInputChange = useCallback((section, field, value) => {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
  }, []);

  const handleGeneratePDF = useCallback(async () => {
    // Clear previous messages
    setError('');
    setSuccess('');
    
    if (!formData.pickup.name || !formData.pickup.address || !formData.pickup.city || !formData.pickup.date ||
        !formData.delivery.name || !formData.delivery.address || !formData.delivery.city || !formData.delivery.date ||
        !formData.commodity.description || !formData.commodity.trailerType || !formData.commodity.driverName) {
      setError('Please fill in all required fields before generating the PDF.');
      return;
    }

    setIsGenerating(true);

    try {
      await generateTQLPDF(formData);
      setSuccess('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [formData]);

  // Trailer type options for the select dropdown
  const trailerTypeOptions = [
    { value: 'Van', label: 'Van' },
    { value: 'Refrigerated', label: 'Reefer' }
  ];

  return (
    <div className="App">
      <header className="app-header">
        <div className="tql-logo">
          <h1>TQL</h1>
          <span>TOTAL QUALITY LOGISTICS</span>
        </div>
        <div className="document-title">
          <h2>DRIVER/CARRIER INFORMATION SHEET</h2>
          <p>TQL PO# Generator</p>
        </div>
      </header>

      <div className="form-container">
        <div className="simplified-form">
          
          {/* Route Selection */}
          <RouteSelection 
            onCanadaSelect={setCanadaDefaults}
            onUSASelect={setUSADefaults}
          />
          
          {/* Pickup Information */}
          <FormSection title="PICKUP INFORMATION" icon="📍">
            <FormInput
              label="Pickup Name"
              value={formData.pickup.name}
              onChange={(value) => handleInputChange('pickup', 'name', value)}
              placeholder="e.g., ABC Warehouse"
              required
            />
            <FormInput
              label="Pickup Address"
              value={formData.pickup.address}
              onChange={(value) => handleInputChange('pickup', 'address', value)}
              placeholder="e.g., 6878 Kelly Ave"
              required
            />
            <FormInput
              label="City"
              value={formData.pickup.city}
              onChange={(value) => handleInputChange('pickup', 'city', value)}
              placeholder="e.g., Morrow"
              required
            />
            <FormInput
              label="State"
              value={formData.pickup.state}
              onChange={(value) => handleInputChange('pickup', 'state', value)}
              placeholder="GA"
              maxLength={2}
              required
            />
            <FormInput
              label="Zip Code"
              value={formData.pickup.zip}
              onChange={(value) => handleInputChange('pickup', 'zip', value)}
              placeholder="30260"
              required
            />
            <FormInput
              label="Pickup Date"
              type="date"
              value={formData.pickup.date}
              onChange={(value) => handleInputChange('pickup', 'date', value)}
              required
            />
          </FormSection>

          {/* Delivery Information */}
          <FormSection title="DELIVERY INFORMATION" icon="🚚">
            <FormInput
              label="Delivery Name"
              value={formData.delivery.name}
              onChange={(value) => handleInputChange('delivery', 'name', value)}
              placeholder="e.g., XYZ Distribution Center"
              required
            />
            <FormInput
              label="Delivery Address"
              value={formData.delivery.address}
              onChange={(value) => handleInputChange('delivery', 'address', value)}
              placeholder="e.g., 995 Bruce Lane"
              required
            />
            <FormInput
              label="City"
              value={formData.delivery.city}
              onChange={(value) => handleInputChange('delivery', 'city', value)}
              placeholder="e.g., Tifton"
              required
            />
            <FormInput
              label="State"
              value={formData.delivery.state}
              onChange={(value) => handleInputChange('delivery', 'state', value)}
              placeholder="GA"
              maxLength={2}
              required
            />
            <FormInput
              label="Zip Code"
              value={formData.delivery.zip}
              onChange={(value) => handleInputChange('delivery', 'zip', value)}
              placeholder="31794"
              required
            />
            <FormInput
              label="Delivery Date"
              type="date"
              value={formData.delivery.date}
              onChange={(value) => handleInputChange('delivery', 'date', value)}
              required
            />
          </FormSection>

          {/* Additional Information */}
          <FormSection title="ADDITIONAL INFO" icon="📦">
            <FormInput
              label="Commodity Description"
              value={formData.commodity.description}
              onChange={(value) => handleInputChange('commodity', 'description', value)}
              placeholder="e.g., Plastic bags"
              required
            />
            <FormInput
              label="Trailer Type"
              type="select"
              value={formData.commodity.trailerType}
              onChange={(value) => handleInputChange('commodity', 'trailerType', value)}
              options={trailerTypeOptions}
              required
            />
            <FormInput
              label="Driver Name"
              value={formData.commodity.driverName}
              onChange={(value) => handleInputChange('commodity', 'driverName', value)}
              placeholder="e.g., John Smith"
              required
            />
          </FormSection>

          {/* Error and Success Messages */}
          <MessageDisplay error={error} success={success} />

          {/* Generate PDF Button */}
          <div className="generate-section">
            <button 
              className="generate-btn"
              onClick={handleGeneratePDF}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating PDF...' : 'Generate PDF'}
            </button>
            <p className="generate-note">All other information will be filled automatically from the template</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 