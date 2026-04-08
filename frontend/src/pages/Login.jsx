import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, User as UserIcon, ShieldCheck, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import axios from 'axios';

function Login({ setUser }) {
  const { role } = useParams();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', fullName: '', phoneNumber: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = {
        ...formData,
        role: role.toUpperCase()
      };

      const response = await axios.post(`http://localhost:8080${endpoint}`, payload);
      
      const userData = response.data;
      localStorage.setItem('parking_user', JSON.stringify(userData));
      setUser(userData);
      navigate(role === 'admin' ? '/admin' : '/user');
    } catch (err) {
      if (!isLogin && err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(isLogin ? 'Invalid credentials. Please verify your role and details.' : 'Registration failed. Username might already exist.');
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
      <div 
        className="glass-panel animate-zoom-in" 
        style={{ width: '100%', maxWidth: '440px', position: 'relative' }}
      >
        <button 
          onClick={() => navigate('/')} 
          className="btn-outline" 
          style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', padding: '0.4rem', border: 'none' }}
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex-col flex-center mb-lg" style={{ marginTop: '1rem' }}>
          <div className="flex-center" style={{ 
            height: '64px', width: '64px', borderRadius: '50%', marginBottom: '1rem',
            background: role === 'admin' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(79, 70, 229, 0.15)',
            boxShadow: role === 'admin' ? '0 0 20px rgba(236, 72, 153, 0.3)' : '0 0 20px rgba(79, 70, 229, 0.3)'
          }}>
            {role === 'admin' ? <ShieldCheck size={32} color="var(--secondary)" /> : <UserIcon size={32} color="var(--primary)" />}
          </div>
          <h2 className="heading-ld" style={{ fontSize: '2rem', marginBottom: '0.25rem', fontFamily: "'Outfit', sans-serif" }}>
            {role.toUpperCase()} {isLogin ? 'LOGIN' : 'REGISTER'}
          </h2>
          <p className="text-muted text-sm text-center">
            {isLogin ? 'Enter your credentials to access the system' : 'Create a new account to reserve spaces'}
          </p>
        </div>

        {error && (
          <div className="alert alert-danger animate-fade-up">
            {error}
          </div>
        )}

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

        {role === 'user' && (
          <p className="text-center text-sm text-muted" style={{ marginTop: '2rem' }}>
            {isLogin ? (
              <>Don't have an account? <span onClick={toggleMode} style={{ color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }}>Register Now</span></>
            ) : (
              <>Already have an account? <span onClick={toggleMode} style={{ color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }}>Sign In</span></>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
