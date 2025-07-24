import React, { useRef, useState } from "react";
import { uploadFile, uploadFolder } from "../services/api";
import { useNavigate } from "react-router-dom";

function UploadModal({ type, onClose }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (type === "folder") {
      setFile([...e.target.files]); // for folder
    } else {
      setFile(e.target.files[0]); // for single file
    }
  };

  const handleUpload = async () => {
    if (!file || (Array.isArray(file) && file.length === 0)) return;

    const formData = new FormData();
    if (type === "folder") {
      file.forEach((f) => formData.append("files", f, f.webkitRelativePath));
    } else {
      formData.append("file", file);
    }

    try {
      setUploading(true);
      setMessage("");
      if (type === "file") {
        console.log('request for file gone');
        await uploadFile(formData);
      }

      if (type === "folder") {
        console.log('request for folder gone');
        await uploadFolder(formData);
      }

      setMessage("✅ Upload successful!");

      setTimeout(onClose, 1000);
      
      navigate("/files");
      // brief success delay
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-80">
        <h2 className="text-lg font-bold mb-4 text-center">
          {type === "folder" ? "Upload Folder" : "Upload File"}
        </h2>

        {/* Hidden file input */}
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          multiple={type === "folder"}
          {...(type === "folder"
            ? { webkitdirectory: "true", directory: "" }
            : {})}
          className="hidden"
        />

        {/* Styled label */}
        <button
          onClick={() => inputRef.current.click()}
          className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-700 w-full p-2 rounded text-sm"
        >
          {type === "folder"
            ? "📁 Select Folder to Upload"
            : "📄 Select File to Upload"}
        </button>

        {/* Upload button */}
        <button
          className="btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
          disabled={uploading}
          onClick={handleUpload}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

        {/* Message */}
        {message && <p className="mt-2 text-center text-sm">{message}</p>}

        {/* Cancel */}
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
