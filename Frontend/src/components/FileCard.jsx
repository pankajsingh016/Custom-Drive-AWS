// src/components/FileCard.jsx
import React from "react";
import { FileText, CloudDownload } from "lucide-react";
import { deleteItem, getDownloadUrl, getViewFile } from "../services/api";

function FileCard({ file,updateContent, onDelete }) { 
  const handleDownload = async () => {

    try{

      const response = await getDownloadUrl(file.id);
      // console.log(response.data.data.url);
      window.open(response.data.data.url,"_blank");

    } catch(error){
      console.log("Error initiating download",error);
      alert("Failed to download file. Please try again.");
    }
    // window.open(file.url, "_blank");
  };

  const handleDelete = async ()=>{
   if(onDelete) {
    onDelete();
   }
  };

  const handleView = async ()=>{
    try{
      const response = await getViewFile(file.id);
      const {url, filename} = response.data.data;
      console.log(response.data.data.url);
      console.log(url);
      window.open(url,"_blank");
      console.log(`Successfully initiated view for ${filename}`);
    } catch(err){
      console.error("Error initiating view:",err);
      alert("Failed to view file. Please try again");
    }
  }

  return (
    <div className="p-4 border rounded-xl shadow-md bg-white flex flex-col justify-between">
      <div className="flex flex-col justify-around space-x-3 truncate">
        <FileText className="text-blue-600" />
        <div className="text-lg font-semibold truncate">{file.filename}</div>
        <div>{new Date(file.uploadedAt).toLocaleString('en-GB',{day:'2-digit', month:'short',year:'numeric', hour:'2-digit',minute:'2-digit'})}</div>
      </div>
      <div className=" flex justify-end gap-4">
        <button
        onClick={handleView} 
        className="mt-4 bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-700"
        >
          View
        </button>
        <button
          onClick={handleDownload}
          className="mt-4 bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-700"
        >
          <CloudDownload className="inline-block w-4 h-4 mr-1" />
          Download
        </button>
        <button onClick={handleDelete} className="bg-red-400  hover:bg-red-600 text-white font-semibold px-3 py-1 mt-4 rounded-md">
          Delete
        </button>
      </div>
    </div>
  );
}

export default FileCard;
