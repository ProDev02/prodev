const API_BASE_URL = 'https://muict.app/burrrtongg-backend';

export const createOrder = async (orderRequest) => {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderRequest),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create order');
  }

  return await response.json();
};

export const getOrdersByCustomerId = async (customerId) => {
  console.log("Fetching orders for customerId:", customerId);
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/customer/${customerId}`);
    console.log("Response status:", response.status);
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching orders:", errorData);
      throw new Error(errorData.message || 'Failed to fetch orders');
    }
    const data = await response.json();
    console.log("Orders data:", data);
    return data;
  } catch (error) {
    console.error("An error occurred during fetch:", error);
    throw error;
  }
};

export const getCouponByCode = async (couponCode) => {
  const response = await fetch(`${API_BASE_URL}/api/coupons/${couponCode}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch coupon');
  }

  return await response.json();
};