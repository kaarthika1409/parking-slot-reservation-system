import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { LogOut, User as UserIcon, ShieldCheck, LayoutDashboard, History, ParkingSquare, TrendingUp } from 'lucide-react';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import Profile from './pages/Profile';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('parking_user')));

  const handleLogout = () => {
    localStorage.removeItem('parking_user');
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isOwner = user?.role === 'SLOT_OWNER';
  const isUser = user?.role === 'USER';

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
              {isAdmin && (
                <Link to="/admin" className={`nav-item ${window.location.pathname === '/admin' ? 'active' : ''}`}>
                  <LayoutDashboard size={20} /> Dashboard
                </Link>
              )}

              {isOwner && (
                <>
                  <Link to="/owner" className={`nav-item ${window.location.pathname === '/owner' ? 'active' : ''}`}>
                    <ParkingSquare size={20} /> My Slots
                  </Link>
                </>
              )}

              {isUser && (
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
                {/* Role badge */}
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '1rem',
                  background: isAdmin ? 'rgba(236,72,153,0.15)' : isOwner ? 'rgba(16,185,129,0.15)' : 'rgba(79,70,229,0.15)',
                  color: isAdmin ? 'var(--secondary)' : isOwner ? 'var(--success)' : 'var(--primary)',
                }}>
                  {isAdmin ? 'ADMIN' : isOwner ? 'OWNER' : 'USER'}
                </span>
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
            isAdmin ? <AdminDashboard /> : <Navigate to="/" />
          } />

          <Route path="/owner" element={
            isOwner ? <OwnerDashboard user={user} /> : <Navigate to="/" />
          } />

          <Route path="/user" element={
            isUser ? <UserDashboard user={user} /> : <Navigate to="/" />
          } />

          <Route path="/profile" element={
            isUser ? <Profile user={user} /> : <Navigate to="/" />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
