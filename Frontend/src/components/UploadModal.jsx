// File: src/components/UploadModal.jsx
import React from 'react';

function UploadModal() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded">
        <h2 className="text-lg font-bold mb-4">Upload File</h2>
        <input type="file" />
      </div>
    </div>
  );
}

export default UploadModal;