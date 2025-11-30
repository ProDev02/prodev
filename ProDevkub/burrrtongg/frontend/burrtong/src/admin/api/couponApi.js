const API_BASE_URL = 'https://muict.app/burrrtongg-backend';

// Fetch all coupons
export const getAllCoupons = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/api/coupons`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch coupons');
  }
  return await response.json();
};

// Create a new coupon
export const createCoupon = async (couponData) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/api/coupons`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(couponData),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.message || 'Failed to create coupon');
  }

  return await response.json();
};

// Update an existing coupon
export const updateCoupon = async (couponId, couponData) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/api/coupons/${couponId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(couponData),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.message || 'Failed to update coupon');
  }

  return await response.json();
};

// Delete a coupon
export const deleteCoupon = async (couponId) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/api/coupons/${couponId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.message || 'Failed to delete coupon');
  }

  return true; // Indicate successful deletion
};
