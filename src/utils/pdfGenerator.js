import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';

export const generateTQLPDF = async (formData) => {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Standard letter size
  
  // Get fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const { height } = page.getSize();
  
  // Colors
  const blue = rgb(0, 0.588, 0.843); // #0096D6
  const black = rgb(0, 0, 0);
  
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

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Parse date as local date to avoid timezone issues
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
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
  
  drawText('Contact Name', 55, 175, { size: 8, bold: true });
  drawText('Phone Number', 183, 175, { size: 8, bold: true });
  drawText('Email', 323, 175, { size: 8, bold: true });
  drawText('Extension', 483, 175, { size: 8, bold: true });
  
  // TQL Contact Info table - Data row
  drawRect(50, 180, 128, 15, { borderWidth: 1 });
  drawRect(178, 180, 140, 15, { borderWidth: 1 });
  drawRect(318, 180, 160, 15, { borderWidth: 1 });
  drawRect(478, 180, 84, 15, { borderWidth: 1 });
  
  drawText('Joshua Buggs', 55, 190, { size: 8 });
  drawText('(513) 831-2600', 183, 190, { size: 8 });
  drawText('jbuggs@tql.com', 323, 190, { size: 8 });
  drawText('75404', 483, 190, { size: 8 });

  // Carrier Contact Section
  drawRect(50, 205, 512, 20, { color: blue });
  drawText('CARRIER CONTACT', 55, 220, { size: 10, bold: true, color: rgb(1, 1, 1) });
  
  // Carrier Contact table - Header row
  drawRect(50, 225, 128, 15, { borderWidth: 1 });
  drawRect(178, 225, 140, 15, { borderWidth: 1 });
  drawRect(318, 225, 160, 15, { borderWidth: 1 });
  drawRect(478, 225, 84, 15, { borderWidth: 1 });
  
  drawText('Carrier Name', 55, 235, { size: 8, bold: true });
  drawText('Phone Number', 183, 235, { size: 8, bold: true });
  drawText('Email', 323, 235, { size: 8, bold: true });
  drawText('MC Number', 483, 235, { size: 8, bold: true });
  
  // Carrier Contact table - Data row
  drawRect(50, 240, 128, 15, { borderWidth: 1 });
  drawRect(178, 240, 140, 15, { borderWidth: 1 });
  drawRect(318, 240, 160, 15, { borderWidth: 1 });
  drawRect(478, 240, 84, 15, { borderWidth: 1 });
  
  drawText('Bliss Carriers Ltd', 55, 250, { size: 8 });
  drawText('(780) 233-4190', 183, 250, { size: 8 });
  drawText('info@blisscarriers.com', 323, 250, { size: 8 });
  drawText('MC1303940', 483, 250, { size: 8 });

  // Load Information Section
  drawRect(50, 265, 512, 20, { color: blue });
  drawText('LOAD INFORMATION', 55, 280, { size: 10, bold: true, color: rgb(1, 1, 1) });
  
  // Load Information table - Header row
  drawRect(50, 285, 85, 15, { borderWidth: 1 });
  drawRect(135, 285, 85, 15, { borderWidth: 1 });
  drawRect(220, 285, 85, 15, { borderWidth: 1 });
  drawRect(305, 285, 85, 15, { borderWidth: 1 });
  drawRect(390, 285, 85, 15, { borderWidth: 1 });
  drawRect(475, 285, 87, 15, { borderWidth: 1 });
  
  drawText('Mode', 55, 295, { size: 8, bold: true });
  drawText('Trailer Type', 140, 295, { size: 8, bold: true });
  drawText('Trailer Length', 225, 295, { size: 8, bold: true });
  drawText('Driver', 310, 295, { size: 8, bold: true });
  drawText('Hazmat', 395, 295, { size: 8, bold: true });
  drawText('Temp Control', 480, 295, { size: 8, bold: true });
  
  // Load Information table - Data row
  drawRect(50, 300, 85, 15, { borderWidth: 1 });
  drawRect(135, 300, 85, 15, { borderWidth: 1 });
  drawRect(220, 300, 85, 15, { borderWidth: 1 });
  drawRect(305, 300, 85, 15, { borderWidth: 1 });
  drawRect(390, 300, 85, 15, { borderWidth: 1 });
  drawRect(475, 300, 87, 15, { borderWidth: 1 });
  
  drawText('FTL', 55, 310, { size: 8 });
  drawText(formData.commodity.trailerType, 140, 310, { size: 8 });
  drawText('53\'', 225, 310, { size: 8 });
  drawText(formData.commodity.driverName, 310, 310, { size: 8 });
  drawText('NO', 395, 310, { size: 8 });
  drawText(formData.commodity.trailerType === 'Refrigerated' ? 'YES' : 'NO', 480, 310, { size: 8 });

  // Carrier Responsible For Section
  drawRect(50, 325, 512, 20, { color: blue });
  drawText('CARRIER RESPONSIBLE FOR', 55, 340, { size: 10, bold: true, color: rgb(1, 1, 1) });
  
  drawRect(50, 345, 512, 45, { borderWidth: 1 });
  drawText('• Fuel, tolls, permits, driver expenses', 55, 355, { size: 8 });
  drawText('• Cargo insurance coverage', 55, 370, { size: 8 });
  drawText('• On-time pickup and delivery', 55, 385, { size: 8 });

  // Pickups Section
  drawRect(50, 400, 512, 20, { color: blue });
  drawText('PICKUPS', 55, 415, { size: 10, bold: true, color: rgb(1, 1, 1) });
  
  // Pickups table - Header row
  drawRect(50, 420, 125, 15, { borderWidth: 1 });
  drawRect(175, 420, 65, 15, { borderWidth: 1 });
  drawRect(240, 420, 40, 15, { borderWidth: 1 });
  drawRect(280, 420, 40, 15, { borderWidth: 1 });
  drawRect(320, 420, 50, 15, { borderWidth: 1 });
  drawRect(370, 420, 80, 15, { borderWidth: 1 });
  drawRect(450, 420, 112, 15, { borderWidth: 1 });
  
  drawText('Shed', 55, 430, { size: 8, bold: true });
  drawText('City', 180, 430, { size: 8, bold: true });
  drawText('State', 245, 430, { size: 8, bold: true });
  drawText('Zip', 285, 430, { size: 8, bold: true });
  drawText('PU#', 325, 430, { size: 8, bold: true });
  drawText('Date', 375, 430, { size: 8, bold: true });
  drawText('Time', 455, 430, { size: 8, bold: true });
  
  // Pickups table - Data row (doubled height for Shed row)
  drawRect(50, 435, 125, 30, { borderWidth: 1 });
  drawRect(175, 435, 65, 30, { borderWidth: 1 });
  drawRect(240, 435, 40, 30, { borderWidth: 1 });
  drawRect(280, 435, 40, 30, { borderWidth: 1 });
  drawRect(320, 435, 50, 30, { borderWidth: 1 });
  drawRect(370, 435, 80, 30, { borderWidth: 1 });
  drawRect(450, 435, 112, 30, { borderWidth: 1 });
  
  // Better formatted pickup shed information with multiple lines
  drawText(formData.pickup.address, 55, 443, { size: 7 });
  drawText(`(${formData.pickup.city.toUpperCase()}, ${formData.pickup.state.toUpperCase()})`, 55, 453, { size: 7 });
  drawText(formData.pickup.city, 180, 450, { size: 8 });
  drawText(formData.pickup.state.toUpperCase(), 245, 450, { size: 8 });
  drawText(formData.pickup.zip, 285, 450, { size: 8 });
  drawText('AL25179', 325, 450, { size: 8 });
  drawText(formatDate(formData.pickup.date), 375, 450, { size: 8 });
  drawText('FCFS 08:00 to 06:00', 455, 450, { size: 7 });

  // Pickup Information section - adjusted positioning and reasonable height
  drawRect(50, 470, 250, 20, { color: blue });
  drawText('Information:', 55, 483, { size: 8, bold: true, color: rgb(1, 1, 1) });
  
  drawRect(50, 490, 250, 60, { borderWidth: 1 });
  drawText(formData.pickup.name, 55, 505, { size: 8 });
  drawText(formData.pickup.address, 55, 520, { size: 8 });
  drawText(`${formData.pickup.city} ${formData.pickup.state.toUpperCase()} ${formData.pickup.zip}`, 55, 535, { size: 8 });

  // Commodities section - adjusted positioning
  drawRect(310, 470, 252, 20, { color: blue });
  drawText('Commodities:', 315, 483, { size: 8, bold: true, color: rgb(1, 1, 1) });
  
  // Commodities table - Header row
  drawRect(310, 490, 40, 15, { borderWidth: 1 });
  drawRect(350, 490, 40, 15, { borderWidth: 1 });
  drawRect(390, 490, 80, 15, { borderWidth: 1 });
  drawRect(470, 490, 92, 15, { borderWidth: 1 });
  
  drawText('Quantity', 315, 500, { size: 8, bold: true });
  drawText('Unit', 355, 500, { size: 8, bold: true });
  drawText('Commodity', 395, 500, { size: 8, bold: true });
  drawText('Notes', 475, 500, { size: 8, bold: true });
  
  // Commodities table - Data row (reasonable height)
  drawRect(310, 505, 40, 45, { borderWidth: 1 });
  drawRect(350, 505, 40, 45, { borderWidth: 1 });
  drawRect(390, 505, 80, 45, { borderWidth: 1 });
  drawRect(470, 505, 92, 45, { borderWidth: 1 });
  
  drawText('24', 315, 525, { size: 8 });
  drawText('Pallets', 355, 525, { size: 8 });
  drawText(formData.commodity.description.substring(0, 12), 395, 525, { size: 8 });
  
  // Dynamic notes based on trailer type - split into multiple lines
  if (formData.commodity.trailerType === 'Refrigerated') {
    drawText('Keep refrigerated', 475, 523, { size: 7 });
    drawText('if any issues', 475, 532, { size: 7 });
    drawText('call broker', 475, 541, { size: 7 });
  } else {
    drawText('Call broker if', 475, 527, { size: 7 });
    drawText('any issue', 475, 536, { size: 7 });
  }

  // Drops Section - adjusted positioning
  drawRect(50, 575, 512, 20, { color: blue });
  drawText('DROPS', 55, 590, { size: 10, bold: true, color: rgb(1, 1, 1) });
  
  // Drops table - Header row
  drawRect(50, 595, 110, 15, { borderWidth: 1 });
  drawRect(160, 595, 60, 15, { borderWidth: 1 });
  drawRect(220, 595, 40, 15, { borderWidth: 1 });
  drawRect(260, 595, 40, 15, { borderWidth: 1 });
  drawRect(300, 595, 80, 15, { borderWidth: 1 });
  drawRect(380, 595, 70, 15, { borderWidth: 1 });
  drawRect(450, 595, 112, 15, { borderWidth: 1 });
  
  drawText('Consignee', 55, 605, { size: 8, bold: true });
  drawText('City', 165, 605, { size: 8, bold: true });
  drawText('State', 225, 605, { size: 8, bold: true });
  drawText('Zip', 265, 605, { size: 8, bold: true });
  drawText('Delivery PO', 305, 605, { size: 8, bold: true });
  drawText('Date', 385, 605, { size: 8, bold: true });
  drawText('Time', 455, 605, { size: 8, bold: true });
  
  // Drops table - Data row (doubled height for Consignee row)
  drawRect(50, 610, 110, 30, { borderWidth: 1 });
  drawRect(160, 610, 60, 30, { borderWidth: 1 });
  drawRect(220, 610, 40, 30, { borderWidth: 1 });
  drawRect(260, 610, 40, 30, { borderWidth: 1 });
  drawRect(300, 610, 80, 30, { borderWidth: 1 });
  drawRect(380, 610, 70, 30, { borderWidth: 1 });
  drawRect(450, 610, 112, 30, { borderWidth: 1 });
  
  // Better formatted delivery consignee information with multiple lines
  drawText(formData.delivery.address, 55, 618, { size: 7 });
  drawText(`(${formData.delivery.city.toUpperCase()}, ${formData.delivery.state.toUpperCase()})`, 55, 628, { size: 7 });
  drawText(formData.delivery.city, 165, 625, { size: 8 });
  drawText(formData.delivery.state.toUpperCase(), 225, 625, { size: 8 });
  drawText(formData.delivery.zip, 265, 625, { size: 8 });
  drawText('2304942', 305, 625, { size: 8 });
  drawText(formatDate(formData.delivery.date), 385, 625, { size: 8 });
  drawText('FCFS 07:00 to 12:00', 455, 625, { size: 7 });

  // Delivery Information section - adjusted positioning and reasonable height
  drawRect(50, 645, 512, 20, { color: blue });
  drawText('Information:', 55, 658, { size: 8, bold: true, color: rgb(1, 1, 1) });
  
  drawRect(50, 665, 512, 60, { borderWidth: 1 });
  drawText(formData.delivery.name, 55, 680, { size: 8 });
  drawText(formData.delivery.address, 55, 695, { size: 8 });
  drawText(`${formData.delivery.city} ${formData.delivery.state.toUpperCase()} ${formData.delivery.zip}`, 55, 710, { size: 8 });

  // Footer - adjusted positioning
  drawText('Page 1 of 1', 280, 765, { size: 8 });
  
  // Add barcode and QR code at bottom - adjusted positioning
  try {
    const barcodeResponse = await fetch('/barcode-qr.png');
    if (barcodeResponse.ok) {
      const barcodeImageBytes = await barcodeResponse.arrayBuffer();
      const barcodeImage = await pdfDoc.embedPng(barcodeImageBytes);
      
      // Draw the barcode/QR code image at bottom center
      page.drawImage(barcodeImage, {
        x: 400,
        y: height - 790,
        width: 150,
        height: 50,
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
}; 