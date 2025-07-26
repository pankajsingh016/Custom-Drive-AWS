import React, { useRef, useState } from "react";
import { uploadFile, uploadFolder, createFolder } from "../services/api"; // <-- Import createFolder

function UploadModal({
  type, // Will be "file", "folder_create", or "folder_upload"
  updateContent,
  onClose,
  currentFolderId
}) {
  // State for file/folder upload (existing)
  const [selectedFileOrFiles, setSelectedFileOrFiles] = useState(null); // Renamed 'file' to clarify
  const inputRef = useRef();

  // State for folder creation
  const [folderName, setFolderName] = useState(""); // <-- New state for folder name

  // General states
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null); // <-- Added error state for better feedback

  const handleFileChange = (e) => {
    // For 'folder_upload' type, collect all files, preserving structure
    if (type === "folder_upload") {
      setSelectedFileOrFiles([...e.target.files]);
    } else { // For 'file' type
      setSelectedFileOrFiles(e.target.files[0]);
    }
  };

  const handleUploadOrCreation = async () => {
    setMessage(""); // Clear previous messages
    setError(null);  // Clear previous errors
    setUploading(true);

    try {
      if (type === "file") {
        if (!selectedFileOrFiles) {
          setError("Please select a file to upload.");
          return;
        }
        const formData = new FormData();
        formData.append("file", selectedFileOrFiles);
        if (currentFolderId) {
          formData.append("folderId", currentFolderId);
        }
        console.log("Request for file upload initiated.");
        await uploadFile(formData);
        setMessage("✅ File uploaded successfully!");

      } else if (type === "folder_upload") {
        if (!selectedFileOrFiles || selectedFileOrFiles.length === 0) {
          setError("Please select a folder to upload its contents.");
          return;
        }
        const formData = new FormData();
        selectedFileOrFiles.forEach((f) => formData.append("files", f, f.webkitRelativePath));
        if (currentFolderId) {
            formData.append('parentFolderId', currentFolderId); // Or whatever your backend expects for parent folder ID for uploaded contents
        }
        console.log("Request for folder content upload initiated.");
        await uploadFolder(formData); // Ensure your backend /uploadFolder handles multiple files and paths
        setMessage("✅ Folder contents uploaded successfully!");

      } else if (type === "folder_create") { // <-- Handle "Create Folder" logic
        if (!folderName.trim()) {
          setError("Folder name cannot be empty.");
          return;
        }
        console.log("Request for folder creation initiated.");
        // Call the new createFolder API
        const data = await createFolder(folderName.trim(), currentFolderId);
        console.log(data);
        setMessage("✅ Folder created successfully!");
        setFolderName(""); // Clear input
      }

      // Common success actions
      setTimeout(() => updateContent(currentFolderId), 500); // Refresh content
      setTimeout(onClose, 1000); // Close modal after a slight delay
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "❌ Operation failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // ----------------------------------------------------------------------
  // Render logic based on 'type' prop
  // ----------------------------------------------------------------------
  const renderContent = () => {
    if (type === "folder_create") {
      return (
        <>
          <h2 className="text-lg font-bold mb-4 text-center">Create New Folder</h2>
          <input
            type="text"
            placeholder="Enter folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="mb-4 p-2 border rounded-md w-full"
            disabled={uploading}
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button
            className="btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
            disabled={uploading || !folderName.trim()}
            onClick={handleUploadOrCreation}
          >
            {uploading ? "Creating..." : "Create Folder"}
          </button>
        </>
      );
    } else { // Handles "file" and "folder_upload"
      return (
        <>
          <h2 className="text-lg font-bold mb-4 text-center">
            {type === "folder_upload" ? "Upload Folder Contents" : "Upload File"}
          </h2>

          <input
            type="file"
            ref={inputRef}
            onChange={handleFileChange}
            multiple={type === "folder_upload"}
            {...(type === "folder_upload"
              ? { webkitdirectory: "true", directory: "" }
              : {})}
            className="hidden"
          />

          <button
            onClick={() => inputRef.current.click()}
            className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-700 w-full p-2 rounded text-sm"
          >
            {type === "folder_upload"
              ? "📁 Select Folder to Upload"
              : "📄 Select File to Upload"}
          </button>

          {selectedFileOrFiles && (
            <p className="mb-2 text-sm text-gray-700">
              Selected:{" "}
              {Array.isArray(selectedFileOrFiles)
                ? `${selectedFileOrFiles.length} files`
                : selectedFileOrFiles.name}
            </p>
          )}

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button
            className="btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
            disabled={uploading || (!selectedFileOrFiles || (Array.isArray(selectedFileOrFiles) && selectedFileOrFiles.length === 0))}
            onClick={handleUploadOrCreation}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </>
      );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-80">
        {renderContent()}

        {message && <p className="mt-4 text-center text-sm text-green-600">{message}</p>}

        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:underline mt-4 block mx-auto"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default UploadModal;