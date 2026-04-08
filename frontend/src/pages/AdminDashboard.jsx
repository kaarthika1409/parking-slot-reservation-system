import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, CheckCircle, Database, Eye } from 'lucide-react';
import axios from 'axios';

function AdminDashboard() {
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [newSlot, setNewSlot] = useState({ 
    location: 'Common Area',
    prefix: 'STC',
    twoWheelerCount: 1,
    fourWheelerCount: 1,
    pricePerHour2W: 10,
    pricePerHour4W: 20
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const slotsRes = await axios.get('http://localhost:8080/api/admin/slots');
      const bookingsRes = await axios.get('http://localhost:8080/api/admin/bookings');
      setSlots(slotsRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error('Error fetching data');
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/admin/slots/bulk', newSlot);
      setShowSlotModal(false);
      setNewSlot({ 
        location: 'Common Area',
        prefix: 'STC',
        twoWheelerCount: 1,
        fourWheelerCount: 1,
        pricePerHour2W: 10,
        pricePerHour4W: 20
      });
      fetchData();
    } catch (err) {
      alert('Error adding slots');
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm("Are you sure you want to delete ALL parking slots? This action cannot be undone.")) {
      try {
        await axios.delete('http://localhost:8080/api/admin/slots');
        fetchData();
      } catch (err) {
        alert('Error deleting slots');
      }
    }
  };

  const handleDeleteAllBookings = async () => {
    if (window.confirm("Are you sure you want to delete ALL booking history? This action cannot be undone.")) {
      try {
        await axios.delete('http://localhost:8080/api/admin/bookings');
        fetchData();
      } catch (err) {
        alert('Error deleting bookings');
      }
    }
  };

  const stats = {
    total: slots.length,
    available: slots.filter(s => s.available).length,
    occupied: slots.filter(s => !s.available).length
  };

  return (
    <div className="container" style={{ minHeight: '80vh', paddingTop: '3rem' }}>
      <div className="flex-between mb-lg animate-fade-up" style={{ alignItems: 'flex-end' }}>
        <div>
          <h1 className="heading-xl">ADMIN DASHBOARD</h1>
          <p className="subtitle" style={{ marginLeft: 0 }}>Manage parking infrastructure and monitor usage</p>
        </div>
        <div className="flex-center" style={{ gap: '1rem' }}>
          <button 
            className="btn btn-outline"
            style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
            onClick={handleDeleteAll}
          >
            <Trash size={20} /> Delete All Slots
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowSlotModal(true)}
          >
            <Plus size={20} /> Add Slots
          </button>
        </div>
      </div>

      {/* Stats Summary Banner */}
      <div className="grid-cards animate-fade-up" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '3rem', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderBottom: '4px solid var(--primary)' }}>
          <p className="text-sm text-muted text-bold">TOTAL SLOTS</p>
          <h2 className="heading-xl" style={{ margin: '0.5rem 0', color: '#fff' }}>{stats.total}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderBottom: '4px solid var(--success)' }}>
          <p className="text-sm text-muted text-bold">AVAILABLE</p>
          <h2 className="heading-xl" style={{ margin: '0.5rem 0', color: 'var(--success)' }}>{stats.available}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderBottom: '4px solid var(--danger)' }}>
          <p className="text-sm text-muted text-bold">OCCUPIED</p>
          <h2 className="heading-xl" style={{ margin: '0.5rem 0', color: 'var(--danger)' }}>{stats.occupied}</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 2fr) 1fr', gap: '3rem' }} className="animate-fade-up delay-100">
        {/* Slot Management */}
        <div>
          <div className="flex-center" style={{ gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'flex-start' }}>
            <Database color="var(--primary)" />
            <h2 className="heading-md" style={{ margin: 0 }}>Parking Slots</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {slots.map((slot) => (
              <div key={slot.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 className="heading-md" style={{ margin: 0 }}>{slot.slotNumber}</h3>
                    <p className="text-sm text-muted">{slot.location}</p>
                  </div>
                  {slot.available ? (
                    <span className="badge badge-success">AVAILABLE</span>
                  ) : (
                    <span className="badge badge-danger">OCCUPIED</span>
                  )}
                </div>
                
                <div className="flex-between" style={{ marginTop: '1.5rem' }}>
                  <span className="text-bold text-gradient" style={{ fontSize: '1.25rem' }}>₹{slot.pricePerHour}/hr</span>
                  <div className="flex-center" style={{ gap: '0.5rem' }}>
                    <button style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer' }}>
                      <Edit size={16} />
                    </button>
                    <button style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <div className="flex-center" style={{ gap: '0.5rem', justifyContent: 'flex-start' }}>
              <CheckCircle color="var(--accent)" />
              <h2 className="heading-md" style={{ margin: 0 }}>Recent Bookings</h2>
            </div>
            <button 
              className="btn btn-outline"
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
              onClick={handleDeleteAllBookings}
            >
              Clear All
            </button>
          </div>
          
          <div className="flex-col" style={{ gap: '1rem' }}>
            {bookings.map((booking) => (
              <div key={booking.id} className="glass-panel flex-col" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', gap: '0.75rem' }}>
                <div className="flex-between">
                  <span className="text-sm text-muted text-bold">#{booking.id.slice(-6).toUpperCase()}</span>
                  <div className="flex-center" style={{ gap: '0.5rem' }}>
                    <span className={`badge`} style={{ 
                      fontSize: '0.7rem', 
                      background: booking.bookingStatus === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: booking.bookingStatus === 'ACTIVE' ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {booking.bookingStatus || 'ACTIVE'}
                    </span>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.7rem' }}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem', fontSize: '1.1rem' }}>{booking.username || 'User'}</h4>
                  <div className="flex-center text-sm text-muted" style={{ justifyContent: 'flex-start', gap: '1rem', marginTop: '0.25rem' }}>
                    <span>Vehicle: <span className="text-bold" style={{ color: '#fff' }}>{booking.vehicleNumber}</span></span>
                    <span>Slot: <span className="text-bold" style={{ color: 'var(--accent)' }}>{booking.slotNumber}</span></span>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1.5fr) 1fr', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                  <div>
                    <p className="text-xs text-muted" style={{ marginBottom: '0.1rem' }}>Booked Timing</p>
                    <p className="text-sm text-bold" style={{ color: '#fff' }}>
                      {booking.parkingTime} - {booking.endTime ? new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="text-xs text-muted" style={{ marginBottom: '0.1rem' }}>Date</p>
                    <p className="text-sm text-bold" style={{ color: '#fff' }}>{booking.parkingDate || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted" style={{ marginBottom: '0.1rem' }}>Duration</p>
                    <p className="text-sm text-bold" style={{ color: '#fff' }}>{booking.duration} hr(s)</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="text-xs text-muted" style={{ marginBottom: '0.1rem' }}>Total Amount</p>
                    <p className="text-sm text-bold text-gradient">₹{booking.totalAmount}</p>
                  </div>
                </div>

                <div className="flex-between" style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                  <span className="text-sm text-bold" style={{ color: 'var(--accent)' }}>Slot {booking.slotNumber}</span>
                  <Eye size={16} className="text-muted" style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showSlotModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <h2 className="heading-md" style={{ marginBottom: '1.5rem' }}>Add New Parking Slot</h2>
            <form onSubmit={handleAddSlot}>
              <div className="form-group">
                <label className="form-label">Area / Location</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={newSlot.location}
                  onChange={(e) => setNewSlot({...newSlot, location: e.target.value})}
                  placeholder="e.g. Common Area" 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Slot Name Prefix</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={newSlot.prefix}
                  onChange={(e) => setNewSlot({...newSlot, prefix: e.target.value.toUpperCase()})}
                  placeholder="e.g. STC" 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                  <h3 className="text-sm text-bold mb-sm" style={{ color: 'var(--primary)' }}>2 WHEELERS</h3>
                  <div className="form-group">
                    <label className="form-label">Count</label>
                    <input 
                      type="number" 
                      className="form-input"
                      value={newSlot.twoWheelerCount}
                      onChange={(e) => setNewSlot({...newSlot, twoWheelerCount: parseInt(e.target.value) || 0})}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price/Hr (₹)</label>
                    <input 
                      type="number" 
                      className="form-input"
                      value={newSlot.pricePerHour2W}
                      onChange={(e) => setNewSlot({...newSlot, pricePerHour2W: parseFloat(e.target.value) || 0})}
                      required 
                    />
                  </div>
                </div>

                <div style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                  <h3 className="text-sm text-bold mb-sm" style={{ color: 'var(--accent)' }}>4 WHEELERS</h3>
                  <div className="form-group">
                    <label className="form-label">Count</label>
                    <input 
                      type="number" 
                      className="form-input"
                      value={newSlot.fourWheelerCount}
                      onChange={(e) => setNewSlot({...newSlot, fourWheelerCount: parseInt(e.target.value) || 0})}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price/Hr (₹)</label>
                    <input 
                      type="number" 
                      className="form-input"
                      value={newSlot.pricePerHour4W}
                      onChange={(e) => setNewSlot({...newSlot, pricePerHour4W: parseFloat(e.target.value) || 0})}
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="form-row" style={{ marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowSlotModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Add All Slots</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
