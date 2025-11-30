import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrdersByCustomerId } from "../api/orderApi";
import { getAllProducts } from "../api/productApi";
import { PDFService } from "../utils/PDFService";
import "../css/OrderHistory.css";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const customerId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const handlePrintPDF = (order, download = false) => {
    try {
      if (download) {
        PDFService.downloadOrderPDF(order, false); // false = customer view
      } else {
        PDFService.printOrderPDF(order, false); // false = customer view
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleReorder = async (order) => {
    try {
      // Get current product data to check stock and availability
      const currentProducts = await getAllProducts();
      const unavailableItems = [];
      const availableItems = [];

      // Check each item in the order
      for (const orderItem of order.orderItems) {
        const currentProduct = currentProducts.find(p => p.id === orderItem.product.id);
        
        if (!currentProduct) {
          unavailableItems.push(`${orderItem.product.name} - Product no longer available`);
        } else if (currentProduct.stock < orderItem.quantity) {
          unavailableItems.push(`${orderItem.product.name} - Insufficient stock (Available: ${currentProduct.stock}, Requested: ${orderItem.quantity})`);
        } else {
          availableItems.push({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            quantity: orderItem.quantity,
            imageUrl: currentProduct.imageUrl
          });
        }
      }

      // If there are unavailable items, show popup and don't proceed
      if (unavailableItems.length > 0) {
        const message = "The following items cannot be re-ordered:\n\n" + 
                       unavailableItems.join('\n') + 
                       "\n\nPlease check the product page for current availability.";
        alert(message);
        return;
      }

      // If all items are available, add them to cart and navigate
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Add each available item to cart
      availableItems.forEach(item => {
        const existingItem = existingCart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          existingCart.push(item);
        }
      });

      localStorage.setItem('cart', JSON.stringify(existingCart));
      
      // Navigate to cart page
      navigate('/home/cart');
      
    } catch (error) {
      console.error('Error during reorder:', error);
      alert('Error processing re-order. Please try again.');
    }
  };

  useEffect(() => {
    if (customerId) {
      getOrdersByCustomerId(customerId)
        .then(setOrders)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [customerId]);

  if (loading) {
    return (
      <div className="order-history-container">
        <div className="loading-message">Loading your orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-container">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  if (!customerId) {
    return (
      <div className="order-history-container">
        <div className="login-message">Please log in to see your orders.</div>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <div className="page-header">
        <h1 className="page-title">My Orders</h1>
        <div className="orders-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</div>
      </div>
      
      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No orders yet</h3>
          <p>When you place your first order, it will appear here.</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => {
            const subtotal = order.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
            const discount = order.coupon ? subtotal - order.totalPrice : 0;

            return (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <span className="order-id">#{order.id}</span>
                    <span className="order-date">{new Date(order.orderDate).toLocaleDateString()}</span>
                  </div>
                  <div className="header-right">
                    <div className={`order-history-status order-history-status-${order.status ? order.status.toLowerCase() : 'unknown'}`}>
                      {order.status || 'UNKNOWN'}
                    </div>
                    <div className="order-actions">
                      <button 
                        className="action-btn download-btn"
                        onClick={() => handlePrintPDF(order, true)}
                      >
                        Print PDF
                      </button>
                      <button 
                        className="action-btn reorder-btn" 
                        onClick={() => handleReorder(order)}
                      >
                        Re-order
                      </button>
                    </div>
                  </div>
                </div>

                <div className="order-items">
                  {order.orderItems.map((item) => (
                    <div key={item.product.id} className="order-item">
                      <div className="item-info">
                        <div className="item-name">{item.product.name}</div>
                        <div className="item-quantity">Qty: {item.quantity}</div>
                      </div>
                      <div className="item-price">${item.price.toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="price-breakdown">
                    <div className="price-row">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {order.coupon && (
                      <div className="price-row discount">
                        <span>Discount ({order.coupon.code}):</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="price-row total">
                      <span>Total:</span>
                      <span>${order.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrderHistory;
