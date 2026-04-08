import React, { useState, useEffect } from 'react';
import { Car, Bike, MapPin, AlertCircle, Ticket } from 'lucide-react';
import axios from 'axios';

function UserDashboard({ user }) {
  const [slots, setSlots] = useState([]);
  const [filter, setFilter] = useState('All');
  const [bookingModal, setBookingModal] = useState(null); // stores selected slot
  const [formData, setFormData] = useState({
    vehicleType: 'Four Wheeler',
    vehicleNumber: '',
    parkingDate: '',
    parkingTime: '',
    endTime: ''
  });
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/user/slots');
      setSlots(res.data);
    } catch (err) {
      console.error('Error fetching slots');
    }
  };

  const handleBookSlot = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        userId: user.id,
        slotId: bookingModal.id,
        vehicleType: bookingModal.type,
        vehicleNumber: formData.vehicleNumber.toUpperCase(),
        parkingDate: formData.parkingDate,
        parkingTime: formData.parkingTime,
        endTime: formData.endTime
      };
      const res = await axios.post('http://localhost:8080/api/user/reserve', payload);
      setBookingModal(null);
      
      // Reset form
      setFormData({
        vehicleType: 'Four Wheeler',
        vehicleNumber: '',
        parkingDate: '',
        parkingTime: '',
        endTime: ''
      });
      
      setTicket(res.data);
      fetchSlots();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Error booking slot: ' + (err.response?.data || err.message || 'System error'));
      }
    }
  };

  const filteredSlots = slots.filter(slot => filter === 'All' || slot.type === filter);

  // Set default date when opening modal
  const openModal = (slot) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const startTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    // Default end time is 1 hour later
    const later = new Date(now.getTime() + 60 * 60 * 1000);
    const endTime = later.getHours().toString().padStart(2, '0') + ':' + later.getMinutes().toString().padStart(2, '0');
    
    setFormData(prev => ({ 
      ...prev, 
      parkingDate: today,
      parkingTime: startTime,
      endTime: endTime
    }));
    setBookingModal(slot);
  };

  return (
    <div className="container" style={{ minHeight: '80vh', paddingTop: '3rem' }}>
      <div className="flex-between mb-lg animate-fade-up" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="heading-xl">DASHBOARD</h1>
          <p className="subtitle" style={{ marginLeft: 0 }}>Select an available slot to manage your booking</p>
        </div>

        <div className="flex-center" style={{ gap: '1rem' }}>
          <div className="flex-center" style={{ background: 'var(--glass-border)', padding: '0.25rem', borderRadius: '0.75rem', border: '1px solid var(--glass-border)' }}>
            {['All', 'Four Wheeler', 'Two Wheeler', 'Cycle'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  transition: 'all 0.3s ease',
                  background: filter === type ? 'var(--primary)' : 'transparent',
                  color: filter === type ? '#fff' : 'var(--text-muted)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Availability Stats Summary */}
      <div className="grid-cards animate-fade-up delay-100" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '3rem', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', borderBottom: '4px solid var(--primary)' }}>
          <p className="text-xs text-muted text-bold">TOTAL SLOTS</p>
          <h2 className="heading-lg" style={{ margin: '0.25rem 0', color: '#fff' }}>{slots.length}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', borderBottom: '4px solid var(--success)' }}>
          <p className="text-xs text-muted text-bold">AVAILABLE NOW</p>
          <h2 className="heading-lg" style={{ margin: '0.25rem 0', color: 'var(--success)' }}>{slots.filter(s => s.available).length}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', borderBottom: '4px solid var(--danger)' }}>
          <p className="text-xs text-muted text-bold">OCCUPIED</p>
          <h2 className="heading-lg" style={{ margin: '0.25rem 0', color: 'var(--danger)' }}>{slots.filter(s => !s.available).length}</h2>
        </div>
      </div>

      {ticket && (
        <div className="ticket-banner animate-fade-up">
          <div className="ticket-icon">
            <Ticket size={32} />
          </div>
          <div>
            <h3 className="heading-md" style={{ color: 'var(--accent)', marginBottom: '0.25rem' }}>Booking Confirmed!</h3>
            <p className="text-muted text-sm">Your slot has been successfully allocated.</p>
            <div className="ticket-details" style={{ flexWrap: 'wrap' }}>
              <span className="ticket-pill">Slot: {ticket.slotNumber}</span>
              <span className="ticket-pill">Vehicle: {ticket.vehicleNumber}</span>
              <span className="ticket-pill">Date: {ticket.parkingDate}</span>
              <span className="ticket-pill">Time: {ticket.parkingTime} - {new Date(ticket.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({ticket.duration} hrs)</span>
            </div>
          </div>
          <button onClick={() => setTicket(null)} className="btn btn-outline" style={{ marginLeft: 'auto', borderColor: 'var(--accent)', color: 'var(--accent)' }}>
            Close Ticket
          </button>
        </div>
      )}

      {/* Slots Layout Preview */}
      <div className="grid-cards animate-fade-up delay-100">
        {filteredSlots.map((slot) => (
          <div 
            key={slot.id} 
            className="glass-panel"
            style={{ 
              opacity: slot.available ? 1 : 0.8,
              borderColor: slot.available ? 'var(--glass-border)' : 'rgba(239, 68, 68, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div className="flex-center" style={{ height: '48px', width: '48px', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)' }}>
                {slot.type === 'Four Wheeler' ? <Car color="var(--primary)" /> : <Bike color="var(--primary)" />}
              </div>
              <span className={`badge ${slot.available ? 'badge-success' : 'badge-danger'}`}>
                {slot.available ? 'AVAILABLE' : 'OCCUPIED'}
              </span>
            </div>

            <h3 className="heading-md" style={{ marginBottom: '0.25rem' }}>{slot.slotNumber}</h3>
            <div className="flex-center gap-sm text-sm text-muted" style={{ justifyContent: 'flex-start', marginBottom: '1rem' }}>
              <MapPin size={14} /> {slot.location}
            </div>

            <div className="flex-between" style={{ marginTop: '2rem', alignItems: 'flex-end' }}>
              <div>
                <p className="text-sm text-muted text-bold" style={{ fontSize: '10px' }}>STANDARD RATE</p>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <span className="text-bold" style={{ fontSize: '1.5rem' }}>₹{slot.pricePerHour}</span>
                  <small className="text-muted" style={{ marginLeft: '4px' }}>/hr</small>
                </div>
              </div>

              {slot.available && (
                <button 
                  onClick={() => openModal(slot)}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem', borderRadius: '0.5rem' }}
                >
                  <Plus size={20} />
                </button>
              )}
            </div>

            {!slot.available && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(239, 68, 68, 0.05)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="badge badge-danger" style={{ 
                  fontSize: '1.25rem', 
                  padding: '0.5rem 1rem',
                  border: '2px solid rgba(239, 68, 68, 0.8)',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#fca5a5',
                  boxShadow: '0 8px 32px rgba(239,68,68,0.3)'
                }}>OCCUPIED</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {bookingModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <h2 className="heading-md" style={{ marginBottom: '0.5rem' }}>Reserve Slot: {bookingModal.slotNumber}</h2>
            <p className="text-sm text-muted" style={{ marginBottom: '1.5rem' }}>Confirm your vehicle details and timing to finalize booking.</p>
            
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <form onSubmit={handleBookSlot}>
              <div className="form-row" style={{ marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Booking Date</label>
                  <input 
                    type="date"
                    value={formData.parkingDate}
                    onChange={(e) => setFormData({...formData, parkingDate: e.target.value})}
                    className="form-input"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Vehicle Number</label>
                  <input 
                    type="text" 
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value.toUpperCase()})}
                    placeholder="e.g. TN 01 AB 1234" 
                    className="form-input"
                    required 
                  />
                </div>
              </div>

              <div className="form-row" style={{ alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Starting Time</label>
                  <input 
                    type="time" 
                    value={formData.parkingTime}
                    onChange={(e) => setFormData({...formData, parkingTime: e.target.value})}
                    className="form-input"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Ending Time</label>
                  <input 
                    type="time" 
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="form-input"
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Duration Preview</label>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--glass-border)' }}>
                  <div className="flex-between text-sm" style={{ marginBottom: '0.5rem' }}>
                    <span className="text-muted">Type:</span>
                    <span className="text-bold">{bookingModal.type}</span>
                  </div>
                  <div className="flex-between text-sm">
                    <span className="text-muted">Rate:</span>
                    <span className="text-bold text-gradient">₹{bookingModal.pricePerHour}/hr</span>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <button type="button" onClick={() => setBookingModal(null)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const Plus = ({ size }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
};

export default UserDashboard;
