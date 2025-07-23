// File: src/components/Sidebar.jsx
import React from 'react'
import { assets } from '../assets/assets';
import Logo from './Logo';

function Sidebar() {
  return (
    <aside className="w-60 bg-gray-100 p-4 h-screen">
      <Logo/> 
      <button className="btn w-full mb-4 bg-zinc-800 text-white font-semibold p-1 mt-[30%] rounded-md cursor:pointer hover:bg-zinc-500">Upload</button>
      <ul>
        <li className='bg-blue-200 px-2 py-1 my-2 rounded-md font-semibold text-center'>All Files</li>
        <li className='bg-gray-200 px-2 py-1 my-2 rounded-md font-semibold text-center'>Shared</li>
      </ul>
    </aside>
  );
}

export default Sidebar;


