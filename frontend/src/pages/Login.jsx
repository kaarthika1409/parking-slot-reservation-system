import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, User as UserIcon, ShieldCheck, ParkingSquare, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import axios from 'axios';

function Login({ setUser }) {
  const { role } = useParams(); // 'user' | 'owner' | 'admin'
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', fullName: '', phoneNumber: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Map URL role param → backend role string
  const roleMap = { user: 'USER', owner: 'SLOT_OWNER', admin: 'ADMIN' };
  const backendRole = roleMap[role] || 'USER';

  // Role display helpers
  const roleLabel = role === 'owner' ? 'SLOT OWNER' : role?.toUpperCase();
  const roleColor = role === 'admin' ? 'var(--secondary)' : role === 'owner' ? 'var(--success)' : 'var(--primary)';
  const roleBg = role === 'admin' ? 'rgba(236, 72, 153, 0.15)' : role === 'owner' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(79, 70, 229, 0.15)';
  const roleGlow = role === 'admin' ? 'rgba(236, 72, 153, 0.3)' : role === 'owner' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(79, 70, 229, 0.3)';

  const RoleIcon = role === 'admin' ? ShieldCheck : role === 'owner' ? ParkingSquare : UserIcon;

  // Where to redirect after login
  const dashboardPath = role === 'admin' ? '/admin' : role === 'owner' ? '/owner' : '/user';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = { ...formData, role: backendRole };

      const response = await axios.post(`http://localhost:8080${endpoint}`, payload);
      const userData = response.data;
      localStorage.setItem('parking_user', JSON.stringify(userData));
      setUser(userData);
      navigate(dashboardPath);
    } catch (err) {
      if (!isLogin && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          isLogin
            ? 'Invalid credentials. Please verify your role and details.'
            : 'Registration failed. Username might already exist.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ username: '', password: '', fullName: '', phoneNumber: '' });
  };

  return (
    <div className="container flex-center" style={{ minHeight: '80vh' }}>
      <div className="glass-panel animate-zoom-in" style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>
        <button
          onClick={() => navigate('/')}
          className="btn-outline"
          style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', padding: '0.4rem', border: 'none' }}
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex-col flex-center mb-lg" style={{ marginTop: '1rem' }}>
          <div
            className="flex-center"
            style={{
              height: '64px', width: '64px', borderRadius: '50%', marginBottom: '1rem',
              background: roleBg,
              boxShadow: `0 0 20px ${roleGlow}`
            }}
          >
            <RoleIcon size={32} color={roleColor} />
          </div>
          <h2 className="heading-ld" style={{ fontSize: '2rem', marginBottom: '0.25rem', fontFamily: "'Outfit', sans-serif" }}>
            {roleLabel} {isLogin ? 'LOGIN' : 'REGISTER'}
          </h2>
          <p className="text-muted text-sm text-center">
            {isLogin ? 'Enter your credentials to access the system' : 'Create a new account to get started'}
          </p>
        </div>

        {error && <div className="alert alert-danger animate-fade-up">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group" style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '1.1rem', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required={!isLogin}
                />
              </div>
              <div className="form-group" style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '1.1rem', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Phone Number"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  required={!isLogin}
                />
              </div>
            </>
          )}

          <div className="form-group" style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '1.1rem', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Username"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group" style={{ position: 'relative', marginBottom: '2rem' }}>
            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '1.1rem', color: 'var(--text-muted)' }} />
            <input
              type="password"
              placeholder="Password"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Processing...' : (
              isLogin ? <><LogIn size={20} /> Sign In</> : <><UserPlus size={20} /> Register</>
            )}
          </button>
        </form>

        {/* Allow register/login toggle for user and owner, not admin */}
        {(role === 'user' || role === 'owner') && (
          <p className="text-center text-sm text-muted" style={{ marginTop: '2rem' }}>
            {isLogin ? (
              <>Don't have an account? <span onClick={toggleMode} style={{ color: roleColor, fontWeight: 'bold', cursor: 'pointer' }}>Register Now</span></>
            ) : (
              <>Already have an account? <span onClick={toggleMode} style={{ color: roleColor, fontWeight: 'bold', cursor: 'pointer' }}>Sign In</span></>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
