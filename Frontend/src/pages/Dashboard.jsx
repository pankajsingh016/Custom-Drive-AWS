// File: src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/SideBar';
import Header from '../components/Header';
import FileCard from '../components/FileCard';
import { fetchFiles } from '../services/api';

function Dashboard() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchFiles().then((res) => setFiles(res.data.data));
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => <FileCard key={file.id} file={file} />)}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;