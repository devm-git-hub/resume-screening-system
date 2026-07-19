import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, LogOut, Menu } from "lucide-react";
import { toggleTheme, toggleSidebar } from "../redux/slices/uiSlice";
import { logout } from "../redux/slices/authSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
      <button className="lg:hidden p-2" onClick={() => dispatch(toggleSidebar())}>
        <Menu size={20} />
      </button>

      <h1 className="font-semibold text-lg hidden md:block">AI Resume Screening & Job Matching</h1>

      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Toggle dark mode"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {user && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-semibold">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm hidden sm:block">{user.name}</span>
          </div>
        )}

        <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
