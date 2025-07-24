// src/components/FolderCard.jsx
import React from 'react';
import { Folder } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function FolderCard({ folder }) {
  const navigate = useNavigate();

  const openFolder = () => {
    navigate(`/dashboard/${folder.id}`);
  };

  return (
    <div
      className="p-4 border rounded-xl shadow-md bg-yellow-100 cursor-pointer hover:bg-yellow-200"
      onClick={openFolder}
    >
      <div className="flex items-center space-x-3">
        <Folder className="text-yellow-600" />
        <div className="text-lg font-semibold truncate">{folder.name}</div>
      </div>
    </div>
  );
}

export default FolderCard;
