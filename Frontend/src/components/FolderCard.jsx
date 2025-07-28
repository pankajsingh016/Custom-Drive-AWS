// src/components/FolderCard.jsx
import React from "react";
import { Folder, Trash2 } from "lucide-react"; // Make sure to import Trash2
import { useEffect } from "react";

// Accept onDelete prop
function FolderCard({ folder, onOpen, onDelete }) {
  // ... (existing handleOpen function) ...

  // console.log(folder.name);
  const handleDeleteClick = () => {
    // Just call the onDelete prop. Dashboard.jsx handles the confirmation and API call.
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div className="p-4 border rounded-xl shadow-md bg-white flex flex-col justify-between">
      <div className="flex items-center space-x-3">
        <Folder className="text-yellow-500" />
        
        <div className="text-lg font-semibold truncate">{folder.name}</div>

      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onOpen}
          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-700"
        >
          Open
        </button>
        {/* --- ADD DELETE BUTTON FOR FOLDER --- */}
        {onDelete && ( // Only render the button if an onDelete function is provided
          <button
            onClick={handleDeleteClick}
            className="bg-red-400 hover:bg-red-600 text-white font-semibold px-3 py-1 rounded-md"
          >
            <Trash2 className="inline-block w-4 h-4 mr-1" />
          </button>
        )}
        {/* ---------------------------------- */}
      </div>
    </div>
  );
}

export default FolderCard;