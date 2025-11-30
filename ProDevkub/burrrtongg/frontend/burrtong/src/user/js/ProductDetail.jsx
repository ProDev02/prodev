import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../api/productApi.js';
import '../css/ProductDetail.css';

const API_BASE_URL = 'https://muict.app/burrrtongg-backend'; // Define API base URL

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const fetchedProduct = await getProductById(productId);
        setProduct(fetchedProduct);
      } catch (error) {
        console.error(`Failed to fetch product with id ${productId}:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleIncrement = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock === 0) return; // Cannot add out of stock items
    if (quantity > product.stock) {
      alert('Not enough stock!');
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingProduct = cart.find(item => item.id === product.id);
    
    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      const cartItem = { ...product, quantity, size: product.size }; // Use product.size
      cart.push(cartItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    navigate('/home/cart');
  };

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found!</div>;

  console.log("Product object in ProductDetail:", product); // Added console.log

  return (
    <div className="product-detail-page">
      <div className="breadcrumb"></div>
      <div className="back-arrow-container">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); handleBack(); }}
          className="back-arrow"
        >
          &larr;
        </a>
      </div>
      <div className="product-detail-container">
        <div className="main-image-container"> {/* Simplified image container */}
            <img 
              src={`${API_BASE_URL}${product.imageUrl || '/assets/product.png'}`}
              alt={product.name}
            />
          </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="product-id">Product id : {product.id}</p>
          <p className="price">{product.price ? product.price.toLocaleString() + ' THB' : 'N/A'}</p>
          <p className={`stock-status ${product.stock === 0 ? 'out-of-stock' : ''}`}>
            {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock'}
          </p>

          {product.size && <p className="product-size">Size: {product.size}</p>}

          {product.description && (
            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>
          )}

          <div className="quantity-selector">
            <p className="quantity-label">Quantity</p>
            <div className="quantity-controls">
              <button onClick={handleDecrement} disabled={product.stock === 0}>-</button>
              <span>{quantity}</span>
              <button onClick={handleIncrement} disabled={product.stock === 0}>+</button>
            </div>
          </div>

          <button className="add-to-cart" onClick={handleAddToCart} disabled={product.stock === 0}>
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
