// src/pages/Dashboard.jsx
import React, { useEffect, useState, useRef } from "react"; // <-- Import useRef
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";
import FileCard from "../components/FileCard";
import FolderCard from "../components/FolderCard";
import { deleteItem, fetchFiles } from "../services/api";
import { MoveLeft } from "lucide-react";
import { Folder } from 'lucide-react';

function Dashboard() {
  const { folderId: urlFolderId } = useParams();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolderName, setCurrentFolderName] = useState("Root"); // Default to 'Root'
  const [currentFolderId, setCurrentFolderId] = useState(null);

  // folderStack will store objects { id, name }
  const [folderStack, setFolderStack] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- NEW: Ref to track if navigation was initiated internally ---
  const isInternalNavigation = useRef(false);
  // -------------------------------------------------------------

  const loadData = async (fId = null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFiles(fId);
      console.log("API Response Data:", res.data.data);

      if (res.data && res.data.data) {
        setFiles(res.data.data.files || []);
        setFolders(res.data.data.folders || []);

        // --- Use the folder name from the API response (single source of truth) ---
        setCurrentFolderName(res.data.data.currentFolderName || (fId === null ? "Root" : "Folder"));
      } else {
        console.warn("Unexpected API response structure:", res.data);
        setFiles([]);
        setFolders([]);
        setCurrentFolderName("Unknown Folder"); // Fallback for unexpected response
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError(error.response?.data?.message || "Failed to load data.");
      setFiles([]);
      setFolders([]);
      setCurrentFolderName("Error Loading Folder"); // Indicate an issue
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId, itemType) => {
    // --- MODIFIED: Confirm message based on itemType ---
    let confirmMessage = `Are you sure you want to delete this ${itemType}?`;
    if (itemType === 'folder') {
      confirmMessage = `Are you sure you want to delete this folder and ALL its contents (sub-folders and files)? This action cannot be undone.`;
    }
    // -------------------------------------------------
    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    try {
      await deleteItem(itemType, itemId);
      await loadData(currentFolderId); // Reload content of the current folder
    } catch (err) {
      console.error("Error deleting item:", err);
      setError(err.response?.data?.message || `Failed to delete ${itemType}.`);
    } finally {
      setLoading(false);
    }
  };

  // --- MODIFIED: Main useEffect to handle folderStack synchronization ---
  useEffect(() => {
    const effectiveFolderId = urlFolderId || null;

    // If we're navigating to the root (effectiveFolderId is null)
    // OR if this navigation was NOT triggered by our internal openFolder/goBack,
    // then reset the folderStack. This handles direct URL access, browser history,
    // and clicks on a "Home" button in the header that just navigates to /files.
    if (effectiveFolderId === null || !isInternalNavigation.current) {
      setFolderStack([]);
    }

    // Reset the flag for the next navigation event
    isInternalNavigation.current = false;

    setCurrentFolderId(effectiveFolderId);
    loadData(effectiveFolderId);
  }, [urlFolderId]); // Depend only on urlFolderId to trigger data load and stack sync

  // --- MODIFIED: openFolder to push to stack and set internal flag ---
  const openFolder = (folderId, folderName) => {
    isInternalNavigation.current = true; // Mark as internal navigation

    // Push the *current* folder's ID and Name onto the stack before navigating away
    // This is the parent folder we are coming from.
    // Ensure we don't push the "Root" if it's already the only thing on the stack OR
    // if we are already at the new folder (e.g. clicking the same folder twice, though usually onOpen prevents this)
    if (currentFolderId !== folderId) { // Prevent pushing the same folder if re-opening
        setFolderStack((prevStack) => [
            ...prevStack,
            { id: currentFolderId, name: currentFolderName }, // Push current context (ID and Name)
        ]);
    }

    // DO NOT set currentFolderName here. Let loadData handle it after the API response
    // to ensure consistency with actual folder name from backend.
    navigate(`/files/${folderId}`);
  };

  // --- MODIFIED: goBack to pop from stack and set internal flag ---
  const goBack = () => {
    isInternalNavigation.current = true; // Mark as internal navigation

    const prevStack = [...folderStack];
    const lastVisitedFolder = prevStack.pop(); // Get the last folder from the stack
    setFolderStack(prevStack); // Update the stack

    if (lastVisitedFolder) {
      // DO NOT set currentFolderName here. Let loadData handle it after the API response.
      if (lastVisitedFolder.id === null) {
        navigate("/files"); // Navigate to root
      } else {
        navigate(`/files/${lastVisitedFolder.id}`); // Navigate to specific folder
      }
    } else {
      // This case means the stack is empty (e.g., already at root and tried to go back)
      // DO NOT set currentFolderName here.
      navigate("/files");
    }
  };

  // The Backspace useEffect dependency array is already correct: [folderStack, goBack]
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === "Backspace" &&
        !(
          event.target.tagName === "INPUT" ||
          event.target.tagName === "TEXTAREA" ||
          event.target.isContentEditable
        )
      ) {
        event.preventDefault();
        // Only go back if there's history in the stack OR if we're in a subfolder and stack is empty (direct link)
        // The condition `folderStack.length > 0` is now robust because folderStack is cleared for non-internal nav to root.
        if (folderStack.length > 0) {
          goBack();
        } else if (currentFolderId !== null) { // If at a subfolder (via direct link) and stack is empty, go to root
             goBack(); // This will navigate to "/files" as stack is empty
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [folderStack, goBack, currentFolderId]); // Added currentFolderId to dependencies for Backspace logic

  return (
    <div className="flex">
      <Sidebar updateContent={loadData} currentFolderId={currentFolderId} />
      <div className="flex-1">
        <Header /> {/* Ensure Header's "Home" button calls navigate('/files') */}
        <div className="p-4 flex justify-between items-center">
          {/* Display current folder name from state */}
          <h2 className="text-xl font-semibold flex gap-2">
            <Folder />
            {currentFolderName}
          </h2>
          {/* Show back button if there's history in the stack */}
          {folderStack.length > 0 && ( // This condition should now correctly hide the button at root
            <button
              className="flex gap-2 font-bold bg-gray-200 px-4 py-2 rounded-2xl border-2 hover:bg-gray-400 hover:text-white hover:scale-3d"
              onClick={goBack}
            >
              <MoveLeft /> Back
            </button>
          )}
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? (
            <p className="col-span-full text-center text-gray-500">
              Loading...
            </p>
          ) : error ? (
            <p className="col-span-full text-center text-red-500">
              Error: {error}
            </p>
          ) : folders.length === 0 && files.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">
              This folder is empty.
            </p>
          ) : (
            <>
              {folders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  onOpen={() => openFolder(folder.id, folder.name)}
                  updateContent={loadData} // Consider if this is still needed, as openFolder triggers loadData via useEffect
                  onDelete={() => handleDeleteItem(folder.id, "folder")}
                />
              ))}
              {files.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  updateContent={loadData} // Consider if this is still needed, as onDelete triggers loadData
                  onDelete={() => handleDeleteItem(file.id, "file")}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;