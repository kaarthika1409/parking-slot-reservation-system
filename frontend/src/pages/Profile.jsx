import React, { useState, useEffect } from 'react';
import { History, CreditCard, CheckCircle, Clock, AlertCircle, TrendingUp, Info } from 'lucide-react';
import axios from 'axios';

function Profile({ user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/user/history?userId=${user.id}`);
      setHistory(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching history');
      setLoading(false);
    }
  };

  const handlePayment = async (bookingId) => {
    try {
      await axios.post(`http://localhost:8080/api/user/pay?bookingId=${bookingId}`);
      fetchHistory();
      alert('Payment Successful! Thank you for using PARKPOINT.');
    } catch (err) {
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="container" style={{ minHeight: '80vh', paddingTop: '3rem' }}>
      <div className="mb-lg animate-fade-up">
        <h1 className="heading-xl">MY BOOKINGS</h1>
        <p className="subtitle" style={{ marginLeft: 0 }}>View your reservation history and manage payments</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 3fr', gap: '2rem' }} className="animate-fade-up delay-100">
        {/* User Stats Card */}
        <div>
          <div className="glass-panel flex-col flex-center" style={{ position: 'sticky', top: '120px' }}>
            <div className="flex-center" style={{ 
              height: '100px', width: '100px', borderRadius: '50%', marginBottom: '1rem', 
              background: 'rgba(79, 70, 229, 0.15)', border: '2px solid rgba(79, 70, 229, 0.3)'
            }}>
              <span className="heading-ld text-gradient" style={{ fontSize: '3rem', margin: 0 }}>{user.fullName.charAt(0)}</span>
            </div>
            <h3 className="heading-md">{user.fullName}</h3>
            <p className="text-muted text-sm mb-lg">{user.username}</p>
            
            <div style={{ width: '100%', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
              <div className="flex-between" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1rem', borderRadius: '0.75rem', marginBottom: '0.5rem' }}>
                <span className="text-sm text-muted text-bold" style={{ textTransform: 'uppercase' }}>Total Bookings</span>
                <span className="text-bold">{history.length}</span>
              </div>
              <div className="flex-between" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1rem', borderRadius: '0.75rem' }}>
                <span className="text-sm text-muted text-bold" style={{ textTransform: 'uppercase' }}>Active Status</span>
                <span className="text-bold" style={{ color: 'var(--accent)' }}>Verified</span>
              </div>
            </div>
            
            <button className="btn btn-outline" style={{ width: '100%', marginTop: '2rem', borderColor: 'rgba(255,255,255,0.1)' }}>
              Edit Account
            </button>
          </div>
        </div>

        {/* History Table */}
        <div>
          {loading ? (
            <div className="flex-center" style={{ padding: '4rem 0' }}>
              <TrendingUp size={48} color="var(--primary)" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
            </div>
          ) : history.length === 0 ? (
            <div className="glass-panel flex-col flex-center text-center" style={{ padding: '5rem 2rem', borderStyle: 'dashed' }}>
              <Info size={40} className="text-muted" style={{ marginBottom: '1rem' }} />
              <h3 className="heading-md">No Reservations Found</h3>
              <p className="text-muted mb-lg">You haven't booked any slots yet. Head over to the dashboard to start.</p>
              <button className="btn btn-primary">Book My First Slot</button>
            </div>
          ) : (
            <div className="flex-col gap-md">
              {history.map((booking) => (
                <div key={booking.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div className="flex-center" style={{ gap: '1.5rem' }}>
                    <div className="flex-center" style={{ height: '60px', width: '60px', borderRadius: '1rem', background: 'rgba(255,255,255,0.05)' }}>
                      <History size={28} color="var(--secondary)" />
                    </div>
                    <div>
                      <h3 className="heading-md" style={{ marginBottom: 0 }}>{booking.slotNumber}</h3>
                      <p className="text-sm text-muted" style={{ fontFamily: 'monospace', letterSpacing: '2px' }}>{booking.vehicleNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex-col" style={{ alignItems: 'flex-start' }}>
                    <div className="flex-center gap-sm text-sm text-muted mb-sm">
                      <Clock size={16} /> {booking.parkingDate || new Date(booking.startTime).toLocaleDateString()} at {booking.parkingTime}
                    </div>
                    {booking.paymentStatus === 'PAID' ? (
                        <span className="badge badge-success">PAID</span>
                    ) : (
                        <span className="badge badge-danger">PENDING</span>
                    )}
                  </div>
                  
                  <div className="flex-center" style={{ gap: '2rem', paddingLeft: '2rem', borderLeft: '1px solid var(--glass-border)' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p className="text-sm text-muted text-bold" style={{ fontSize: '10px' }}>AMOUNT</p>
                      <p className="heading-md" style={{ margin: 0, fontSize: '1.75rem' }}>₹{booking.totalAmount || 150}</p>
                    </div>
                    
                    {booking.paymentStatus === 'PENDING' ? (
                      <button 
                        onClick={() => handlePayment(booking.id)}
                        className="btn btn-primary"
                        style={{ padding: '0.6rem 1.2rem' }}
                      >
                        <CreditCard size={18} /> Pay Now
                      </button>
                    ) : (
                      <div className="flex-center gap-sm" style={{ padding: '0.6rem 1.2rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)', borderRadius: '0.5rem', fontWeight: 600 }}>
                        <CheckCircle size={18} /> Receipt
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
