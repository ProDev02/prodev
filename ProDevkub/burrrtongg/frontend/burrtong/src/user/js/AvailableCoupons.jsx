import React, { useState, useEffect } from "react";
import { getActiveCoupons } from "../api/couponApi";
import "../css/AvailableCoupons.css";

function AvailableCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    fetchActiveCoupons();
  }, []);

  const fetchActiveCoupons = async () => {
    try {
      setLoading(true);
      const data = await getActiveCoupons();
      // แสดงเฉพาะ coupons ที่ active และยังไม่หมดอายุ
      const activeCoupons = data.filter(coupon => 
        coupon.isActive && 
        (!coupon.expiryDate || new Date(coupon.expiryDate) > new Date()) &&
        (coupon.maxUses === null || coupon.timesUsed < coupon.maxUses)
      );
      setCoupons(activeCoupons);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
      setError("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const formatDiscountValue = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`;
    } else {
      return `฿${coupon.discountValue} OFF`;
    }
  };

  const getExpiryText = (expiryDate) => {
    if (!expiryDate) {
      // ถ้าไม่มีวันหมดอายุ ให้แสดงวันที่ไกลๆ ในอนาคต
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 10); // เพิ่ม 10 ปี
      return `Expires: ${futureDate.toLocaleDateString()}`;
    }
    
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return "Expired";
    if (diffDays === 1) return "Expires today";
    if (diffDays <= 7) return `Expires in ${diffDays} days`;
    
    // แสดงวันที่หมดอายุ
    return `Expires: ${expiry.toLocaleDateString()}`;
  };

  if (loading) {
    return (
      <section className="coupons-section">
        <div className="container">
          <h2>Available Coupons</h2>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading coupons...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || coupons.length === 0) {
    return (
      <section className="coupons-section">
        <div className="container">
          <h2>Available Coupons</h2>
          <div className="empty-coupons">
            <p>No active coupons available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="coupons-section">
      <div className="container">
        <h2>Available Coupons</h2>
        <p className="section-subtitle">Save money with these exclusive offers!</p>
        
        <div className="coupons-grid">
          {coupons.slice(0, 6).map((coupon) => (
            <div key={coupon.id} className="coupon-card">
              <div className="coupon-header">
                <div className="discount-badge">
                  {formatDiscountValue(coupon)}
                </div>
                {coupon.maxUses && (
                  <div className="usage-info">
                    {coupon.maxUses - coupon.timesUsed} left
                  </div>
                )}
              </div>
              
              <div className="coupon-body">
                <h3 className="coupon-name">{coupon.name}</h3>
                {coupon.description && (
                  <p className="coupon-description">{coupon.description}</p>
                )}
                
                <div className="coupon-code-section">
                  <span className="code-label">Code:</span>
                  <div className="code-container">
                    <code className="coupon-code">{coupon.code}</code>
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(coupon.code)}
                      title="Copy code"
                    >
                      copy
                    </button>
                  </div>
                </div>
                
                <div className="coupon-footer">
                  <span className="expiry-text">
                    {getExpiryText(coupon.expiryDate)}
                  </span>
                  {coupon.minOrderAmount > 0 && (
                    <span className="min-order">
                      Min. order: ฿{coupon.minOrderAmount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AvailableCoupons;