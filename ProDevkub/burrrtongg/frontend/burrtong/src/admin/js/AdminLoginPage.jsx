import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { login } from '../api/authApi';
import '../../user/css/LoginPage.css';
import BurtongLogo from '../../assets/Burtong_logo.png';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      const userData = await login(email, password);
      
      if (userData.role === 'ADMIN') {
        localStorage.setItem('username', email);
        navigate('/admin/products');
      } else {
        setError('You are not authorized to access the admin panel.');
      }

    } catch (err) {
      setError(err.message || 'An error occurred during login.');
    }
  };

  return (
    <div class="login-page">
      <div class="login-container">
        <div class="logo-container">
          <img src={BurtongLogo} alt="BURTONG Logo" className="logo" />
          <h1>BURTONG - Admin</h1>
        </div>
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="login-btn">Login</button>
        </form>
        <div className="signup-link">
         <p>Not an admin? <Link to="/admin/signup">Request Admin Access</Link></p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
