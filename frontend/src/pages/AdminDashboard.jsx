import React, { useState, useEffect } from 'react';
import { Users, Trash, ShieldCheck, User as UserIcon, ParkingSquare, CheckCircle, Eye } from 'lucide-react';
import axios from 'axios';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'slots' | 'bookings'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, slotsRes, bookingsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/admin/users'),
        axios.get('http://localhost:8080/api/admin/slots'),
        axios.get('http://localhost:8080/api/admin/bookings'),
      ]);
      setUsers(usersRes.data);
      setSlots(slotsRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error('Error fetching admin data', err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Remove this user from the system?')) {
      try {
        await axios.delete(`http://localhost:8080/api/admin/users/${id}`);
        fetchData();
      } catch (err) {
        alert('Error deleting user');
      }
    }
  };

  const handleClearBookings = async () => {
    if (window.confirm('Delete ALL booking history? This cannot be undone.')) {
      try {
        await axios.delete('http://localhost:8080/api/admin/bookings');
        fetchData();
      } catch (err) {
        alert('Error clearing bookings');
      }
    }
  };

  const owners = users.filter((u) => u.role === 'SLOT_OWNER');
  const regularUsers = users.filter((u) => u.role === 'USER');

  const stats = {
    totalUsers: users.length,
    owners: owners.length,
    users: regularUsers.length,
    slots: slots.length,
    bookings: bookings.length,
  };

  const tabStyle = (tab) => ({
    padding: '0.6rem 1.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.85rem',
    transition: 'all 0.2s',
    background: activeTab === tab ? 'var(--secondary)' : 'rgba(255,255,255,0.05)',
    color: activeTab === tab ? '#fff' : 'var(--text-muted)',
  });

  const roleBadge = (role) => {
    if (role === 'SLOT_OWNER') return { label: 'SLOT OWNER', bg: 'rgba(16,185,129,0.15)', color: 'var(--success)' };
    if (role === 'ADMIN') return { label: 'ADMIN', bg: 'rgba(236,72,153,0.15)', color: 'var(--secondary)' };
    return { label: 'USER', bg: 'rgba(79,70,229,0.15)', color: 'var(--primary)' };
  };

  const UserCard = ({ user }) => {
    const badge = roleBadge(user.role);
    return (
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div className="flex-center" style={{ gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {user.role === 'SLOT_OWNER'
              ? <ParkingSquare size={22} color={badge.color} />
              : <UserIcon size={22} color={badge.color} />}
          </div>
          <div>
            <p className="text-bold" style={{ color: '#fff', marginBottom: '0.2rem' }}>{user.fullName || 'N/A'}</p>
            <p className="text-sm text-muted">@{user.username}</p>
            {user.phoneNumber && <p className="text-sm text-muted">{user.phoneNumber}</p>}
          </div>
        </div>
        <div className="flex-center" style={{ gap: '0.75rem' }}>
          <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.72rem', fontWeight: 700, background: badge.bg, color: badge.color }}>
            {badge.label}
          </span>
          <button
            onClick={() => handleDeleteUser(user.id)}
            style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(239,68,68,0.1)', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
          >
            <Trash size={15} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container" style={{ minHeight: '80vh', paddingTop: '3rem' }}>
      {/* Header */}
      <div className="flex-between mb-lg animate-fade-up" style={{ alignItems: 'flex-end' }}>
        <div>
          <h1 className="heading-xl">ADMIN DASHBOARD</h1>
          <p className="subtitle" style={{ marginLeft: 0 }}>Manage slot owners, users and oversee system activity</p>
        </div>
      </div>

      {/* Stats */}
      <div className="animate-fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.2rem', marginBottom: '3rem' }}>
        {[
          { label: 'TOTAL USERS', value: stats.totalUsers, color: 'var(--primary)' },
          { label: 'SLOT OWNERS', value: stats.owners, color: 'var(--success)' },
          { label: 'REGULAR USERS', value: stats.users, color: 'var(--accent)' },
          { label: 'TOTAL SLOTS', value: stats.slots, color: 'var(--secondary)' },
          { label: 'BOOKINGS', value: stats.bookings, color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', borderBottom: `4px solid ${color}` }}>
            <p className="text-sm text-muted text-bold">{label}</p>
            <h2 className="heading-xl" style={{ margin: '0.5rem 0', color }}>{value}</h2>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex-center animate-fade-up delay-100" style={{ gap: '0.5rem', justifyContent: 'flex-start', marginBottom: '2rem' }}>
        <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>
          <Users size={15} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> Users ({users.length})
        </button>
        <button style={tabStyle('slots')} onClick={() => setActiveTab('slots')}>
          <ParkingSquare size={15} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> All Slots ({slots.length})
        </button>
        <button style={tabStyle('bookings')} onClick={() => setActiveTab('bookings')}>
          <CheckCircle size={15} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> Bookings ({bookings.length})
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="animate-fade-up">
          {owners.length > 0 && (
            <>
              <div className="flex-center" style={{ gap: '0.5rem', justifyContent: 'flex-start', marginBottom: '1rem' }}>
                <ParkingSquare size={18} color="var(--success)" />
                <h3 className="heading-md" style={{ margin: 0 }}>Slot Owners</h3>
              </div>
              <div className="flex-col" style={{ gap: '0.75rem', marginBottom: '2rem' }}>
                {owners.map((u) => <UserCard key={u.id} user={u} />)}
              </div>
            </>
          )}

          {regularUsers.length > 0 && (
            <>
              <div className="flex-center" style={{ gap: '0.5rem', justifyContent: 'flex-start', marginBottom: '1rem' }}>
                <UserIcon size={18} color="var(--primary)" />
                <h3 className="heading-md" style={{ margin: 0 }}>Regular Users</h3>
              </div>
              <div className="flex-col" style={{ gap: '0.75rem' }}>
                {regularUsers.map((u) => <UserCard key={u.id} user={u} />)}
              </div>
            </>
          )}

          {users.length === 0 && (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <Users size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <p className="text-muted">No users registered yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Slots Tab (read-only oversight) */}
      {activeTab === 'slots' && (
        <div className="animate-fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {slots.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', gridColumn: '1/-1' }}>
              <ParkingSquare size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <p className="text-muted">No parking slots in the system yet.</p>
            </div>
          ) : slots.map((slot) => (
            <div key={slot.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--secondary)' }}>
              <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 className="heading-md" style={{ margin: 0 }}>{slot.slotNumber}</h3>
                  <p className="text-sm text-muted">{slot.location}</p>
                  {slot.ownerName && (
                    <p className="text-sm" style={{ color: 'var(--success)', marginTop: '0.25rem' }}>
                      Owner: {slot.ownerName}
                    </p>
                  )}
                </div>
                {slot.available
                  ? <span className="badge badge-success">AVAILABLE</span>
                  : <span className="badge badge-danger">OCCUPIED</span>}
              </div>
              <span className="text-bold text-gradient" style={{ fontSize: '1.1rem' }}>₹{slot.pricePerHour}/hr</span>
            </div>
          ))}
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="animate-fade-up">
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h3 className="heading-md" style={{ margin: 0 }}>All Bookings</h3>
            <button
              className="btn btn-outline"
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
              onClick={handleClearBookings}
            >
              Clear All
            </button>
          </div>
          <div className="flex-col" style={{ gap: '1rem' }}>
            {bookings.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <CheckCircle size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                <p className="text-muted">No bookings yet.</p>
              </div>
            ) : bookings.map((booking) => (
              <div key={booking.id} className="glass-panel flex-col" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', gap: '0.75rem' }}>
                <div className="flex-between">
                  <span className="text-sm text-muted text-bold">#{booking.id.slice(-6).toUpperCase()}</span>
                  <div className="flex-center" style={{ gap: '0.5rem' }}>
                    <span className="badge" style={{
                      fontSize: '0.7rem',
                      background: booking.bookingStatus === 'ACTIVE' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      color: booking.bookingStatus === 'ACTIVE' ? 'var(--success)' : 'var(--danger)'
                    }}>{booking.bookingStatus || 'ACTIVE'}</span>
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
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
