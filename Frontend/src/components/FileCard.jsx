// src/components/FileCard.jsx
import React from 'react';
import { FileText, Download } from 'lucide-react';

function FileCard({ file }) {
  const handleDownload = () => {
    window.open(file.url, '_blank');
  };

  return (
    <div className="p-4 border rounded-xl shadow-md bg-white flex flex-col justify-between">
      <div className="flex items-center space-x-3">
        <FileText className="text-blue-600" />
        <div className="text-lg font-semibold truncate">{file.filename}</div>
      </div>
      <button
        onClick={handleDownload}
        className="mt-4 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
      >
        <Download className="inline-block w-4 h-4 mr-1" />
        Download
      </button>
    </div>
  );
}

export default FileCard;
