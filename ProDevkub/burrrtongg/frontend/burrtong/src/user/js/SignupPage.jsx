import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api/authApi'; // Import the signup function
import '../css/SignupPage.css';
import BurtongLogo from '../../assets/Burtong_logo.png';

function SignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(''); // For general API errors

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setGeneralError(''); // Clear general error on input change
  };

  const handleSubmit = async (e) => { // Make handleSubmit async
    e.preventDefault();
    let newErrors = {};

    if (!formData.email) newErrors.email = "Please enter your email";
    if (!formData.password) newErrors.password = "Please enter your password";
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please enter your confirm password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password and Confirm Password do not match";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await signup(formData.email, formData.password);
        alert('Registration successful! Please log in.'); // Show success message
        navigate("/"); // Go to Login page
      } catch (err) {
        setGeneralError(err.message || 'An error occurred during registration.');
      }
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <img src={BurtongLogo} alt="Burrtong" className="logo" />
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          {generalError && <p className="error">{generalError}</p>} {/* Display general API error */}
          <div className="input-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>
          <div className="input-group">
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
            {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
          </div>
          <button type="submit" className="signup-button">Sign up</button>
        </form>
        <p className="login-link">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;