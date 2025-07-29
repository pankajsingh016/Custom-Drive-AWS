// src/components/UploadModal.jsx
import React, { useRef, useState } from "react";
// Import the new uploadFolderContents API call
import {
  uploadFile,
  createFolder,
  uploadFolderContents,
} from "../services/api";

function UploadModal({ type, updateContent, onClose, currentFolderId }) {
  const [selectedFileOrFiles, setSelectedFileOrFiles] = useState(null);
  const inputRef = useRef();
  const [folderName, setFolderName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0); // For progress bar

  const handleFileChange = (e) => {
    // For 'folder_upload' type, collect all files, preserving structure
    if (type === "folder_upload") {
      // webkitdirectory gives a FileList. We convert to array.
      const files = [...e.target.files];
      console.log("Selected files for folder upload:", files); // <--- Add this
      files.forEach((f) => {
        console.log(
          `File Name: ${f.name}, Webkit Relative Path: ${f.webkitRelativePath}`
        ); // <--- And this
      });
      setSelectedFileOrFiles([...e.target.files]);
    } else {
      // For 'file' type
      setSelectedFileOrFiles(e.target.files[0]);
    }
  };

  const handleUploadOrCreation = async () => {
    setMessage("");
    setError(null);
    setUploading(true);
    setUploadProgress(0); // Reset progress

    try {
      if (type === "file") {
        if (!selectedFileOrFiles) {
          setError("Please select a file to upload.");
          setUploading(false); // Stop loading if validation fails
          return;
        }
        const formData = new FormData();
        formData.append("file", selectedFileOrFiles);
        if (currentFolderId) {
          formData.append("folderId", currentFolderId); // Pass folderId for single file upload
        }
        console.log("Request for single file upload initiated.");
        await uploadFile(formData, (progressEvent) => {
          // Pass progress callback
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        });
        setMessage("✅ File uploaded successfully!");
      } else if (type === "folder_upload") {
        if (!selectedFileOrFiles || selectedFileOrFiles.length === 0) {
          setError("Please select a folder to upload its contents.");
          setUploading(false);
          return;
        }
        const formData = new FormData();

        // Iterate over each selected file
        selectedFileOrFiles.forEach((f, index) => {
          // Append the file itself
          formData.append("files", f);

          // Explicitly append its webkitRelativePath
          // Use a unique key for each path, e.g., 'relativePath_0', 'relativePath_1', etc.
          formData.append(`relativePath_${index}`, f.webkitRelativePath || ""); // Fallback to empty string if somehow missing
        });

        if (currentFolderId) {
          formData.append("currentFolderId", currentFolderId);
        }

        console.log("Request for folder content upload initiated.");

        await uploadFolderContents(formData, (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        });
        setMessage("✅ Folder contents uploaded successfully!");
      } else if (type === "folder_create") {
        if (!folderName.trim()) {
          setError("Folder name cannot be empty.");
          setUploading(false);
          return;
        }
        console.log("Request for folder creation initiated.");
        await createFolder(folderName.trim(), currentFolderId);
        setMessage("✅ Folder created successfully!");
        setFolderName("");
      }

      // Common success actions
      setTimeout(() => updateContent(currentFolderId), 500);
      setTimeout(onClose, 1000);
    } catch (err) {
      console.error(
        "Upload/Creation error:",
        err.response ? err.response.data : err.message
      );
      setError(
        err.response?.data?.message || "❌ Operation failed. Please try again."
      );
    } finally {
      setUploading(false);
      setUploadProgress(0); // Reset progress on completion/error
    }
  };

  const renderContent = () => {
    if (type === "folder_create") {
      return (
        <>
          <h2 className="text-lg font-bold mb-4 text-center">
            Create New Folder
          </h2>
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
    } else {
      // Handles "file" and "folder_upload"
      return (
        <>
          <h2 className="text-lg font-bold mb-4 text-center">
            {type === "folder_upload"
              ? "Upload Folder Contents"
              : "Upload File"}
          </h2>

          <input
            type="file"
            ref={inputRef}
            onChange={handleFileChange}
            multiple={type === "folder_upload"} // Allow multiple files for folder upload
            {...(type === "folder_upload"
              ? { webkitdirectory: "true", directory: "" } // Crucial for folder selection
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

          {uploading &&
            uploadProgress > 0 && ( // Show progress bar
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-4">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button
            className="btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
            disabled={
              uploading ||
              !selectedFileOrFiles ||
              (Array.isArray(selectedFileOrFiles) &&
                selectedFileOrFiles.length === 0)
            }
            onClick={handleUploadOrCreation}
          >
            {uploading ? `Uploading (${uploadProgress}%)` : "Upload"}
          </button>
        </>
      );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-80">
        {renderContent()}

        {message && (
          <p className="mt-4 text-center text-sm text-green-600">{message}</p>
        )}

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
