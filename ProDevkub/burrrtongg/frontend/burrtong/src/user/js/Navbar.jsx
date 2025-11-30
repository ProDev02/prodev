import React, { useEffect, useRef, useState } from "react";
import "../css/Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import BurtongLogo from '../../assets/Burtong_logo.png';

function Navbar() {
  const [open, setOpen] = useState(false);              // desktop avatar dropdown
  const [mobileOpen, setMobileOpen] = useState(false);  // mobile menu
  const [username, setUsername] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const avatarRef = useRef(null);
  const mobileWrapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    const handleClickOutside = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setOpen(false);
      if (mobileWrapRef.current && !mobileWrapRef.current.contains(e.target)) setMobileOpen(false);
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") { setOpen(false); setMobileOpen(false); }
    };
    const handleResize = () => { if (window.innerWidth > 960) setMobileOpen(false); };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    navigate("/"); // กลับหน้า Login
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const encodedQuery = encodeURIComponent(searchQuery);
      navigate(`/home/search?q=${encodedQuery}`);
    }
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/home" className="logo"><img src={BurtongLogo} alt="Burtong Logo" /></Link>

      {/* Search (ซ่อนอัตโนมัติบนมือถือด้วย CSS; ไม่รวมในเมนู) */}
      <form className="search-container" onSubmit={handleSearch}>
        <button className="search-btn" aria-label="Search" type="submit">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 
                     1.398h-.001l3.85 3.85a1 1 0 0 0 
                     1.415-1.414l-3.85-3.85zm-5.242 
                     1.656a5.5 5.5 0 1 1 0-11 
                     5.5 5.5 0 0 1 0 11z" />
          </svg>
        </button>
        <input 
          type="text" 
          placeholder="search" 
          className="search-box" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      {/* Desktop: Links + Avatar */}
      <div className="nav-links">
        <Link to="/home">Home</Link>
        <Link to="/home/products">Products</Link>
        <Link to="/home/cart">Shopping Cart</Link>
        <Link to="/home/orders">My Orders</Link>
      </div>

      <div className="avatar-wrapper" ref={avatarRef}>
        <div
          className="avatar"
          role="button"
          tabIndex={0}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setOpen(v => !v);
          }}
        >
          <span>B</span>
        </div>

        {open && (
          <div className="dropdown" role="menu" aria-label="Account menu">
            <div className="dropdown-item dropdown-label">{username ? username : 'Account'}</div>
            <button className="dropdown-item danger" onClick={handleLogout}>
              Log out
            </button>
          </div>
        )}
      </div>

      {/* Mobile: Hamburger + เมนูรวม (เฉพาะลิงก์และบัญชี) */}
      <div className="mobile-menu-wrap" ref={mobileWrapRef}>
        <button
          className="hamburger"
          aria-label="Open menu"
          aria-haspopup="menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(v => !v)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" fill="currentColor" />
          </svg>
        </button>

        {mobileOpen && (
          <div className="mobile-menu" role="menu" aria-label="Main menu">
            <div className="section-title">Navigate</div>
            <Link to="/home" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/home/products" onClick={() => setMobileOpen(false)}>Products</Link>
            <Link to="/home/cart" onClick={() => setMobileOpen(false)}>Shopping Cart</Link>
            <Link to="/home/orders" onClick={() => setMobileOpen(false)}>My Orders</Link>

            <div className="section-title">{username ? username : 'Account'}</div>
            <button className="danger" onClick={() => { setMobileOpen(false); handleLogout(); }}>
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
