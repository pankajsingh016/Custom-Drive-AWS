// File: src/components/FolderCard.jsx
import React from 'react';

function FolderCard({ name }) {
  return (
    <div className="p-4 border rounded shadow bg-blue-100">
      <p className="font-medium">📁 {name}</p>
    </div>
  );
}

export default FolderCard;