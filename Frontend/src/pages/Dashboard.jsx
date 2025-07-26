// File: src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // <-- Import these hooks
import Sidebar from "../components/SideBar";
import Header from "../components/Header";
import FileCard from "../components/FileCard";
import FolderCard from "../components/FolderCard";
import { fetchFiles } from "../services/api";


function Dashboard() {
  const { folderId: urlFolderId } = useParams(); // <-- Read folderId from URL
  const navigate = useNavigate(); // <-- Hook to programmatically navigate

  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  // currentFolderId will now primarily be derived from urlFolderId
  // No longer need a separate currentFolderId state if it perfectly mirrors the URL param
  // but we keep it for consistency with your existing loadData parameter
  const [currentFolderId, setCurrentFolderId] = useState(null); // Keep this state for loadData argument

  const [folderStack, setFolderStack] = useState([]); // Still useful for "Back" button logic

  const loadData = async (fId = null) => { // Renamed parameter to fId to avoid confusion with component state
    console.log("LOADDATA is called for folderId:", fId);
    try {
      const res = await fetchFiles(fId); // Pass the effective folder ID to the API call
      console.log("API Response Data:", res.data.data); // Inspect the response structure

      if (res.data && res.data.data) {
        setFiles(res.data.data.files || []); // Use empty array if null/undefined
        setFolders(res.data.data.folders || []); // Use empty array if null/undefined
      } else {
        console.warn("Unexpected API response structure:", res.data);
        setFiles([]);
        setFolders([]);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // You might want to set an error state here to display to the user
      setFiles([]);
      setFolders([]);
    }
  };

  useEffect(() => {
    // Determine the effective folder ID from the URL.
    // urlFolderId will be undefined for /files, or the actual ID for /files/:folderId
    const effectiveFolderId = urlFolderId || null;
    setCurrentFolderId(effectiveFolderId); // Update internal state to reflect URL
    loadData(effectiveFolderId); // Load data based on URL parameter
  }, [urlFolderId]); // Re-run effect when the URL folderId changes

   const openFolder = (folderId) => {
    // ... (your existing folderStack logic)
    navigate(`/files/${folderId}`); // <-- ENSURE THIS IS "/files/" NOT "/dashboard/"
  };

  const goBack = () => {
    const prevStack = [...folderStack];
    const parentId = prevStack.pop();
    setFolderStack(prevStack);

    if (parentId) {
      navigate(`/files/${parentId}`); // <-- ENSURE THIS IS "/files/" NOT "/dashboard/"
    } else {
      navigate('/files'); // <-- ENSURE THIS IS "/files/" NOT "/dashboard"
    }
  };
  return (
    <div className="flex">
      <Sidebar updateContent={loadData} currentFolderId={currentFolderId} />
      <div className="flex-1">
        <Header />
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {currentFolderId ? `folder name` : 'Dashboard'}
          </h2>
          {folderStack.length > 0 && ( // Show back button if there's history in the stack
            <button
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
              onClick={goBack}
            >
              ⬅️ Back
            </button>
          )}
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {folders.length === 0 && files.length === 0 && (
            <p className="col-span-full text-center text-gray-500">
              This folder is empty.
            </p>
          )}
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onOpen={() => openFolder(folder.id)}
              updateContent={loadData}
            />
          ))}
          {files.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              updateContent={loadData}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;