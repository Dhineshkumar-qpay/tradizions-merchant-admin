import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, Navigate } from "react-router-dom";
import {
  LogOut,
  User,
  Search,
  Bell,
  ChevronDown,
  ChevronLeft,
  X,
  List
} from "lucide-react";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";
import "./Layout.css";

const Layout = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [menus, setMenus] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await API.post(APIROUTES.MENUPAGES);
        if (res.data && res.data.statusCode === 200 && res.data.data) {
          setMenus(res.data.data.assignedmenus || []);
        }
      } catch (err) {
        console.error("Failed to fetch menus", err);
      }
    };

    const fetchProfile = async () => {
      try {
        const res = await API.post(APIROUTES.GETPROFILE);
        if (res.data && res.data.statusCode === 200 && res.data.data) {
          setProfile(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };

    fetchMenus();
    fetchProfile();
  }, []);

  const toggleMenu = (menuName) => {
    if (isSidebarCollapsed) setIsSidebarCollapsed(false);
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Helper function to format paths correctly
  const formatPath = (key) => key.startsWith('/') ? key : `/${key}`;

  return (
    <div
      className={`admin-container ${showMobileMenu ? "mobile-menu-active" : ""} ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >
      {/* Mobile Overlay */}
      {showMobileMenu && (
        <div
          className="mobile-overlay"
          onClick={() => setShowMobileMenu(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${showMobileMenu ? "show" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-content">
            <img src="src/assets/t-logo.png" alt="t-logo" height={40} width={40} />
            {!isSidebarCollapsed && <span>Tradizions Admin</span>}
          </div>
          <button
            className="sidebar-toggle-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            <ChevronLeft size={18} className="toggle-icon" />
          </button>
          <button
            className="mobile-close"
            onClick={() => setShowMobileMenu(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-menu-wrapper">
          <nav className="sidebar-nav">
            <div className="nav-group">
              <span className="group-label">Main Menu</span>
              {menus.map((menu) => (
                <React.Fragment key={menu.menuid}>
                  {menu.children && menu.children.length > 0 ? (
                    <div
                      className={`nav-link-dropdown ${expandedMenu === menu.menukey ? "expanded" : ""}`}
                    >
                      <div
                        className="nav-link parent"
                        onClick={() => toggleMenu(menu.menukey)}
                      >
                        <img src={menu.icon} alt={menu.menuname} style={{ width: 20, height: 20, objectFit: 'contain' }} />
                        {!isSidebarCollapsed && <span>{menu.menuname}</span>}
                        {!isSidebarCollapsed && (
                          <ChevronDown size={16} className="chevron-icon" />
                        )}
                      </div>
                      {!isSidebarCollapsed && (
                        <div className="dropdown-items">
                          {menu.children.map((child) => (
                            <NavLink
                              key={child.menuid}
                              to={formatPath(child.menukey)}
                              className={({ isActive }) =>
                                isActive ? "sub-link active" : "sub-link"
                              }
                            >
                              <img src={child.icon} alt={child.menuname} style={{ width: 16, height: 16, objectFit: 'contain' }} />
                              <span>{child.menuname}</span>
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <NavLink
                      to={formatPath(menu.menukey)}
                      className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      }
                    >
                      <img src={menu.icon} alt={menu.menuname} style={{ width: 20, height: 20, objectFit: 'contain' }} />
                      {!isSidebarCollapsed && <span>{menu.menuname}</span>}
                    </NavLink>
                  )}
                </React.Fragment>
              ))}
              <NavLink
                to="/coupons"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <span style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20 }}>🏷️</span>
                {!isSidebarCollapsed && <span>Coupons</span>}
              </NavLink>
            </div>
          </nav>
        </div>

        <div className="sidebar-footer">
          <button
            className="nav-link logout-btn"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogOut size={20} />
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal-content animate-pop">
            <div className="modal-icon-box logout">
              <LogOut size={32} />
            </div>
            <h3>Sign Out?</h3>
            <p>Are you sure you want to log out of the Tradizions Admin Panel?</p>
            <div className="modal-btn-group">
              <button
                className="btn-ghost"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button className="btn-solid-primary" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-header">
          <div className="header-left">
            <button
              className="hamburger"
              onClick={() => setShowMobileMenu(true)}
            >
              <List size={22} />
            </button>
            <h3>Tradizions Admin</h3>
          </div>

          <div className="header-actions">
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{profile?.username || "Admin User"}</span>
                <span className="user-role">{profile?.phone || "Super Admin"}</span>
              </div>
              <div className="user-avatar">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
