import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllCategories, createCategory, deleteCategory, updateCategory } from "../api/categoryApi";
import NewCategoryModal from "./NewCategoryModal";
import EditCategoryModal from "./EditCategoryModal";
import '../css/ProductList.css';
import BurtongLogo from '../../assets/Burtong_logo.png';

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const navigate = useNavigate();

  const username = localStorage.getItem('username') || 'Admin';

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
  };

  const handleAddCategory = async (categoryData) => {
    try {
      await createCategory(categoryData);
      setIsNewModalOpen(false);
      fetchCategories(); // Refresh the list
    } catch (err) {
      console.error("Failed to create category:", err);
      throw err; // Let the modal handle the error display
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setIsEditModalOpen(true);
  };

  const handleUpdateCategory = async (categoryId, categoryData) => {
    try {
      await updateCategory(categoryId, categoryData);
      setIsEditModalOpen(false);
      setEditingCategory(null);
      fetchCategories(); // Refresh the list
    } catch (err) {
      console.error("Failed to update category:", err);
      throw err; // Let the modal handle the error display
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(categoryId);
        fetchCategories(); // Refresh the list
      } catch (err) {
        console.error("Failed to delete category:", err);
        alert(err.message);
      }
    }
  };

  const renderCategoryRow = (category) => {
    return (
      <tr key={category.id}>
        <td>{category.id}</td>
        <td className="category-name">{category.name}</td>
        <td>
          <button 
            className="edit-product-btn"
            onClick={() => handleEditCategory(category)}
          >
            Edit
          </button>
          <button 
            className="delete-product-btn"
            onClick={() => handleDeleteCategory(category.id)}
          >
            Delete
          </button>
        </td>
      </tr>
    );
  };

  if (loading) {
    return <div>Loading categories...</div>;
  }

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
            <li><Link to="/admin/categories" className="active">📂Categories' List</Link></li>

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
          <h1 className="main-title">Categories' List</h1>
          <button 
            className="new-product-btn"
            onClick={() => setIsNewModalOpen(true)}
          >
            Add New Category
          </button>
        </header>

        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        )}

        {categories.length > 0 ? (
          <table className="product-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(renderCategoryRow)}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No Categories Found</h3>
            <p>There are no categories available at the moment.</p>
            <button 
              className="reset-filter-btn"
              onClick={() => setIsNewModalOpen(true)}
            >
              Add First Category
            </button>
          </div>
        )}

        {isNewModalOpen && (
          <NewCategoryModal
            isOpen={isNewModalOpen}
            onClose={() => setIsNewModalOpen(false)}
            onSubmit={handleAddCategory}
          />
        )}

        {isEditModalOpen && editingCategory && (
          <EditCategoryModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingCategory(null);
            }}
            onSubmit={handleUpdateCategory}
            category={editingCategory}
          />
        )}
      </main>
    </div>
  );
}

export default CategoryList;