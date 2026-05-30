import React from "react";
import { NavLink, Outlet, useNavigate, Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  Layers,
  Package,
  PlusCircle,
  List,
  LogOut,
  User,
  Search,
  Bell,
  Gift,
  ShoppingCart,
  TreePine,
  ChevronDown,
  ChevronLeft,
  X,
  Star,
  Mail,
  Globe,
  Receipt,
  Briefcase,
  Calendar,
  Book,
} from "lucide-react";
import "./Layout.css";

const Layout = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [expandedMenu, setExpandedMenu] = React.useState("products");
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const toggleMenu = (menuName) => {
    if (isSidebarCollapsed) setIsSidebarCollapsed(false);
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

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
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <LayoutDashboard size={20} />
                {!isSidebarCollapsed && <span>Dashboard</span>}
              </NavLink>
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <ShoppingCart size={20} />
                {!isSidebarCollapsed && <span>Orders</span>}
              </NavLink>
              <NavLink
                to="/monthly-orders"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <Calendar size={20} />
                {!isSidebarCollapsed && <span>Monthly Orders</span>}
              </NavLink>
            </div>

            <div className="nav-group">
              <span className="group-label">Catalog</span>
              <div
                className={`nav-link-dropdown ${expandedMenu === "categories" ? "expanded" : ""}`}
              >
                <div
                  className="nav-link parent"
                  onClick={() => toggleMenu("categories")}
                >
                  <Layers size={20} />
                  {!isSidebarCollapsed && <span>Categories</span>}
                  {!isSidebarCollapsed && (
                    <ChevronDown size={16} className="chevron-icon" />
                  )}
                </div>
                {!isSidebarCollapsed && (
                  <div className="dropdown-items">
                    <NavLink
                      to="/categories/add"
                      className={({ isActive }) =>
                        isActive ? "sub-link active" : "sub-link"
                      }
                    >
                      <PlusCircle size={16} />
                      <span>Add Category</span>
                    </NavLink>
                    <NavLink
                      to="/categories/list"
                      className={({ isActive }) =>
                        isActive ? "sub-link active" : "sub-link"
                      }
                    >
                      <List size={16} />
                      <span>List Categories</span>
                    </NavLink>
                    <NavLink
                      to="/subcategories"
                      className={({ isActive }) =>
                        isActive ? "sub-link active" : "sub-link"
                      }
                    >
                      <Layers size={16} />
                      <span>Subcategories</span>
                    </NavLink>
                  </div>
                )}
              </div>

              <div
                className={`nav-link-dropdown ${expandedMenu === "gifts" ? "expanded" : ""}`}
              >
                <div
                  className="nav-link parent"
                  onClick={() => toggleMenu("gifts")}
                >
                  <Gift size={20} />
                  {!isSidebarCollapsed && <span>Gift Products</span>}
                  {!isSidebarCollapsed && (
                    <ChevronDown size={16} className="chevron-icon" />
                  )}
                </div>
                {!isSidebarCollapsed && (
                  <div className="dropdown-items">
                    <NavLink
                      to="/gift-cards/add"
                      className={({ isActive }) =>
                        isActive ? "sub-link active" : "sub-link"
                      }
                    >
                      <PlusCircle size={16} />
                      <span>Add Gift Product</span>
                    </NavLink>
                    <NavLink
                      to="/gift-cards/card"
                      className={({ isActive }) =>
                        isActive ? "sub-link active" : "sub-link"
                      }
                    >
                      <PlusCircle size={16} />
                      <span>Add Gift Card</span>
                    </NavLink>
                    <NavLink
                      to="/gift-cards/list"
                      className={({ isActive }) =>
                        isActive ? "sub-link active" : "sub-link"
                      }
                    >
                      <List size={16} />
                      <span>List Gift Products</span>
                    </NavLink>
                  </div>
                )}
              </div>

              <div
                className={`nav-link-dropdown ${expandedMenu === "products" ? "expanded" : ""}`}
              >
                <div
                  className="nav-link parent"
                  onClick={() => toggleMenu("products")}
                >
                  <Package size={20} />
                  {!isSidebarCollapsed && <span>Products</span>}
                  {!isSidebarCollapsed && (
                    <ChevronDown size={16} className="chevron-icon" />
                  )}
                </div>
                {!isSidebarCollapsed && (
                  <div className="dropdown-items">
                    <NavLink
                      to="/products/add"
                      className={({ isActive }) =>
                        isActive ? "sub-link active" : "sub-link"
                      }
                    >
                      <PlusCircle size={16} />
                      <span>Add Product</span>
                    </NavLink>
                    <NavLink
                      to="/products/list"
                      className={({ isActive }) =>
                        isActive ? "sub-link active" : "sub-link"
                      }
                    >
                      <List size={16} />
                      <span>List Products</span>
                    </NavLink>
                    <NavLink
                      to="/products/reviews"
                      className={({ isActive }) =>
                        isActive ? "sub-link active" : "sub-link"
                      }
                    >
                      <Star size={16} />
                      <span>Product Reviews</span>
                    </NavLink>
                  </div>
                )}
              </div>

            </div>

            <div className="nav-group">
              <span className="group-label">Business</span>
              <NavLink
                to="/business"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <Briefcase size={20} />
                {!isSidebarCollapsed && <span>Business Management</span>}
              </NavLink>
            </div>

            <div className="nav-group">
              <span className="group-label">Management</span>
              <NavLink
                to="/transactions"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <Receipt size={20} />
                {!isSidebarCollapsed && <span>Transactions History</span>}
              </NavLink>
              {/* <NavLink
                to="/contact"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <Mail size={20} />
                {!isSidebarCollapsed && <span>Contact</span>}
              </NavLink>
              <NavLink
                to="/website-reviews"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <Globe size={20} />
                {!isSidebarCollapsed && <span>Website Reviews</span>}
              </NavLink> */}
            </div>
            <div className="nav-group">
              <span className="group-label">Tradizions Modules</span>
              <NavLink to="/users" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                <User size={20} />
                {!isSidebarCollapsed && <span>User List</span>}
              </NavLink>
              <NavLink to="/contacts" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                <Mail size={20} />
                {!isSidebarCollapsed && <span>Contacts</span>}
              </NavLink>
              <NavLink to="/goals" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                <TreePine size={20} />
                {!isSidebarCollapsed && <span>Health Goals</span>}
              </NavLink>
              <NavLink to="/banners" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                <Layers size={20} />
                {!isSidebarCollapsed && <span>Seasonal Banners</span>}
              </NavLink>
              <NavLink to="/kural" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                <Book size={20} />
                {!isSidebarCollapsed && <span>Thinam Oru Kural</span>}
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
            <div className="header-search">
              <Search size={18} />
              <input type="text" placeholder="Search products, orders..." />
            </div>
          </div>

          <div className="header-actions">
            <button className="icon-btn">
              <Bell size={20} />
              <span className="badge"></span>
            </button>
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">Admin User</span>
                <span className="user-role">Super Admin</span>
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
