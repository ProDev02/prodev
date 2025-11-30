import React, { useState } from 'react';
import '../css/NewProductModal.css'; // Reusing styles

function NewCouponModal({ isOpen, onClose, onCreateCoupon }) {
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'FIXED',
    discountValue: '',
    expirationDate: '',
    maxUses: '',
    minPurchaseAmount: '',
    isActive: true,
  });
  const [error, setError] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue || !formData.expirationDate) {
      setError('Code, Discount Value, and Expiration Date are required.');
      return;
    }

    const couponData = {
      ...formData,
      discountValue: parseFloat(formData.discountValue),
      maxUses: formData.maxUses ? parseInt(formData.maxUses, 10) : null,
      minPurchaseAmount: formData.minPurchaseAmount ? parseFloat(formData.minPurchaseAmount) : null,
      isActive: formData.isActive, // Explicitly include isActive boolean
    };

    onCreateCoupon(couponData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Coupon</h2>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {error && <p className="error-message">{error}</p>}
          
          <div className="form-group">
            <label>Code</label>
            <input type="text" name="code" value={formData.code} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Discount Type</label>
            <select name="discountType" value={formData.discountType} onChange={handleChange}>
              <option value="FIXED">Fixed</option>
              <option value="PERCENTAGE">Percentage</option>
            </select>
          </div>

          <div className="form-group">
            <label>Discount Value</label>
            <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Expiration Date</label>
            <input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Maximum Uses (optional)</label>
            <input type="number" name="maxUses" value={formData.maxUses} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Minimum Purchase Amount (optional)</label>
            <input type="number" name="minPurchaseAmount" value={formData.minPurchaseAmount} onChange={handleChange} />
          </div>

          <div className="form-group form-group-checkbox">
            <input 
              id="isActive" 
              type="checkbox" 
              name="isActive" 
              checked={formData.isActive} 
              onChange={handleChange} 
            />
            <label htmlFor="isActive">
              Active {formData.isActive ? '(Enabled)' : '(Disabled)'}
            </label>
          </div>

          <button type="submit" className="modal-submit-btn">Create Coupon</button>
        </form>
      </div>
    </div>
  );
}

export default NewCouponModal;
