const API_BASE_URL = 'https://muict.app/burrrtongg-backend';

export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: email, password }),
  });

  const responseBodyText = await response.text(); // Read body ONCE as text

  if (!response.ok) {
    console.error("Login API Error Status:", response.status);
    console.error("Login API Error Body:", responseBodyText);
    let errorMessage = 'Login failed';
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
    return JSON.parse(responseBodyText); // Parse the text as JSON
  } catch (e) {
    console.error("Login API Success, but response was not valid JSON:", responseBodyText);
    throw new Error('Login successful, but response was not valid JSON.');
  }
};

export const getAllOrders = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const responseBodyText = await response.text(); // Read body ONCE as text

  if (!response.ok) {
    console.error("Orders API Error Status:", response.status);
    console.error("Orders API Error Body:", responseBodyText);
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
    console.error("Orders API Success, but response was not valid JSON:", responseBodyText);
    throw new Error('Failed to fetch orders, but response was not valid JSON.');
  }
};

export const signup = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register/customer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: email, password }),
  });

  const responseBodyText = await response.text(); // Read body ONCE as text

  if (!response.ok) {
    console.error("Signup API Error Status:", response.status);
    console.error("Signup API Error Body:", responseBodyText);
    let errorMessage = 'Signup failed';
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
    return JSON.parse(responseBodyText); // Parse the text as JSON
  } catch (e) {
    console.error("Signup API Success, but response was not valid JSON:", responseBodyText);
    throw new Error('Signup successful, but response was not valid JSON.');
  }
};