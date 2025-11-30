import React, { useState, useEffect } from 'react';
import { getAllCategories } from '../api/productApi'; // Import getAllCategories
import '../css/NewProductModal.css'; // We will create this file for styling

function NewProductModal({ isOpen, onClose, onCreateProduct }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [size, setSize] = useState(''); // Add this line
  const [imageFile, setImageFile] = useState(null); // New state for image file
  const [categories, setCategories] = useState([]); // New state for categories
  const [selectedCategory, setSelectedCategory] = useState(''); // New state for selected category
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          const fetchedCategories = await getAllCategories();
          setCategories(fetchedCategories);
          if (fetchedCategories.length > 0) {
            setSelectedCategory(fetchedCategories[0].id); // Select first category by default
          }
        } catch (err) {
          console.error("Failed to fetch categories:", err);
          setError('Failed to load categories.');
        }
      };
      fetchCategories();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price || !stock || !selectedCategory) {
      setError('Name, price, stock, and category are required.');
      return;
    }

    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify({
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      size, // Add this line
      categoryId: parseInt(selectedCategory, 10),
    })], { type: 'application/json' }));
    if (imageFile) {
      formData.append('image', imageFile);
    }

    onCreateProduct(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Product</h2>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {error && <p className="error-message">{error}</p>}
          <div className="form-group">
            <label htmlFor="name">Product Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="price">Price</label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="stock">Stock</label>
            <input
              id="stock"              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="size">Size</label>
            <input
              id="size"
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="image">Product Image</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <button type="submit" className="modal-submit-btn">Create Product</button>
        </form>
      </div>
    </div>
  );
}

export default NewProductModal;
