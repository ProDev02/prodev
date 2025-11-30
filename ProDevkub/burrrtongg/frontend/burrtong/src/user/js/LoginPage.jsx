import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { login } from '../api/authApi'; // นำเข้าฟังก์ชัน login
import '../css/LoginPage.css';
import BurtongLogo from '../../assets/Burtong_logo.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      const userData = await login(email, password);
      
      // Store user info for display
      localStorage.setItem('username', userData.username);
      localStorage.setItem('userId', userData.id);

      // ตรวจสอบ role จาก response ที่ได้
      if (userData.role === 'CUSTOMER') {
        navigate('/home'); // ไปหน้า user
      } else if (userData.role === 'ADMIN') {
        setError('Admin accounts should log in via the admin portal.');
      } else {
        // กรณีไม่มี role หรือ role ไม่ตรงกับที่คาดหวัง
        setError('Login successful, but role is undefined.');
        navigate('/home'); // หรือไปหน้า default
      }

    } catch (err) {
      setError(err.message || 'An error occurred during login.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="logo-container">
          <img src={BurtongLogo} alt="BURTONG Logo" className="logo" />
          <h1>BURTONG</h1>
        </div>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>} {/* แสดงข้อความ error */}
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
         <p>Not a member? <Link to="/signup">SIGN UP!</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;