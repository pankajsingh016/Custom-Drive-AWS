import React, { useState } from 'react';
import Logo from './Logo';
import UploadModal from './UploadModal';

function Sidebar() {
  const [uploadType, setUploadType] = useState(null); // "file" or "folder"

  const openUploadModal = (type) => setUploadType(type);
  const closeUploadModal = () => setUploadType(null);

  return (
    <aside className="w-60 bg-gray-100 p-4 h-screen">
      <Logo />
      <div className="relative group mt-[30%]">
        <button className="btn w-full bg-zinc-800 text-white font-semibold p-1 rounded-md cursor:pointer hover:bg-zinc-500">
          Upload
        </button>

        <div className="absolute hidden group-hover:flex flex-col bg-white border p-2 mt-1 shadow-md z-10">
          <button onClick={() => openUploadModal('file')} className="hover:bg-gray-200 p-1 rounded text-left">📄 Upload File</button>
          <button onClick={() => openUploadModal('folder')} className="hover:bg-gray-200 p-1 rounded text-left">📁 Upload Folder</button>
        </div>
      </div>

      {uploadType && (
        <UploadModal type={uploadType} onClose={closeUploadModal} />
      )}

      {/* Nav Links */}
      <ul className="mt-6">
        <li className="bg-blue-200 px-2 py-1 my-2 rounded-md font-semibold text-center">All Files</li>
        <li className="bg-gray-200 px-2 py-1 my-2 rounded-md font-semibold text-center">Shared</li>
      </ul>
    </aside>
  );
}

export default Sidebar;
