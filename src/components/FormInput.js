import React from 'react';

const FormInput = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  options = [],
  maxLength,
  className = ''
}) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  if (type === 'select') {
    return (
      <div className={`form-group ${className}`}>
        <label>{label}</label>
        <select
          value={value}
          onChange={handleChange}
          required={required}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={`form-group ${className}`}>
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
      />
    </div>
  );
};

export default FormInput; 