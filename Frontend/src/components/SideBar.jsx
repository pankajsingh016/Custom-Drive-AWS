// src/components/Sidebar.jsx
import React, { useState } from "react";
import Logo from "./Logo";
import UploadModal from "./UploadModal";
import { useNavigate } from "react-router-dom";

function Sidebar({ updateContent, currentFolderId }) {
  const [uploadType, setUploadType] = useState(null); // "file", "folder_create", or "folder_upload"
  const navigate = useNavigate();
  const openUploadModal = (type) => setUploadType(type);
  const closeUploadModal = () => setUploadType(null);

  const handleHome = () => {
    navigate("/files");
  };

  return (
    <aside className="w-60 bg-gray-100 p-4 h-screen">
      <Logo />
      <div className="relative group mt-[30%]">
        <button className="btn w-full cursor-pointer bg-zinc-800 text-white font-semibold p-1 rounded-md cursor:pointer hover:bg-zinc-500">
          New
        </button>

        <div className="absolute  hidden group-hover:flex flex-col bg-white border p-2 mt-0 shadow-md z-10">
          <button
            onClick={() => openUploadModal("file")}
            className="hover:bg-gray-200 p-1 rounded text-left cursor-pointer"
          >
            📄 Upload File
          </button>
          <button
            onClick={() => openUploadModal("folder_create")}
            className="hover:bg-gray-200 p-1 rounded text-left cursor-pointer"
          >
            📁 Create Folder
          </button>
          {/* New: Placeholder for 'Upload Folder' */}
          <button
            onClick={() => openUploadModal("folder_upload")}
            className="hover:bg-gray-200 p-1 rounded text-left cursor-pointer"
          >
            📂 Upload Folder (Advanced)
          </button>
        </div>
      </div>

      {uploadType && (
        <UploadModal
          type={uploadType}
          onClose={closeUploadModal}
          updateContent={updateContent}
          currentFolderId={currentFolderId}
        />
      )}

      {/* Nav Links */}
      <button
        onClick={handleHome}
        className="bg-blue-200 cursor-pointer hover:bg-blue-400 w-full px-2 py-1 my-2 rounded-md font-semibold text-center"
      >
        Home
      </button>
      {/* <button className="bg-gray-400 cursor-pointer w-full px-2 py-1 my-2 rounded-md font-semibold text-center">
        Shared
      </button> */}
    </aside>
  );
}

export default Sidebar;
