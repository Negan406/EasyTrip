import React from 'react';

const ClearStorageButton = () => {
  const clearAllData = () => {
    localStorage.clear();
    alert('All local storage data cleared!');
  };

  return (
    <div>
      <button onClick={clearAllData} className="cta-button">Clear All Data</button>
    </div>
  );
};

export default ClearStorageButton; 