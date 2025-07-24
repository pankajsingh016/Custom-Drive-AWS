// File: src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/SideBar';
import Header from '../components/Header';
import FileCard from '../components/FileCard';
import FolderCard from '../components/FolderCard';
import { fetchFiles } from '../services/api';

function Dashboard() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderStack, setFolderStack] = useState([]);

  const loadData = async (folderId = null) => {
    const res = await fetchFiles();
    console.log(res.data);
    setFiles(res.data.data.files);
    console.log(files);
    setFolders(res.data.data.folders);
  };

  useEffect(() => {
    loadData(currentFolderId);
  }, [currentFolderId]);

  const openFolder = (folderId) => {
    setFolderStack((prev) => [...prev, currentFolderId]);
    setCurrentFolderId(folderId);
  };

  const goBack = () => {
    const prevStack = [...folderStack];
    const parentId = prevStack.pop();
    setFolderStack(prevStack);
    setCurrentFolderId(parentId || null);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Dashboard</h2>
          {folderStack.length > 0 && (
            <button
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
              onClick={goBack}
            >
              ⬅️ Back
            </button>
          )}
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {folders.map((folder) => (
            <FolderCard key={folder.id} folder={folder} onOpen={() => openFolder(folder.id)} />
          ))}
          {files.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
