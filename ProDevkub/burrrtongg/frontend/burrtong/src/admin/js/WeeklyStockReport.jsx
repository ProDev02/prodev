
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/ProductList.css'; // Reusing the same CSS for consistency
import '../css/StockReport.css'; // Progress bar styles
import BurtongLogo from '../../assets/Burtong_logo.png';
import { getWeeklyStockReport } from '../api/productApi';

function WeeklyStockReport() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const username = localStorage.getItem('username') || 'Admin';

  useEffect(() => {
    const fetchWeeklyStockReport = async () => {
      try {
        setLoading(true);
        const data = await getWeeklyStockReport();
        setReportData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setReportData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyStockReport();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
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
          <h1 className="main-title">Weekly Stock Report (Last 7 Days)</h1>
        </header>

        {loading && <p>Loading report...</p>}
        {error && <p className="error-message">Error: {error}</p>}

        {!loading && !error && (
          <table className="product-table"> {/* Reusing product-table style */}
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Current Stock</th>
                <th>Total Orders (7 Days)</th>
                <th>Accepted Orders (7 Days)</th>
                <th>Pending Orders (7 Days)</th>
                <th>Denied Orders (7 Days)</th>
                <th>Order Progress</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item) => {
                const totalOrders = item.totalOrders || 0;
                const acceptedOrders = item.acceptedOrders || 0;
                const pendingOrders = item.pendingOrders || 0;
                const deniedOrders = item.deniedOrders || 0;
                
                const acceptedPercentage = totalOrders > 0 ? (acceptedOrders / totalOrders) * 100 : 0;
                const pendingPercentage = totalOrders > 0 ? (pendingOrders / totalOrders) * 100 : 0;
                const deniedPercentage = totalOrders > 0 ? (deniedOrders / totalOrders) * 100 : 0;
                
                return (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.productName}</td>
                    <td>{item.currentStock}</td>
                    <td>{totalOrders}</td>
                    <td>{acceptedOrders}</td>
                    <td>{pendingOrders}</td>
                    <td>{deniedOrders}</td>
                    <td>
                      <div className="progress-container">
                        <div className="progress-bar">
                          <div 
                            className="progress-accepted" 
                            style={{ width: `${acceptedPercentage}%` }}
                          ></div>
                          <div 
                            className="progress-pending" 
                            style={{ 
                              width: `${pendingPercentage}%`, 
                              marginLeft: `${acceptedPercentage}%` 
                            }}
                          ></div>
                          <div 
                            className="progress-denied" 
                            style={{ 
                              width: `${deniedPercentage}%`, 
                              marginLeft: `${acceptedPercentage + pendingPercentage}%` 
                            }}
                          ></div>
                        </div>
                        <div className="progress-labels">
                          <span className="accepted-label">Accepted: {acceptedPercentage.toFixed(1)}%</span>
                          <span className="pending-label">Pending: {pendingPercentage.toFixed(1)}%</span>
                          <span className="denied-label">Denied: {deniedPercentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

export default WeeklyStockReport;
