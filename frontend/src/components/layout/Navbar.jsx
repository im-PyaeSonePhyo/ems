import React from "react";
import { useAuth } from "../../context/authContext";
import { LogOut } from "lucide-react";
import { observer } from "mobx-react-lite";

const Navbar = observer(({ title }) => {
  const auth = useAuth();

  const handleLogout = () => {
    auth.logout();
  };

  return (
    <header className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg border-b border-gray-700">
      <div className="max-w-8xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-100 truncate">
          {title}
        </h1>
        <button
          className="flex items-center text-red-600 hover:text-red-700 text-sm sm:text-base cursor-pointer"
          onClick={handleLogout}
        >
          Logout <LogOut size={18} className="ml-2 sm:ml-3" />
        </button>
      </div>
    </header>
  );
});

export default Navbar;
