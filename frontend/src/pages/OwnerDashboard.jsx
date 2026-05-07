import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, CheckCircle, Database, ParkingSquare, TrendingUp } from 'lucide-react';
import axios from 'axios';

function OwnerDashboard({ user }) {
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('slots'); // 'slots' | 'bookings'
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [newSlot, setNewSlot] = useState({
    parkingName: '',
    street: '',
    area: '',
    district: '',
    prefix: '',
    twoWheelerCount: 1,
    fourWheelerCount: 1,
    pricePerHour2W: 10,
    pricePerHour4W: 20,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [slotsRes, bookingsRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/owner/slots?ownerId=${user.id}`),
        axios.get(`http://localhost:8080/api/owner/bookings?ownerId=${user.id}`),
      ]);
      setSlots(slotsRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error('Error fetching owner data', err);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/owner/slots/bulk', {
        ...newSlot,
        ownerId: user.id,
        ownerName: user.fullName,
      });
      setShowSlotModal(false);
      setNewSlot({ parkingName: '', street: '', area: '', district: '', prefix: '', twoWheelerCount: 1, fourWheelerCount: 1, pricePerHour2W: 10, pricePerHour4W: 20 });
      fetchData();
    } catch (err) {
      alert('Error adding slots');
    }
  };

  const handleEditClick = (slot) => {
    setEditingSlot({ ...slot });
    setShowEditModal(true);
  };

  const handleUpdateSlot = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/owner/slots', editingSlot);
      setShowEditModal(false);
      setEditingSlot(null);
      fetchData();
    } catch (err) {
      alert('Error updating slot');
    }
  };

  const handleDeleteSlot = async (id) => {
    if (window.confirm('Are you sure you want to delete this slot?')) {
      try {
        await axios.delete(`http://localhost:8080/api/owner/slots/${id}?ownerId=${user.id}`);
        fetchData();
      } catch (err) {
        alert('Error deleting slot');
      }
    }
  };

  const handleDeleteAllSlots = async () => {
    if (window.confirm('Delete ALL your parking slots? This cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:8080/api/owner/slots?ownerId=${user.id}`);
        fetchData();
      } catch (err) {
        alert('Error deleting slots');
      }
    }
  };

  const stats = {
    total: slots.length,
    available: slots.filter((s) => s.available).length,
    occupied: slots.filter((s) => !s.available).length,
    revenue: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
  };

  const tabStyle = (tab) => ({
    padding: '0.6rem 1.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.85rem',
    transition: 'all 0.2s',
    background: activeTab === tab ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
    color: activeTab === tab ? '#fff' : 'var(--text-muted)',
  });

  return (
    <div className="container" style={{ minHeight: '80vh', paddingTop: '3rem' }}>
      {/* Header */}
      <div className="flex-between mb-lg animate-fade-up" style={{ alignItems: 'flex-end' }}>
        <div>
          <h1 className="heading-xl" style={{ color: 'var(--success)' }}>OWNER DASHBOARD</h1>
          <p className="subtitle" style={{ marginLeft: 0 }}>
            Welcome, <span style={{ color: 'var(--success)', fontWeight: 700 }}>{user.fullName}</span> — manage your parking spaces
          </p>
        </div>
        <div className="flex-center" style={{ gap: '1rem' }}>
          <button
            className="btn btn-outline"
            style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
            onClick={handleDeleteAllSlots}
          >
            <Trash size={18} /> Delete All
          </button>
          <button className="btn btn-primary" style={{ background: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => setShowSlotModal(true)}>
            <Plus size={20} /> Add Slots
          </button>
        </div>
      </div>

      {/* Stats */}
      <div
        className="animate-fade-up"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}
      >
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
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderBottom: '4px solid var(--accent)' }}>
          <p className="text-sm text-muted text-bold">TOTAL REVENUE</p>
          <h2 className="heading-xl text-gradient" style={{ margin: '0.5rem 0' }}>₹{stats.revenue.toFixed(0)}</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-center animate-fade-up delay-100" style={{ gap: '0.5rem', justifyContent: 'flex-start', marginBottom: '2rem' }}>
        <button style={tabStyle('slots')} onClick={() => setActiveTab('slots')}>
          <Database size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> My Slots
        </button>
        <button style={tabStyle('bookings')} onClick={() => setActiveTab('bookings')}>
          <CheckCircle size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> Bookings ({bookings.length})
        </button>
      </div>

      {/* Slots Tab */}
      {activeTab === 'slots' && (
        <div className="animate-fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {slots.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', gridColumn: '1/-1' }}>
              <ParkingSquare size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <p className="text-muted">No slots added yet. Click <strong>Add Slots</strong> to get started.</p>
            </div>
          ) : slots.map((slot) => (
            <div key={slot.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success)' }}>
              <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 className="heading-md" style={{ margin: 0 }}>{slot.slotNumber}</h3>
                  <p className="text-sm text-bold" style={{ color: 'var(--primary)', marginTop: '0.25rem' }}>{slot.parkingName || 'Unknown Parking'}</p>
                  <p className="text-xs text-muted" style={{ marginTop: '0.15rem' }}>
                    {[slot.street, slot.area, slot.district].filter(Boolean).join(', ') || slot.location}
                  </p>
                  <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>{slot.type}</p>
                </div>
                {slot.available
                  ? <span className="badge badge-success">AVAILABLE</span>
                  : <span className="badge badge-danger">OCCUPIED</span>}
              </div>
              <div className="flex-between" style={{ marginTop: '1.5rem' }}>
                <span className="text-bold text-gradient" style={{ fontSize: '1.25rem' }}>₹{slot.pricePerHour}/hr</span>
                <div className="flex-center" style={{ gap: '0.5rem' }}>
                  <button
                    onClick={() => handleEditClick(slot)}
                    style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer' }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="animate-fade-up flex-col" style={{ gap: '1rem' }}>
          {bookings.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <TrendingUp size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <p className="text-muted">No bookings yet on your slots.</p>
            </div>
          ) : bookings.map((booking) => (
            <div key={booking.id} className="glass-panel flex-col" style={{ padding: '1.25rem', gap: '0.75rem' }}>
              <div className="flex-between">
                <span className="text-sm text-muted text-bold">#{booking.id.slice(-6).toUpperCase()}</span>
                <div className="flex-center" style={{ gap: '0.5rem' }}>
                  <span className="badge" style={{
                    fontSize: '0.7rem',
                    background: booking.bookingStatus === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: booking.bookingStatus === 'ACTIVE' ? 'var(--success)' : 'var(--danger)'
                  }}>{booking.bookingStatus}</span>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.7rem' }}>
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem', fontSize: '1.1rem' }}>{booking.username || 'User'}</h4>
                <div className="flex-center text-sm text-muted" style={{ justifyContent: 'flex-start', gap: '1rem', marginTop: '0.25rem' }}>
                  <span>Vehicle: <span className="text-bold" style={{ color: '#fff' }}>{booking.vehicleNumber}</span></span>
                  <span>Slot: <span className="text-bold" style={{ color: 'var(--success)' }}>{booking.slotNumber}</span></span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <div>
                  <p className="text-xs text-muted" style={{ marginBottom: '0.1rem' }}>Date</p>
                  <p className="text-sm text-bold" style={{ color: '#fff' }}>{booking.parkingDate || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted" style={{ marginBottom: '0.1rem' }}>Time</p>
                  <p className="text-sm text-bold" style={{ color: '#fff' }}>{booking.parkingTime}</p>
                </div>
                <div>
                  <p className="text-xs text-muted" style={{ marginBottom: '0.1rem' }}>Duration</p>
                  <p className="text-sm text-bold" style={{ color: '#fff' }}>{booking.duration} hr(s)</p>
                </div>
                <div>
                  <p className="text-xs text-muted" style={{ marginBottom: '0.1rem' }}>Amount</p>
                  <p className="text-sm text-bold text-gradient">₹{booking.totalAmount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Slots Modal */}
      {showSlotModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <h2 className="heading-md" style={{ marginBottom: '1.5rem' }}>Add New Parking Slots</h2>
            <form onSubmit={handleAddSlot}>
              <div className="form-row" style={{ marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Parking Name</label>
                  <input type="text" className="form-input" value={newSlot.parkingName}
                    onChange={(e) => setNewSlot({ ...newSlot, parkingName: e.target.value })}
                    placeholder="e.g. City Center Mall" required />
                </div>
                <div className="form-group">
                  <label className="form-label">District</label>
                  <input type="text" className="form-input" value={newSlot.district}
                    onChange={(e) => setNewSlot({ ...newSlot, district: e.target.value })}
                    placeholder="e.g. Chennai" required />
                </div>
              </div>
              <div className="form-row" style={{ marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Area</label>
                  <input type="text" className="form-input" value={newSlot.area}
                    onChange={(e) => setNewSlot({ ...newSlot, area: e.target.value })}
                    placeholder="e.g. T. Nagar" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Street</label>
                  <input type="text" className="form-input" value={newSlot.street}
                    onChange={(e) => setNewSlot({ ...newSlot, street: e.target.value })}
                    placeholder="e.g. Pondy Bazaar" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Slot Name Prefix</label>
                <input type="text" className="form-input" value={newSlot.prefix}
                  onChange={(e) => setNewSlot({ ...newSlot, prefix: e.target.value.toUpperCase() })}
                  placeholder="e.g. BLK-A" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div style={{ background: 'rgba(59,130,246,0.05)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(59,130,246,0.1)' }}>
                  <h3 className="text-sm text-bold mb-sm" style={{ color: 'var(--primary)' }}>2 WHEELERS</h3>
                  <div className="form-group">
                    <label className="form-label">Count</label>
                    <input type="number" className="form-input" value={newSlot.twoWheelerCount}
                      onChange={(e) => setNewSlot({ ...newSlot, twoWheelerCount: parseInt(e.target.value) || 0 })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price/Hr (₹)</label>
                    <input type="number" className="form-input" value={newSlot.pricePerHour2W}
                      onChange={(e) => setNewSlot({ ...newSlot, pricePerHour2W: parseFloat(e.target.value) || 0 })} required />
                  </div>
                </div>
                <div style={{ background: 'rgba(139,92,246,0.05)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(139,92,246,0.1)' }}>
                  <h3 className="text-sm text-bold mb-sm" style={{ color: 'var(--accent)' }}>4 WHEELERS</h3>
                  <div className="form-group">
                    <label className="form-label">Count</label>
                    <input type="number" className="form-input" value={newSlot.fourWheelerCount}
                      onChange={(e) => setNewSlot({ ...newSlot, fourWheelerCount: parseInt(e.target.value) || 0 })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price/Hr (₹)</label>
                    <input type="number" className="form-input" value={newSlot.pricePerHour4W}
                      onChange={(e) => setNewSlot({ ...newSlot, pricePerHour4W: parseFloat(e.target.value) || 0 })} required />
                  </div>
                </div>
              </div>
              <div className="form-row" style={{ marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowSlotModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--success)', borderColor: 'var(--success)' }}>Add All Slots</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Slot Modal */}
      {showEditModal && editingSlot && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ maxWidth: '400px' }}>
            <h2 className="heading-md" style={{ marginBottom: '1.5rem' }}>Edit Slot {editingSlot.slotNumber}</h2>
            <form onSubmit={handleUpdateSlot}>
              <div className="form-group">
                <label className="form-label">Parking Name</label>
                <input type="text" className="form-input" value={editingSlot.parkingName || ''}
                  onChange={(e) => setEditingSlot({ ...editingSlot, parkingName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">District</label>
                <input type="text" className="form-input" value={editingSlot.district || ''}
                  onChange={(e) => setEditingSlot({ ...editingSlot, district: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Area</label>
                <input type="text" className="form-input" value={editingSlot.area || ''}
                  onChange={(e) => setEditingSlot({ ...editingSlot, area: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Street</label>
                <input type="text" className="form-input" value={editingSlot.street || ''}
                  onChange={(e) => setEditingSlot({ ...editingSlot, street: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Slot Number</label>
                <input type="text" className="form-input" value={editingSlot.slotNumber}
                  onChange={(e) => setEditingSlot({ ...editingSlot, slotNumber: e.target.value.toUpperCase() })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-input" value={editingSlot.type}
                  onChange={(e) => setEditingSlot({ ...editingSlot, type: e.target.value })} required>
                  <option value="Two Wheeler">Two Wheeler</option>
                  <option value="Four Wheeler">Four Wheeler</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price/Hr (₹)</label>
                <input type="number" className="form-input" value={editingSlot.pricePerHour}
                  onChange={(e) => setEditingSlot({ ...editingSlot, pricePerHour: parseFloat(e.target.value) || 0 })} required />
              </div>
              <div className="form-row" style={{ marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
