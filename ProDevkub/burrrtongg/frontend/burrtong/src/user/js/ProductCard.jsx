import React from 'react';
import { Link } from 'react-router-dom';
import '../css/ProductCard.css'; // Corrected path

const API_BASE_URL = 'https://muict.app/burrrtongg-backend';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <Link to={`/home/products/${product.id}`}>
        <div className="product-image-container">
          <img 
            src={`${API_BASE_URL}${product.imageUrl || '/assets/product.png'}`}
            alt={product.name}
            className="product-image"
          />
        </div>
        <div className="product-info-card">
          <h3>{product.name}</h3>
          {product.size && <p className="product-size">Size: {product.size}</p>}
          <div className="product-footer">
            <p className="product-price">{product.price ? product.price.toLocaleString() + ' THB' : 'N/A'}</p>
            <p className={`product-status ${product.stock === 0 ? 'out-of-stock' : ''}`}>
              {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock'}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
