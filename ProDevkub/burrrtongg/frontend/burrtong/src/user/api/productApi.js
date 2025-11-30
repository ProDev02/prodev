import Product from '../models/product.js';

const API_BASE_URL = 'https://muict.app/burrrtongg-backend';

export const getAllProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/api/products`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  const data = await response.json();
  return data.map(p => new Product(p));
};

export const getProductById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch product with id ${id}`);
  }
  const data = await response.json();
  return new Product(data);
};

export const searchProducts = async (name) => {
  const encodedName = encodeURIComponent(name);
  const response = await fetch(`${API_BASE_URL}/api/products/search?name=${encodedName}`);
  if (!response.ok) {
    throw new Error(`Failed to search for products with name ${name}`);
  }
  const data = await response.json();
  return data.map(p => new Product(p));
};
