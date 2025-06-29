import React from 'react';

const FormSection = ({ title, icon, children, className = '' }) => {
  return (
    <div className={`form-section ${className}`}>
      <h3 className="section-header">
        {icon} {title}
      </h3>
      <div className="form-grid">
        {children}
      </div>
    </div>
  );
};

export default FormSection; 