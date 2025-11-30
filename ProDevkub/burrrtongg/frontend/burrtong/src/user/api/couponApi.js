const API_BASE_URL = 'https://muict.app/burrrtongg-backend';

// Fetch active coupons for customers (public endpoint)
export const getActiveCoupons = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/coupons/active`);
    if (!response.ok) {
      throw new Error('Failed to fetch active coupons');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching active coupons:', error);
    throw error;
  }
};