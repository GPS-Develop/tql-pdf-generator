import React from 'react';

const RouteSelection = ({ onCanadaSelect, onUSASelect }) => {
  return (
    <div className="country-selection">
      <h3 className="section-header">🌍 ROUTE SELECTION</h3>
      <div className="country-buttons">
        <button 
          type="button" 
          className="country-btn canada-btn" 
          onClick={onCanadaSelect}
        >
          🇨🇦 CANADA
        </button>
        <button 
          type="button" 
          className="country-btn usa-btn" 
          onClick={onUSASelect}
        >
          🇺🇸 USA
        </button>
      </div>
    </div>
  );
};

export default RouteSelection; 