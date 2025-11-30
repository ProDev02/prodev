
import React, { useState, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";

import { getAllProducts, createProduct, deleteProduct, updateProduct } from "../api/productApi";

import NewProductModal from "./NewProductModal";

import EditProductModal from "./EditProductModal";

import '../css/ProductList.css';

import BurtongLogo from '../../assets/Burtong_logo.png';



const API_BASE_URL = 'https://muict.app/burrrtongg-backend';



function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const navigate = useNavigate();



  const username = localStorage.getItem('username') || 'Admin';



  const fetchProducts = async () => {

    try {

      setLoading(true);

      const data = await getAllProducts();

      setProducts(data);

      setError(null);

    } catch (err) {

      setError(err.message);

      setProducts([]);

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    fetchProducts();

  }, []);



  const handleLogout = () => {

    localStorage.removeItem('authToken');

    localStorage.removeItem('userRole');

    localStorage.removeItem('username');

    navigate('/admin/login');

  };



  const handleCreateProduct = async (productData) => {

    try {

      const newProduct = await createProduct(productData);

      setProducts([newProduct, ...products]);

      setIsNewModalOpen(false);

    } catch (err) {

      console.error("Failed to create product:", err);

      alert(err.message);

    }

  };



  const handleEditProduct = (product) => {

    setEditingProduct(product);

    setIsEditModalOpen(true);

  };



  const handleUpdateProduct = async (productId, productData) => {

    try {

      const updatedProduct = await updateProduct(productId, productData);

      setProducts(products.map(p => p.id === productId ? updatedProduct : p));

      setIsEditModalOpen(false);

      setEditingProduct(null);

    } catch (err) {

      console.error("Failed to update product:", err);

      alert(err.message);

    }

  };



  const handleDeleteProduct = async (productId) => {
    if (window.confirm(`Are you sure you want to delete product with ID: ${productId}? This will also delete any associated order items.`)) {
      try {
        await deleteProduct(productId);
        setProducts(products.filter(product => product.id !== productId));
        alert('Product deleted successfully!');
      } catch (err) {
        console.error("Failed to delete product:", err);
        alert(err.message);
      }
    }
  };



  const renderProductRow = (product) => {
    const productModel = {
        id: product.id || 'N/A',
        name: product.name || 'No Name',
        stock: product.stock || 0,
        price: product.price || 0,
        category: product.category ? product.category.name : 'Uncategorized',
        createdAt: product.createdAt || new Date().toISOString(),
        imageUrl: product.imageUrl || '/assets/product.png',
    };

    // กำหนดสีและสถานะตาม stock level
    const getStockClass = () => {
      if (productModel.stock === 0) return 'out-of-stock';
      if (productModel.stock <= 5) return 'low-stock';
      return 'in-stock';
    };

    const getStockLabel = () => {
      if (productModel.stock === 0) return 'Out of Stock';
      if (productModel.stock <= 5) return 'Low Stock';
      return 'In Stock';
    };

    return (
        <tr key={productModel.id} className={productModel.stock === 0 ? 'out-of-stock-row' : ''}>
            <td>{productModel.id}</td>
            <td>
              <img 
                src={`${API_BASE_URL}${productModel.imageUrl}`}
                alt={productModel.name}
                className="product-thumbnail"
              />
            </td>
            <td>
              <span className="product-name">{productModel.name}</span>
            </td>
            <td>
                <div className="stock-container">
                  <span className={`stock-value ${getStockClass()}`}>
                      {productModel.stock}
                  </span>
                  <span className={`stock-label ${getStockClass()}`}>
                      {getStockLabel()}
                  </span>
                </div>
            </td>
            <td>
              <span className="price-value">฿{productModel.price.toLocaleString()}</span>
            </td>
            <td>
              <span className="category-text">{productModel.category}</span>
            </td>
            <td>
              <span className="date-value">
                {new Date(productModel.createdAt).toLocaleDateString()}
              </span>
            </td>
            <td>
                <button 
                    className="edit-product-btn" 
                    onClick={() => handleEditProduct(product)}
                >
                    Edit
                </button>
                <button 
                    className="delete-product-btn" 
                    onClick={() => handleDeleteProduct(productModel.id)}
                >
                    Delete
                </button>
            </td>
        </tr>
    );
  };



  return (

    <div className="dashboard">

      <aside className="sidebar">

        <div>

          <div className="sidebar-logo">

            <Link to="/admin/products">

              <img src={BurtongLogo} alt="Burtong Logo" />

            </Link>

          </div>

          <ul>

            <li><Link to="/admin/products">📦Products' List</Link></li>

            <li><Link to="/admin/orders">📋Orders' List</Link></li>

            <li><Link to="/admin/coupons">🎟️Coupons' List</Link></li>

            <li><Link to="/admin/categories">📂Categories' List</Link></li>

            <li><Link to="/admin/stock-report">📊Weekly Stock Report</Link></li>

          </ul>

        </div>

        <div className="sidebar-footer">

          <div className="user-info">

            <span className="username">{username}</span>

          </div>

          <button onClick={handleLogout} className="logout-btn">Logout</button>

        </div>

      </aside>



      <main className="main">

        <header className="main-header">

          <div className="title-group">

            <h1 className="main-title">Products' List</h1>

          </div>

          <button onClick={() => setIsNewModalOpen(true)} className="new-product-btn">

            + New Product

          </button>

        </header>



        {loading && <p>Loading products...</p>}

        {error && <p className="error-message">Error: {error}</p>}



        {!loading && !error && (
          <>
            <div className="product-stats">
              <div className="stat-item">
                <span className="stat-label">Total Products:</span>
                <span className="stat-value">{products.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">In Stock:</span>
                <span className="stat-value">{products.filter(p => p.stock > 0).length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Low Stock (≤5):</span>
                <span className="stat-value medium-usage">
                  {products.filter(p => p.stock > 0 && p.stock <= 5).length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Out of Stock:</span>
                <span className="stat-value high-usage">
                  {products.filter(p => p.stock === 0).length}
                </span>
              </div>
            </div>

            {products.length > 0 ? (
              <table className="product-table">

                        <thead>

                          <tr>

                            <th>#</th>

                            <th>Image</th>

                            <th>Name</th>

                            <th>Stock</th>

                            <th>Price</th>

                            <th>Type</th>

                            <th>Date</th>

                            <th>Actions</th>

                          </tr>

                        </thead>

            <tbody>
              {products.map(renderProductRow)}
            </tbody>
          </table>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>No products found</h3>
                <p>No products match your current filter criteria.</p>
                <button 
                  onClick={() => setFilterStatus('all')}
                  className="reset-filter-btn"
                >
                  Show All Products
                </button>
              </div>
            )}
        </>
        )}

      </main>



      <NewProductModal 

        isOpen={isNewModalOpen} 

        onClose={() => setIsNewModalOpen(false)} 

        onCreateProduct={handleCreateProduct}

      />



      {editingProduct && (

        <EditProductModal

          isOpen={isEditModalOpen}

          onClose={() => {

            setIsEditModalOpen(false);

            setEditingProduct(null);

          }}

          product={editingProduct}

          onUpdateProduct={handleUpdateProduct}

        />

      )}

    </div>

  );

}



export default ProductList;