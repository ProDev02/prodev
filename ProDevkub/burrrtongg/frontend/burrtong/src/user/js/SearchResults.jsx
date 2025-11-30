import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchProducts } from '../api/productApi';
import ProductCard from './ProductCard';
import '../css/Products.css';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const query = searchParams.get('q');

  useEffect(() => {
    if (query) {
      searchProducts(query)
        .then(setProducts)
        .catch(err => setError(err.message));
    }
  }, [query]);

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="products-container">
      <h1>Search Results for "{query}"</h1>
      {products.length > 0 ? (
        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p>No products found.</p>
      )}
    </div>
  );
}

export default SearchResults;
