import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  LogOut,
  User,
  Moon,
  Sun,
  Settings,
  Menu,
} from "lucide-react";

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userid");
    window.location.href = "/login";
  };

  return (
    <header className="h-20 bg-white border-b border-border sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between shadow-sm shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="p-2 lg:hidden text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden md:flex items-center flex-1 max-w-xl">
          <h2 className="text-md font-bold text-gray-900 uppercase">
            Tradizions
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <button
          onClick={handleLogout}
          title="Logout Session"
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-all flex items-center gap-1.5 text-sm font-semibold cursor-pointer border border-transparent"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span className="hidden md:inline">Logout</span>
        </button>

        <div className="h-8 w-[1px] bg-border"></div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 leading-tight">
              Super Admin
            </p>
            <p className="text-xs text-gray-500">System Manager</p>
          </div>
          <div className="group relative">
            <button className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-md hover:ring-4 hover:ring-primary/10 transition-all">
              S
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

