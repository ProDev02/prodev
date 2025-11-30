import React, { useState, useEffect } from 'react';
import '../css/Cart.css';
import { Link } from 'react-router-dom';
import Product from '../models/product.js';
import { createOrder, getCouponByCode } from '../api/orderApi.js';

const API_BASE_URL = 'https://muict.app/burrrtongg-backend';

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
  </svg>
);

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [checkoutStatus, setCheckoutStatus] = useState('idle'); // idle, success, error
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      return total + price * quantity;
    }, 0);
  };

  const getTotalWithDiscount = () => {
    let total = calculateTotal();
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'FIXED') {
        total -= appliedCoupon.discountValue;
      } else if (appliedCoupon.discountType === 'PERCENTAGE') {
        total -= total * (appliedCoupon.discountValue / 100);
      }
    }
    return Math.max(0, total); // Ensure total doesn't go below zero
  };

  useEffect(() => {
    if (appliedCoupon) {
      let total = calculateTotal();
      let discount = 0;
      if (appliedCoupon.discountType === 'FIXED') {
        discount = appliedCoupon.discountValue;
      } else if (appliedCoupon.discountType === 'PERCENTAGE') {
        discount = total * (appliedCoupon.discountValue / 100);
      }
      setDiscountAmount(discount);
    } else {
      setDiscountAmount(0);
    }
  }, [cart, appliedCoupon]);

  const handleQuantityChange = (productId, newQuantity) => {
    const itemInCart = cart.find(item => item.id === productId);

    if (!itemInCart) return;

    // Prevent quantity from going below 1
    if (newQuantity < 1) {
      newQuantity = 1;
    }

    // Check against stock
    if (newQuantity > itemInCart.stock) {
      alert(`You can only add up to ${itemInCart.stock} items.`);
      newQuantity = itemInCart.stock;
    }

    setCart(
      cart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      alert('Please enter a coupon code.');
      return;
    }
    try {
      const coupon = await getCouponByCode(couponCode);
      
      // ตรวจสอบสถานะ active
      if (!coupon.isActive) {
        alert(`Coupon '${coupon.code}' is currently inactive. Please contact support or try another coupon.`);
        setAppliedCoupon(null);
        setDiscountAmount(0);
        return;
      }
      
      // ตรวจสอบวันหมดอายุ
      if (coupon.expirationDate && new Date(coupon.expirationDate) < new Date()) {
        const expiredDate = new Date(coupon.expirationDate).toLocaleDateString('th-TH');
        alert(`Coupon '${coupon.code}' has expired on ${expiredDate}. Please try another coupon.`);
        setAppliedCoupon(null);
        setDiscountAmount(0);
        return;
      }
      
      // ตรวจสอบ usage limit
      if (coupon.maxUses !== null && coupon.timesUsed >= coupon.maxUses) {
        alert(`Coupon '${coupon.code}' has reached its maximum usage limit (${coupon.maxUses} times). It has been used ${coupon.timesUsed} times already.`);
        setAppliedCoupon(null);
        setDiscountAmount(0);
        return;
      }
      
      // ตรวจสอบ minimum purchase amount
      if (coupon.minPurchaseAmount && calculateTotal() < coupon.minPurchaseAmount) {
        alert(`Your order total ฿${calculateTotal()} does not meet the minimum purchase amount of ฿${coupon.minPurchaseAmount} required for coupon '${coupon.code}'.`);
        setAppliedCoupon(null);
        setDiscountAmount(0);
        return;
      }

      setAppliedCoupon(coupon);
      
      // แสดงข้อความสำเร็จที่ละเอียด
      let successMessage = `Coupon '${coupon.code}' applied successfully!`;
      if (coupon.discountType === 'FIXED') {
        successMessage += ` You saved ฿${coupon.discountValue}`;
      } else {
        successMessage += ` You saved ${coupon.discountValue}%`;
      }
      
      alert(successMessage);
    } catch (error) {
      console.error('Error applying coupon:', error);
      
      // จัดการ error message ให้ละเอียด
      let errorMessage = 'Failed to apply coupon.';
      
      if (error.message.includes('Invalid coupon code')) {
        errorMessage = `Coupon code '${couponCode}' is not found. Please check the code and try again.`;
      } else if (error.message.includes('not active')) {
        errorMessage = error.message;
      } else if (error.message.includes('expired')) {
        errorMessage = error.message;
      } else if (error.message.includes('usage limit')) {
        errorMessage = error.message;
      } else if (error.message.includes('minimum purchase')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      setAppliedCoupon(null);
      setDiscountAmount(0);
    }
  };

  const handleCheckout = async () => {
    const customerId = localStorage.getItem('userId');

    if (!customerId) {
      alert("Please log in to proceed with the checkout.");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const orderRequest = {
      customerId: parseInt(customerId, 10),
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      couponCode: appliedCoupon ? appliedCoupon.code : null,
    };

    try {
      await createOrder(orderRequest);
      setCheckoutStatus('success');
      setTimeout(() => {
        setCart([]);
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCheckoutStatus('idle');
      }, 3000); // Reset after 3 seconds
    } catch (error) {
      console.error("Failed to create order:", error);
      setCheckoutStatus('error');
      alert(`Failed to create order: ${error.message}`);
    }
  };

  return (
    <div className="cart-container">
      <h1>Shopping Cart</h1>
      <div className="cart-content">
        <div className="cart-items">
          <div className="cart-header">
            <div className="header-product">Product</div>
            <div className="header-price">Price</div>
            <div className="header-quantity">Quantity</div>
            <div className="header-total">Total</div>
            <div className="header-remove"></div>
          </div>
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cart.map(item => {
              const product = new Product(item);
              return (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-details">
                    <img src={`${API_BASE_URL}${product.imageUrl || '/assets/product.png'}`} alt={product.name} />
                    <div>
                      <p className="item-name">{product.name}</p>
                      {/* Optional: <p className="item-category">Category</p> */}
                    </div>
                  </div>
                  <div className="cart-item-price">{product.getFormattedPrice()}</div>
                  <div className="cart-item-quantity">
                    <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <div className="cart-item-total">
                    {(product.price * item.quantity).toLocaleString()}.-
                  </div>
                  <div className="cart-item-remove">
                    <button className="remove-item-btn" onClick={() => handleRemoveItem(item.id)}>
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{calculateTotal().toLocaleString()}.-</span>
          </div>
          <div className="coupon-section">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={appliedCoupon !== null}
            />
            <button onClick={handleApplyCoupon} disabled={appliedCoupon !== null}>Apply</button>
          </div>
          {appliedCoupon && (
            <div className="applied-coupon-info">
              <div className="summary-row discount-row">
                <span>
                  Discount ({appliedCoupon.code})
                  <span className="coupon-type">
                    {appliedCoupon.discountType === 'FIXED' 
                      ? ` - ฿${appliedCoupon.discountValue} off` 
                      : ` - ${appliedCoupon.discountValue}% off`}
                  </span>
                </span>
                <span>-{discountAmount.toLocaleString()}.-</span>
              </div>
              {appliedCoupon.minPurchaseAmount && (
                <div className="coupon-requirement">
                  Min. purchase: ฿{appliedCoupon.minPurchaseAmount}
                </div>
              )}
              {appliedCoupon.maxUses && (
                <div className="coupon-usage">
                  Used: {appliedCoupon.timesUsed}/{appliedCoupon.maxUses} times
                </div>
              )}
            </div>
          )}
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <hr />
          <div className="summary-total">
            <span>Total</span>
            <span>{getTotalWithDiscount().toLocaleString()}.-</span>
          </div>
          <button 
            className={`checkout-button ${checkoutStatus === 'success' ? 'success' : ''}`}
            onClick={handleCheckout} 
            disabled={checkoutStatus === 'success' || cart.length === 0}
          >
            {checkoutStatus === 'success' ? 'Order Placed!' : 'Checkout'}
          </button>
        </div>
      </div>
      <div className="back-link">
        <Link to="/home/products">← Continue Shopping</Link>
      </div>
    </div>
  );
};

export default Cart;
