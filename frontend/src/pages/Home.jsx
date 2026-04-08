import React from 'react';
import { ShieldCheck, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="container flex-col flex-center" style={{ minHeight: '80vh', textAlign: 'center' }}>
      <div className="animate-fade-up">
        <h1 className="heading-xl text-gradient">SMART PARKING SOLUTION</h1>
        <p className="subtitle mb-lg">
          Smart parking solution for modern mobility. Check real-time availability and reserve your parking slot instantly. </p>
      </div>

      <div className="grid-cards animate-fade-up delay-200" style={{ width: '100%', maxWidth: '900px', marginTop: '2rem' }}>
        <div 
          className="glass-panel flex-col flex-center"
          style={{ gap: '1.5rem', cursor: 'pointer' }}
          onClick={() => navigate('/login/user')}
        >
          <div className="flex-center" style={{ width: '80px', height: '80px', borderRadius: '1.5rem', background: 'rgba(79, 70, 229, 0.15)' }}>
            <User size={40} color="var(--primary)" />
          </div>
          <div>
            <h2 className="heading-md">USER PORTAL</h2>
            <p className="text-muted text-sm">Find slots, book reservations, and track history</p>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }}>
            Login as User <ArrowRight size={18} />
          </button>
        </div>

        <div 
          className="glass-panel flex-col flex-center"
          style={{ gap: '1.5rem', cursor: 'pointer', borderColor: 'var(--secondary)' }}
          onClick={() => navigate('/login/admin')}
        >
          <div className="flex-center" style={{ width: '80px', height: '80px', borderRadius: '1.5rem', background: 'rgba(236, 72, 153, 0.15)' }}>
            <ShieldCheck size={40} color="var(--secondary)" />
          </div>
          <div>
            <h2 className="heading-md">ADMIN PORTAL</h2>
            <p className="text-muted text-sm">Manage slots, pricing, and monitor occupancy</p>
          </div>
          <button className="btn btn-outline" style={{ width: '100%', marginTop: 'auto', borderColor: 'var(--secondary)', color: 'var(--secondary)' }}>
            Login as Admin <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
