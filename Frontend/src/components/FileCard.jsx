// File: src/components/FileCard.jsx
import React from 'react';
import { formatDate } from '../utils/formatDate';

function FileCard({ file }) {
  return (
    <div className="p-4 border rounded shadow">
      <p className="font-medium">{file.filename}</p>
      <p className="text-sm text-gray-500">Uploaded: {formatDate(file.uploadedAt)}</p>
    </div>
  );
}

export default FileCard;
