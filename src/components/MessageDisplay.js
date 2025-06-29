import React from 'react';

const MessageDisplay = ({ error, success }) => {
  if (!error && !success) return null;

  return (
    <>
      {error && (
        <div className="message error-message">
          ❌ {error}
        </div>
      )}
      
      {success && (
        <div className="message success-message">
          ✅ {success}
        </div>
      )}
    </>
  );
};

export default MessageDisplay; 