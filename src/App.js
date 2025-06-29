import React, { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import './App.css';

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
      description: 'Plastic bags',
      trailerType: 'Van',
      driverName: 'Gurpreet'
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const setCanadaDefaults = () => {
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
  };

  const setUSADefaults = () => {
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
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const generatePDF = async () => {
    if (!formData.pickup.name || !formData.pickup.address || !formData.pickup.city || !formData.pickup.date ||
        !formData.delivery.name || !formData.delivery.address || !formData.delivery.city || !formData.delivery.date ||
        !formData.commodity.description || !formData.commodity.trailerType || !formData.commodity.driverName) {
      alert('Please fill in all required fields before generating the PDF.');
      return;
    }

    setIsGenerating(true);

    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]); // Standard letter size
      
      // Get fonts
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const { width, height } = page.getSize();
      
      // Colors
      const blue = rgb(0, 0.588, 0.843); // #0096D6
      const black = rgb(0, 0, 0);
      const darkGray = rgb(0.3, 0.3, 0.3);
      
      // Helper function to draw text
      const drawText = (text, x, y, options = {}) => {
        page.drawText(text, {
          x,
          y: height - y,
          size: options.size || 10,
          font: options.bold ? helveticaBoldFont : helveticaFont,
          color: options.color || black,
          ...options
        });
      };
      
      // Helper function to draw rectangle
      const drawRect = (x, y, w, h, options = {}) => {
        page.drawRectangle({
          x,
          y: height - y - h,
          width: w,
          height: h,
          borderColor: options.borderColor || black,
          borderWidth: options.borderWidth || 1,
          color: options.color || undefined,
          ...options
        });
      };

      // Header Section with Logo
      // TQL text on the left - larger size to match logo
      drawText('TQL', 50, 70, { size: 38, bold: true, color: black });
      drawText('TOTAL QUALITY LOGISTICS', 50, 90, { size: 8, color: black });
      
      try {
        // Try to load and embed the TQL logo image to the right of TQL text, same level
        const logoResponse = await fetch('/tql-logo.png');
        if (logoResponse.ok) {
          const logoImageBytes = await logoResponse.arrayBuffer();
          const logoImage = await pdfDoc.embedPng(logoImageBytes);
          
          // Draw the logo image to the right of TQL text at the same vertical level
          page.drawImage(logoImage, {
            x: 130,
            y: height - 77,
            width: 50,
            height: 50,
          });
        }
      } catch (error) {
        // Silently fail if logo not found, text will still display
        console.log('Logo not found, using text only');
      }

      // Pickup and Delivery Dates
      drawText('Pickup Dates', 250, 80, { size: 10, bold: true });
      drawText('Delivery Dates', 450, 80, { size: 10, bold: true });
      drawText(formatDate(formData.pickup.date), 250, 95, { size: 10 });
      drawText(formatDate(formData.delivery.date), 450, 95, { size: 10 });

      // Document Title Section in Blue
      drawRect(50, 110, 512, 25, { color: blue });
      drawText('DRIVER/CARRIER INFORMATION SHEET TQL PO# 32818157', 55, 128, { 
        size: 12, 
        bold: true, 
        color: rgb(1, 1, 1) 
      });

      // TQL Contact Info Section
      drawRect(50, 145, 512, 20, { color: blue });
      drawText('TQL CONTACT INFO', 55, 160, { size: 10, bold: true, color: rgb(1, 1, 1) });
      
      // TQL Contact Info table - Header row
      drawRect(50, 165, 128, 15, { borderWidth: 1 });
      drawRect(178, 165, 140, 15, { borderWidth: 1 });
      drawRect(318, 165, 160, 15, { borderWidth: 1 });
      drawRect(478, 165, 84, 15, { borderWidth: 1 });
      
      drawText('Name', 55, 175, { size: 8, bold: true });
      drawText('Phone', 183, 175, { size: 8, bold: true });
      drawText('Email', 323, 175, { size: 8, bold: true });
      drawText('Fax', 483, 175, { size: 8, bold: true });
      
      // TQL Contact Info table - Data row
      drawRect(50, 180, 128, 15, { borderWidth: 1 });
      drawRect(178, 180, 140, 15, { borderWidth: 1 });
      drawRect(318, 180, 160, 15, { borderWidth: 1 });
      drawRect(478, 180, 84, 15, { borderWidth: 1 });
      
      drawText('Joshua Buggs', 55, 190, { size: 8 });
      drawText('800-580-3101 x50466', 183, 190, { size: 8 });
      drawText('JFlynnBuggs@TQL.com', 323, 190, { size: 8 });
      drawText('5138721647', 483, 190, { size: 8 });

      // Carrier Contact Section
      drawRect(50, 205, 512, 20, { color: blue });
      drawText('CARRIER CONTACT', 55, 220, { size: 10, bold: true, color: rgb(1, 1, 1) });
      
      // Carrier Contact table - Header row
      drawRect(50, 225, 195, 15, { borderWidth: 1 });
      drawRect(245, 225, 155, 15, { borderWidth: 1 });
      drawRect(400, 225, 162, 15, { borderWidth: 1 });
      
      drawText('Name', 55, 235, { size: 8, bold: true });
      drawText('Dispatcher', 250, 235, { size: 8, bold: true });
      drawText('Driver', 405, 235, { size: 8, bold: true });
      
      // Carrier Contact table - Data row
      drawRect(50, 240, 195, 15, { borderWidth: 1 });
      drawRect(245, 240, 155, 15, { borderWidth: 1 });
      drawRect(400, 240, 162, 15, { borderWidth: 1 });
      
      drawText('Bliss Carriers Ltd (ab)', 55, 250, { size: 8 });
      drawText('Sunny', 250, 250, { size: 8 });
      drawText(formData.commodity.driverName, 405, 250, { size: 8 });

      // Load Information Section
      drawRect(50, 265, 512, 20, { color: blue });
      drawText('LOAD INFORMATION', 55, 280, { size: 10, bold: true, color: rgb(1, 1, 1) });
      
      // Load Information table - Header row
      drawRect(50, 285, 60, 15, { borderWidth: 1 });
      drawRect(110, 285, 70, 15, { borderWidth: 1 });
      drawRect(180, 285, 70, 15, { borderWidth: 1 });
      drawRect(250, 285, 110, 15, { borderWidth: 1 });
      drawRect(360, 285, 90, 15, { borderWidth: 1 });
      drawRect(450, 285, 112, 15, { borderWidth: 1 });
      
      drawText('Mode', 55, 295, { size: 8, bold: true });
      drawText('Trailer Type', 115, 295, { size: 8, bold: true });
      drawText('Trailer Size', 185, 295, { size: 8, bold: true });
      drawText('Pallet/Case Count', 255, 295, { size: 8, bold: true });
      drawText('Hazmat', 365, 295, { size: 8, bold: true });
      drawText('Load Requirements', 455, 295, { size: 8, bold: true });
      
      // Load Information table - Data row
      drawRect(50, 300, 60, 15, { borderWidth: 1 });
      drawRect(110, 300, 70, 15, { borderWidth: 1 });
      drawRect(180, 300, 70, 15, { borderWidth: 1 });
      drawRect(250, 300, 110, 15, { borderWidth: 1 });
      drawRect(360, 300, 90, 15, { borderWidth: 1 });
      drawRect(450, 300, 112, 15, { borderWidth: 1 });
      
      drawText('FTL', 55, 310, { size: 8 });
      drawText(formData.commodity.trailerType === 'Refrigerated' ? 'Reefer' : 'Van', 115, 310, { size: 8 });
      drawText('53 ft', 185, 310, { size: 8 });
      drawText('24 pallets', 255, 310, { size: 8 });
      drawText('Non-Hazardous', 365, 310, { size: 8 });

      // Carrier Responsible For Section
      drawRect(50, 325, 512, 20, { color: blue });
      drawText('CARRIER RESPONSIBLE FOR', 55, 340, { size: 10, bold: true, color: rgb(1, 1, 1) });
      
      // Carrier Responsible table - Header row
      drawRect(50, 345, 170, 15, { borderWidth: 1 });
      drawRect(220, 345, 130, 15, { borderWidth: 1 });
      drawRect(350, 345, 212, 15, { borderWidth: 1 });
      
      drawText('Unloading', 55, 355, { size: 8, bold: true });
      drawText('Pallet Exchange', 225, 355, { size: 8, bold: true });
      drawText('Estimated Weight', 355, 355, { size: 8, bold: true });
      
      // Carrier Responsible table - Data row
      drawRect(50, 360, 170, 15, { borderWidth: 1 });
      drawRect(220, 360, 130, 15, { borderWidth: 1 });
      drawRect(350, 360, 212, 15, { borderWidth: 1 });
      
      drawText('None w/ valid unloading receipt', 55, 370, { size: 8 });
      drawText('None', 225, 370, { size: 8 });
      drawText('41000', 355, 370, { size: 8 });

      // Pickups Section
      drawRect(50, 385, 512, 20, { color: blue });
      drawText('PICKUPS', 55, 400, { size: 10, bold: true, color: rgb(1, 1, 1) });
      
      // Pickups table - Header row
      drawRect(50, 405, 125, 15, { borderWidth: 1 });
      drawRect(175, 405, 65, 15, { borderWidth: 1 });
      drawRect(240, 405, 40, 15, { borderWidth: 1 });
      drawRect(280, 405, 40, 15, { borderWidth: 1 });
      drawRect(320, 405, 50, 15, { borderWidth: 1 });
      drawRect(370, 405, 80, 15, { borderWidth: 1 });
      drawRect(450, 405, 112, 15, { borderWidth: 1 });
      
      drawText('Shed', 55, 415, { size: 8, bold: true });
      drawText('City', 180, 415, { size: 8, bold: true });
      drawText('State', 245, 415, { size: 8, bold: true });
      drawText('Zip', 285, 415, { size: 8, bold: true });
      drawText('PU#', 325, 415, { size: 8, bold: true });
      drawText('Date', 375, 415, { size: 8, bold: true });
      drawText('Time', 455, 415, { size: 8, bold: true });
      
      // Pickups table - Data row
      drawRect(50, 420, 125, 15, { borderWidth: 1 });
      drawRect(175, 420, 65, 15, { borderWidth: 1 });
      drawRect(240, 420, 40, 15, { borderWidth: 1 });
      drawRect(280, 420, 40, 15, { borderWidth: 1 });
      drawRect(320, 420, 50, 15, { borderWidth: 1 });
      drawRect(370, 420, 80, 15, { borderWidth: 1 });
      drawRect(450, 420, 112, 15, { borderWidth: 1 });
      
      const pickupShed = `${formData.pickup.address.substring(0, 15)} (${formData.pickup.city.toUpperCase()},${formData.pickup.state.toUpperCase()})`;
      drawText(pickupShed, 55, 430, { size: 7 });
      drawText(formData.pickup.city, 180, 430, { size: 8 });
      drawText(formData.pickup.state.toUpperCase(), 245, 430, { size: 8 });
      drawText(formData.pickup.zip, 285, 430, { size: 8 });
      drawText('AL25179', 325, 430, { size: 8 });
      drawText(formatDate(formData.pickup.date), 375, 430, { size: 8 });
      drawText('FCFS 08:00 to 06:00', 455, 430, { size: 7 });

      // Pickup Information section
      drawRect(50, 440, 250, 20, { color: blue });
      drawText('Information:', 55, 453, { size: 8, bold: true, color: rgb(1, 1, 1) });
      
      drawRect(50, 460, 250, 45, { borderWidth: 1 });
      drawText(formData.pickup.name, 55, 470, { size: 8 });
      drawText(formData.pickup.address, 55, 485, { size: 8 });
      drawText(`${formData.pickup.city} ${formData.pickup.state.toUpperCase()} ${formData.pickup.zip}`, 55, 500, { size: 8 });

      // Commodities section
      drawRect(310, 440, 252, 20, { color: blue });
      drawText('Commodities:', 315, 453, { size: 8, bold: true, color: rgb(1, 1, 1) });
      
      // Commodities table - Header row
      drawRect(310, 460, 40, 15, { borderWidth: 1 });
      drawRect(350, 460, 40, 15, { borderWidth: 1 });
      drawRect(390, 460, 80, 15, { borderWidth: 1 });
      drawRect(470, 460, 92, 15, { borderWidth: 1 });
      
      drawText('Quantity', 315, 470, { size: 8, bold: true });
      drawText('Unit', 355, 470, { size: 8, bold: true });
      drawText('Commodity', 395, 470, { size: 8, bold: true });
      drawText('Notes', 475, 470, { size: 8, bold: true });
      
      // Commodities table - Data row (taller to accommodate notes)
      drawRect(310, 475, 40, 30, { borderWidth: 1 });
      drawRect(350, 475, 40, 30, { borderWidth: 1 });
      drawRect(390, 475, 80, 30, { borderWidth: 1 });
      drawRect(470, 475, 92, 30, { borderWidth: 1 });
      
      drawText('24', 315, 485, { size: 8 });
      drawText('Pallets', 355, 485, { size: 8 });
      drawText(formData.commodity.description.substring(0, 12), 395, 485, { size: 8 });
      
      // Dynamic notes based on trailer type - split into multiple lines
      if (formData.commodity.trailerType === 'Refrigerated') {
        drawText('Keep refrigerated', 475, 483, { size: 7 });
        drawText('if any issues', 475, 492, { size: 7 });
        drawText('call broker', 475, 501, { size: 7 });
      } else {
        drawText('Call broker if', 475, 487, { size: 7 });
        drawText('any issue', 475, 496, { size: 7 });
      }

      // Drops Section
      drawRect(50, 530, 512, 20, { color: blue });
      drawText('DROPS', 55, 545, { size: 10, bold: true, color: rgb(1, 1, 1) });
      
      // Drops table - Header row
      drawRect(50, 550, 110, 15, { borderWidth: 1 });
      drawRect(160, 550, 60, 15, { borderWidth: 1 });
      drawRect(220, 550, 40, 15, { borderWidth: 1 });
      drawRect(260, 550, 40, 15, { borderWidth: 1 });
      drawRect(300, 550, 80, 15, { borderWidth: 1 });
      drawRect(380, 550, 70, 15, { borderWidth: 1 });
      drawRect(450, 550, 112, 15, { borderWidth: 1 });
      
      drawText('Consignee', 55, 560, { size: 8, bold: true });
      drawText('City', 165, 560, { size: 8, bold: true });
      drawText('State', 225, 560, { size: 8, bold: true });
      drawText('Zip', 265, 560, { size: 8, bold: true });
      drawText('Delivery PO', 305, 560, { size: 8, bold: true });
      drawText('Date', 385, 560, { size: 8, bold: true });
      drawText('Time', 455, 560, { size: 8, bold: true });
      
      // Drops table - Data row
      drawRect(50, 565, 110, 15, { borderWidth: 1 });
      drawRect(160, 565, 60, 15, { borderWidth: 1 });
      drawRect(220, 565, 40, 15, { borderWidth: 1 });
      drawRect(260, 565, 40, 15, { borderWidth: 1 });
      drawRect(300, 565, 80, 15, { borderWidth: 1 });
      drawRect(380, 565, 70, 15, { borderWidth: 1 });
      drawRect(450, 565, 112, 15, { borderWidth: 1 });
      
      const deliveryConsignee = `${formData.delivery.address.substring(0, 12)} (${formData.delivery.city.toUpperCase()}, ${formData.delivery.state.toUpperCase()})`;
      drawText(deliveryConsignee, 55, 575, { size: 7 });
      drawText(formData.delivery.city, 165, 575, { size: 8 });
      drawText(formData.delivery.state.toUpperCase(), 225, 575, { size: 8 });
      drawText(formData.delivery.zip, 265, 575, { size: 8 });
      drawText('2304942', 305, 575, { size: 8 });
      drawText(formatDate(formData.delivery.date), 385, 575, { size: 8 });
      drawText('FCFS 07:00 to 12:00', 455, 575, { size: 7 });

      // Delivery Information section
      drawRect(50, 585, 512, 20, { color: blue });
      drawText('Information:', 55, 598, { size: 8, bold: true, color: rgb(1, 1, 1) });
      
      drawRect(50, 605, 512, 45, { borderWidth: 1 });
      drawText(formData.delivery.name, 55, 615, { size: 8 });
      drawText(formData.delivery.address, 55, 630, { size: 8 });
      drawText(`${formData.delivery.city} ${formData.delivery.state.toUpperCase()} ${formData.delivery.zip}`, 55, 645, { size: 8 });

      // Footer
      drawText('Page 1 of 1', 280, 755, { size: 8 });
      
      // Add barcode and QR code at bottom
      try {
        const barcodeResponse = await fetch('/barcode-qr.png');
        if (barcodeResponse.ok) {
          const barcodeImageBytes = await barcodeResponse.arrayBuffer();
          const barcodeImage = await pdfDoc.embedPng(barcodeImageBytes);
          
          // Draw the barcode/QR code image at bottom center
          page.drawImage(barcodeImage, {
            x: 400,
            y: height - 735,
            width: 200,
            height: 80,
          });
        }
      } catch (error) {
        // Fallback if barcode image not found
        console.log('Barcode image not found');
      }

      // Generate and save PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      // Generate filename with current date
      const now = new Date();
      const filename = `TQL_Carrier_Info_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}.pdf`;
      
      saveAs(blob, filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

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
          
          {/* Country Selection Buttons */}
          <div className="country-selection">
            <h3 className="section-header">🌍 ROUTE SELECTION</h3>
            <div className="country-buttons">
              <button 
                type="button" 
                className="country-btn canada-btn" 
                onClick={setCanadaDefaults}
              >
                🇨🇦 CANADA
                <span className="btn-subtitle">Pickup from Ontario Food Terminal</span>
              </button>
              <button 
                type="button" 
                className="country-btn usa-btn" 
                onClick={setUSADefaults}
              >
                🇺🇸 USA
                <span className="btn-subtitle">Delivery to Ontario Food Terminal</span>
              </button>
            </div>
          </div>
          
          {/* Pickup Information */}
          <div className="form-section">
            <h3 className="section-header">📍 PICKUP INFORMATION</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Pickup Name</label>
                <input
                  type="text"
                  value={formData.pickup.name}
                  onChange={(e) => handleInputChange('pickup', 'name', e.target.value)}
                  placeholder="e.g., ABC Warehouse"
                  required
                />
              </div>
              <div className="form-group">
                <label>Pickup Address</label>
                <input
                  type="text"
                  value={formData.pickup.address}
                  onChange={(e) => handleInputChange('pickup', 'address', e.target.value)}
                  placeholder="e.g., 6878 Kelly Ave"
                  required
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={formData.pickup.city}
                  onChange={(e) => handleInputChange('pickup', 'city', e.target.value)}
                  placeholder="e.g., Morrow"
                  required
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  value={formData.pickup.state}
                  onChange={(e) => handleInputChange('pickup', 'state', e.target.value)}
                  placeholder="GA"
                  maxLength="2"
                  required
                />
              </div>
              <div className="form-group">
                <label>Zip Code</label>
                <input
                  type="text"
                  value={formData.pickup.zip}
                  onChange={(e) => handleInputChange('pickup', 'zip', e.target.value)}
                  placeholder="30260"
                  required
                />
              </div>
              <div className="form-group">
                <label>Pickup Date</label>
                <input
                  type="date"
                  value={formData.pickup.date}
                  onChange={(e) => handleInputChange('pickup', 'date', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="form-section">
            <h3 className="section-header">🚚 DELIVERY INFORMATION</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Delivery Name</label>
                <input
                  type="text"
                  value={formData.delivery.name}
                  onChange={(e) => handleInputChange('delivery', 'name', e.target.value)}
                  placeholder="e.g., XYZ Distribution Center"
                  required
                />
              </div>
              <div className="form-group">
                <label>Delivery Address</label>
                <input
                  type="text"
                  value={formData.delivery.address}
                  onChange={(e) => handleInputChange('delivery', 'address', e.target.value)}
                  placeholder="e.g., 995 Bruce Lane"
                  required
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={formData.delivery.city}
                  onChange={(e) => handleInputChange('delivery', 'city', e.target.value)}
                  placeholder="e.g., Tifton"
                  required
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  value={formData.delivery.state}
                  onChange={(e) => handleInputChange('delivery', 'state', e.target.value)}
                  placeholder="GA"
                  maxLength="2"
                  required
                />
              </div>
              <div className="form-group">
                <label>Zip Code</label>
                <input
                  type="text"
                  value={formData.delivery.zip}
                  onChange={(e) => handleInputChange('delivery', 'zip', e.target.value)}
                  placeholder="31794"
                  required
                />
              </div>
              <div className="form-group">
                <label>Delivery Date</label>
                <input
                  type="date"
                  value={formData.delivery.date}
                  onChange={(e) => handleInputChange('delivery', 'date', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Commodity Information */}
          <div className="form-section">
            <h3 className="section-header">📦 COMMODITY INFORMATION</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Commodity Description</label>
                <input
                  type="text"
                  value={formData.commodity.description}
                  onChange={(e) => handleInputChange('commodity', 'description', e.target.value)}
                  placeholder="e.g., Plastic bags"
                  required
                />
              </div>
              <div className="form-group">
                <label>Trailer Type</label>
                <select
                  value={formData.commodity.trailerType}
                  onChange={(e) => handleInputChange('commodity', 'trailerType', e.target.value)}
                  required
                >
                  <option value="Van">Van</option>
                  <option value="Refrigerated">Refrigerated</option>
                </select>
              </div>
              <div className="form-group">
                <label>Driver Name</label>
                <input
                  type="text"
                  value={formData.commodity.driverName}
                  onChange={(e) => handleInputChange('commodity', 'driverName', e.target.value)}
                  placeholder="e.g., Gurpreet"
                  required
                />
              </div>
            </div>
          </div>



        </div>

        <div className="generate-section">
          <button 
            className="generate-btn" 
            onClick={generatePDF}
            disabled={isGenerating}
          >
            {isGenerating ? '🔄 Generating PDF...' : '🔥 Generate TQL PDF Document'}
          </button>
          <p className="generate-note">All other information will be filled automatically from the template</p>
        </div>
      </div>
    </div>
  );
}

export default App; 