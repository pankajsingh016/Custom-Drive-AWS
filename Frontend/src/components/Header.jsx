import Logout from "../pages/Logout";

// src/components/Header.jsx
const Header = () => {
  return (
    <header className="p-4 bg-white shadow-md flex justify-between">
      <div className="flex justify-between w-full">
        <div className="px-4 py-2">
          <h1 className="text-xl font-bold text-gray-700">
            DataMonk Cloud Drive
          </h1>
        </div>
          <Logout />
        </div>
    </header>
  );
};

export default Header; // ✅ Default export
