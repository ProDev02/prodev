const API_BASE_URL = 'https://muict.app/burrrtongg-backend';

export const getAllOrders = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const responseBodyText = await response.text(); // Read body ONCE as text

  if (!response.ok) {
    let errorMessage = 'Failed to fetch orders';
    try {
      const errorData = JSON.parse(responseBodyText); // Try parsing the text as JSON
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      errorMessage = responseBodyText; // Use raw text if not JSON
    }
    throw new Error(errorMessage);
  }

  // If response.ok is true, it should be a successful JSON response
  try {
    return JSON.parse(responseBodyText);
  } catch (e) {
    throw new Error('Failed to fetch orders, but response was not valid JSON.');
  }
};

export const updateOrderStatus = async (orderId, status) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(status), // Send the status as a string in the body
  });

  if (!response.ok) {
    let errorMessage = 'Failed to update order status';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      errorMessage = await response.text();
    }
    throw new Error(errorMessage);
  }

  return await response.json();
};

export const denyOrder = async (orderId) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/deny`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMessage = 'Failed to deny order';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      errorMessage = await response.text();
    }
    throw new Error(errorMessage);
  }

  return await response.json();
};