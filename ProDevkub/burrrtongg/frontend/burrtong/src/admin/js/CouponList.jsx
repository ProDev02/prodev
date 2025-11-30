import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from "../api/couponApi";
import NewCouponModal from "./NewCouponModal";
import EditCouponModal from "./EditCouponModal";
import '../css/ProductList.css'; // Reusing the same CSS for consistency
import BurtongLogo from '../../assets/Burtong_logo.png';

function CouponList() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const navigate = useNavigate();

  const username = localStorage.getItem('username') || 'Admin';

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await getAllCoupons();
      console.log('Fetched coupons:', data); // Debug log to see the structure
      setCoupons(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
  };

  const handleCreateCoupon = async (couponData) => {
    try {
      const newCoupon = await createCoupon(couponData);
      console.log('Created coupon response:', newCoupon); // Debug log
      setCoupons([newCoupon, ...coupons]);
      setIsNewModalOpen(false);
    } catch (err) {
      console.error("Failed to create coupon:", err);
      alert(err.message);
    }
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setIsEditModalOpen(true);
  };

  const handleUpdateCoupon = async (couponId, couponData) => {
    try {
      const updatedCoupon = await updateCoupon(couponId, couponData);
      console.log('Updated coupon response:', updatedCoupon); // Debug log
      setCoupons(coupons.map(c => c.id === couponId ? updatedCoupon : c));
      setIsEditModalOpen(false);
      setEditingCoupon(null);
    } catch (err) {
      console.error("Failed to update coupon:", err);
      alert(err.message);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (window.confirm(`Are you sure you want to delete coupon with ID: ${couponId}?`)) {
      try {
        await deleteCoupon(couponId);
        setCoupons(coupons.filter(coupon => coupon.id !== couponId));
        alert('Coupon deleted successfully!');
      } catch (err) {
        console.error("Failed to delete coupon:", err);
        alert(err.message);
      }
    }
  };

  const renderCouponRow = (coupon) => {
    // คำนวณ usage percentage และกำหนดสี
    const usagePercentage = coupon.maxUses ? Math.round(((coupon.timesUsed || 0) / coupon.maxUses) * 100) : 0;
    const getUsageClass = () => {
      if (usagePercentage >= 80) return 'high-usage';
      if (usagePercentage >= 60) return 'medium-usage';
      return '';
    };

    // ตรวจสอบการหมดอายุ
    const expirationDate = new Date(coupon.expirationDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    const isExpired = daysUntilExpiry <= 0;

    return (
      <tr key={coupon.id} className={isExpired ? 'expired-row' : ''}>
        <td>{coupon.id}</td>
        <td>{coupon.code}</td>
        <td>{coupon.discountType}</td>
        <td>{coupon.discountType === 'FIXED' ? `${coupon.discountValue}.-` : `${coupon.discountValue}%`}</td>
        <td>
          {coupon.minPurchaseAmount ? `$${coupon.minPurchaseAmount}` : 'No min.'}
        </td>
        <td>
          <span className={`expiry-date ${isExpired ? 'expired' : isExpiringSoon ? 'expiring-soon' : ''}`}>
            {expirationDate.toLocaleDateString()}
            {isExpired && <span className="expiry-label"> (Expired)</span>}
            {isExpiringSoon && <span className="expiry-label"> ({daysUntilExpiry} days left)</span>}
          </span>
        </td>
        <td>
          {coupon.maxUses ? (
            <span className="usage-limit">{coupon.maxUses}</span>
          ) : (
            <span className="unlimited">Unlimited</span>
          )}
        </td>
        <td>
          <div className="usage-container">
            <span className={`times-used ${getUsageClass()}`}>
              {coupon.timesUsed || 0}
              {coupon.maxUses && (
                <span className="usage-percentage">
                  {` / ${coupon.maxUses} (${usagePercentage}%)`}
                </span>
              )}
            </span>
            {coupon.maxUses && (
              <div className="usage-progress-bar">
                <div 
                  className={`usage-progress-fill ${getUsageClass()}`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                ></div>
              </div>
            )}
          </div>
        </td>
        <td>
          <span className={`status ${coupon.isActive ? 'status-available' : 'status-out-of-stock'}`}>
            {coupon.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          <button className="edit-product-btn" onClick={() => handleEditCoupon(coupon)}>Edit</button>
          <button className="delete-product-btn" onClick={() => handleDeleteCoupon(coupon.id)}>Delete</button>
        </td>
      </tr>
    );
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div>
          <div className="sidebar-logo">
            <Link to="/admin/products">
              <img src={BurtongLogo} alt="Burtong Logo" />
            </Link>
          </div>
                    <ul>

            <li><Link to="/admin/products">📦Products' List</Link></li>

            <li><Link to="/admin/orders">📋Orders' List</Link></li>

            <li><Link to="/admin/coupons">🎟️Coupons' List</Link></li>

            <li><Link to="/admin/categories">📂Categories' List</Link></li>

            <li><Link to="/admin/stock-report">📊Weekly Stock Report</Link></li>

          </ul>
        </div>
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="username">{username}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </aside>

      <main className="main">
        <header className="main-header">
          <div className="title-group">
            <h1 className="main-title">Coupons' List</h1>
          </div>
          <button onClick={() => setIsNewModalOpen(true)} className="new-product-btn">+ New Coupon</button>
        </header>

        {loading && <p>Loading coupons...</p>}
        {error && <p className="error-message">Error: {error}</p>}

        {!loading && !error && (
          <>
            <div className="coupon-stats">
              <div className="stat-item">
                <span className="stat-label">Total Coupons:</span>
                <span className="stat-value">{coupons.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active Coupons:</span>
                <span className="stat-value">{coupons.filter(c => c.isActive).length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Expiring Soon (≤7 days):</span>
                <span className="stat-value medium-usage">
                  {coupons.filter(c => {
                    const daysUntilExpiry = Math.ceil((new Date(c.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
                    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
                  }).length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">High Usage (≥80%):</span>
                <span className="stat-value high-usage">
                  {coupons.filter(c => c.maxUses && ((c.timesUsed || 0) / c.maxUses) >= 0.8).length}
                </span>
              </div>
            </div>
            
            <table className="product-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Min Purchase</th>
                  <th>Expires</th>
                  <th>Max Uses</th>
                  <th>Times Used</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(renderCouponRow)}
              </tbody>
            </table>
          </>
        )}
      </main>

      <NewCouponModal 
        isOpen={isNewModalOpen} 
        onClose={() => setIsNewModalOpen(false)} 
        onCreateCoupon={handleCreateCoupon}
      />

      {editingCoupon && (
        <EditCouponModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCoupon(null);
          }}
          coupon={editingCoupon}
          onUpdateCoupon={handleUpdateCoupon}
        />
      )}
    </div>
  );
}

export default CouponList;
