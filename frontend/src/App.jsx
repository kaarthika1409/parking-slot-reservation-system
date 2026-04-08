import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { LogOut, User as UserIcon, ShieldCheck, LayoutDashboard, History } from 'lucide-react';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Profile from './pages/Profile';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('parking_user')));

  const handleLogout = () => {
    localStorage.removeItem('parking_user');
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen">
        {user && (
          <nav className="navbar">
            <Link to="/" className="nav-brand">
              <ShieldCheck size={28} />
              <span>PARKPOINT</span>
            </Link>
            
            <div className="nav-links">
              {user.role === 'ADMIN' ? (
                <Link to="/admin" className={`nav-item ${window.location.pathname === '/admin' ? 'active' : ''}`}>
                  <LayoutDashboard size={20} /> Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/user" className={`nav-item ${window.location.pathname === '/user' ? 'active' : ''}`}>
                    <LayoutDashboard size={20} /> Slots
                  </Link>
                  <Link to="/profile" className={`nav-item ${window.location.pathname === '/profile' ? 'active' : ''}`}>
                    <History size={20} /> My Bookings
                  </Link>
                </>
              )}
              
              <div className="nav-divider"></div>
              
              <div className="flex-center gap-md">
                <span className="text-sm text-bold">{user.fullName}</span>
                <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem' }}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </nav>
        )}

        <Routes>
          <Route path="/" element={<Home setUser={setUser} />} />
          <Route path="/login/:role" element={<Login setUser={setUser} />} />
          
          <Route path="/admin" element={
            user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/" />
          } />
          
          <Route path="/user" element={
            user?.role === 'USER' ? <UserDashboard user={user} /> : <Navigate to="/" />
          } />
          
          <Route path="/profile" element={
            user?.role === 'USER' ? <Profile user={user} /> : <Navigate to="/" />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
