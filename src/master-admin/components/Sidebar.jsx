import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Users,
  Layers,
  ShoppingBag,
  ClipboardList,
  Gift,
  BarChart3,
  Settings,
  ChevronRight,
  ChevronDown,
  Activity,
  Star,
  PhoneCall,
  BookOpen,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import AppLogo from "../../assets/app-logo.png";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  {
    icon: Store,
    label: "Merchants",
    path: "/merchants",
    subItems: [
      { icon: Activity, label: "Master Merchant", path: "/merchants/master" },
      { icon: Star, label: "Product Reviews", path: "/merchants/reviews" },
    ],
  },
  {
    icon: Layers,
    label: "Categories",
    path: "/categories",
    subItems: [
      { icon: Layers, label: "Categories", path: "/categories" },
      {
        icon: Layers,
        label: "Subcategories",
        path: "/categories/subcategories",
      },
    ],
  },
  { icon: Users, label: "Users", path: "/users" },
  { icon: ClipboardList, label: "Orders", path: "/orders" },
  { icon: Star, label: "Reviews", path: "/reviews" },
  { icon: BookOpen, label: "Thinam Oru Kural", path: "/kural" },
  { icon: Activity, label: "Health Goals", path: "/health-goals" },
  { icon: Gift, label: "Seasonal Banners", path: "/banners/seasonal" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
  { icon: PhoneCall, label: "Contacts", path: "/contacts" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const SidebarItem = ({ item, onClose }) => {
  const location = useLocation();

  const hasSubItems = item.subItems && item.subItems.length > 0;

  // Check if any sub-item is currently active
  const isSubActive =
    hasSubItems &&
    item.subItems.some(
      (sub) =>
        location.pathname === sub.path ||
        location.pathname.startsWith(`${sub.path}/`),
    );

  const isMainActive =
    location.pathname === item.path ||
    (location.pathname.startsWith(`${item.path}/`) && !hasSubItems) ||
    isSubActive;

  const [isOpen, setIsOpen] = useState(isSubActive);

  // Sync open state when route changes to an active sub-item
  React.useEffect(() => {
    if (isSubActive) {
      setIsOpen(true);
    }
  }, [location.pathname, isSubActive]);

  // Toggle submenu if it has subitems
  const handleToggle = (e) => {
    if (hasSubItems) {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else {
      onClose && onClose();
    }
  };

  return (
    <div className="space-y-1">
      <NavLink
        to={item.path}
        onClick={handleToggle}
        className={cn(
          "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
          isMainActive
            ? "bg-white/10 text-white shadow-sm"
            : "hover:bg-white/5 text-white/70 hover:text-white",
        )}
      >
        {isMainActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-md" />
        )}

        <div className="flex items-center gap-3 relative z-10">
          <item.icon
            className={cn(
              "w-5 h-5 transition-colors duration-300",
              isMainActive
                ? "text-accent"
                : "text-white/50 group-hover:text-white",
            )}
          />
          <span className="font-medium text-sm tracking-wide">
            {item.label}
          </span>
        </div>
        {hasSubItems ? (
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-300",
              isOpen
                ? "rotate-180 text-white"
                : "text-white/50 group-hover:text-white",
            )}
          />
        ) : (
          <ChevronRight
            className={cn(
              "w-4 h-4 transition-all duration-300 opacity-0 group-hover:opacity-100 text-white/50 group-hover:text-white",
              "group-hover:translate-x-1",
            )}
          />
        )}
      </NavLink>

      {hasSubItems && isOpen && (
        <div className="ml-4 pl-4 border-l border-white/10 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-300">
          {item.subItems.map((sub) => {
            const isSubActive =
              location.pathname === sub.path ||
              location.pathname.startsWith(`${sub.path}/`);
            return (
              <NavLink
                key={sub.path}
                to={sub.path}
                onClick={() => onClose && onClose()}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isSubActive
                    ? "bg-white/10 text-white translate-x-1"
                    : "text-white/60 hover:text-white hover:bg-white/5 hover:translate-x-1",
                )}
              >
                <sub.icon
                  className={cn(
                    "w-4 h-4 transition-colors duration-300",
                    isSubActive ? "text-accent" : "text-white/40",
                  )}
                />
                {sub.label}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ onClose }) => {
  return (
    <div className="w-64 bg-gradient-to-b from-primary to-primary-dark text-white h-screen flex flex-col shadow-2xl border-r border-white/5 relative z-50">
      <div className="p-2 h-25 flex items-center gap-4 border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-primary to-primary-dark">
        <img
          src={AppLogo}
          alt="app-logo"
          height={40}
          className="p-5"
        />
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
        {menuItems.map((item, index) => (
          <SidebarItem key={index} item={item} onClose={onClose} />
        ))}
      </nav>

      <div className="p-6 border-t border-white/10 mt-auto bg-black/10 backdrop-blur-sm">
        <div className="group flex items-center gap-3 cursor-pointer p-2 -m-2 rounded-xl transition-colors hover:bg-white/5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center text-accent font-bold ring-1 ring-accent/20 group-hover:ring-accent/50 transition-all">
            AD
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate text-white/90 group-hover:text-white transition-colors">
              Admin User
            </p>
            <p className="text-[11px] text-white/50 truncate group-hover:text-white/70 transition-colors">
              admin@tradizions.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
