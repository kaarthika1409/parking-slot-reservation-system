import React, { useState, useEffect, useMemo } from 'react';
import { Car, Bike, MapPin, Ticket, ArrowLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

/* ── Step indicator ─────────────────────────────────────────────────────────── */
function Stepper({ step }) {
  const steps = ['Location', 'Vehicle Type', 'Book Slot'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '2.5rem' }}>
      {steps.map((label, i) => {
        const active = i + 1 === step;
        const done   = i + 1 < step;
        return (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700,
                background: done ? 'var(--success)' : active ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                color: (done || active) ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.3s',
              }}>{done ? '✓' : i + 1}</div>
              <span style={{
                fontSize: '0.82rem', fontWeight: active ? 700 : 400,
                color: active ? '#fff' : done ? 'var(--success)' : 'var(--text-muted)',
              }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, margin: '0 0.75rem', background: done ? 'var(--success)' : 'rgba(255,255,255,0.08)', borderRadius: 2, transition: 'background 0.3s' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── Back button ────────────────────────────────────────────────────────────── */
function BackBtn({ onClick, label }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
      background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)',
      borderRadius: '0.5rem', color: 'var(--text-muted)', cursor: 'pointer',
      padding: '0.4rem 0.9rem', fontSize: '0.82rem', marginBottom: '1.25rem', transition: 'color 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.color='#fff'}
    onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}
    ><ArrowLeft size={15}/> {label}</button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function UserDashboard({ user }) {
  const [slots,     setSlots]     = useState([]);
  const [location,  setLocation]  = useState(null); // Step 1
  const [vtype,     setVtype]     = useState(null); // Step 2
  const [modal,     setModal]     = useState(null); // slot being booked
  const [form,      setForm]      = useState({ vehicleNumber:'', parkingDate:'', parkingTime:'', endTime:'' });
  const [ticket,    setTicket]    = useState(null);
  const [error,     setError]     = useState(null);

  useEffect(() => { fetchSlots(); }, []);

  const fetchSlots = async () => {
    try { const r = await axios.get('http://localhost:8080/api/user/slots'); setSlots(r.data); }
    catch(e) { console.error(e); }
  };

  /* derived */
  const locationStats = useMemo(() => {
    const m = {};
    slots.forEach(s => {
      const l = s.parkingName || s.location || 'Unknown';
      if (!m[l]) m[l] = { 
        total:0, available:0, occupied:0, 
        street: s.street, area: s.area, district: s.district, fallbackLoc: s.location 
      };
      m[l].total++;
      s.available ? m[l].available++ : m[l].occupied++;
    });
    return Object.entries(m).map(([name, st]) => ({ name, ...st }));
  }, [slots]);

  const vtypeStats = useMemo(() => {
    if (!location) return {};
    const lSlots = slots.filter(s => (s.parkingName || s.location || 'Unknown') === location);
    const m = {};
    lSlots.forEach(s => {
      const t = s.type || 'Other';
      if (!m[t]) m[t] = { total:0, available:0 };
      m[t].total++;
      if (s.available) m[t].available++;
    });
    return m;
  }, [slots, location]);

  const finalSlots = useMemo(() =>
    slots.filter(s => (s.parkingName || s.location || 'Unknown') === location && s.type === vtype),
    [slots, location, vtype]
  );

  /* booking */
  const openModal = (slot) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date(), pad = n => n.toString().padStart(2,'0');
    const start = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const later = new Date(now.getTime() + 3600000);
    const end   = `${pad(later.getHours())}:${pad(later.getMinutes())}`;
    setForm({ vehicleNumber:'', parkingDate:today, parkingTime:start, endTime:end });
    setError(null);
    setModal(slot);
  };

  const handleBook = async (e) => {
    e.preventDefault(); setError(null);
    try {
      const r = await axios.post('http://localhost:8080/api/user/reserve', {
        userId: user.id, slotId: modal.id, vehicleType: modal.type,
        vehicleNumber: form.vehicleNumber.toUpperCase(),
        parkingDate: form.parkingDate, parkingTime: form.parkingTime, endTime: form.endTime,
      });
      setModal(null); setTicket(r.data); fetchSlots();
    } catch(err) {
      setError(err.response?.data?.message || 'Booking failed');
    }
  };

  const step = !location ? 1 : !vtype ? 2 : 3;

  /* ── STEP 1: Location ─────────────────────────────────────────────────── */
  if (step === 1) return (
    <div className="container" style={{ minHeight:'80vh', paddingTop:'3rem' }}>
      <Stepper step={1}/>
      <div className="animate-fade-up" style={{ textAlign:'center', marginBottom:'3rem' }}>
        <h1 className="heading-xl">FIND PARKING</h1>
        <p className="subtitle">Step 1 — Choose a parking location</p>
      </div>

      {locationStats.length === 0
        ? <div className="glass-panel" style={{ padding:'4rem', textAlign:'center', maxWidth:480, margin:'0 auto' }}>
            <MapPin size={48} color="var(--text-muted)" style={{ marginBottom:'1rem' }}/>
            <p className="text-muted">No parking slots available yet.</p>
          </div>
        : <div className="animate-fade-up delay-100" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1.5rem' }}>
            {locationStats.map((st) => {
              const { name, total, available, occupied } = st;
              return (
              <div key={name} className="glass-panel"
                onClick={() => setLocation(name)}
                style={{ cursor:'pointer', padding:'2rem', borderLeft:'4px solid var(--primary)', transition:'transform 0.2s,box-shadow 0.2s', position:'relative', overflow:'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(79,70,229,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=''; }}
              >
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem' }}>
                  <div style={{ width:48, height:48, borderRadius:'0.75rem', background:'rgba(79,70,229,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <MapPin size={24} color="var(--primary)"/>
                  </div>
                  <div>
                    <h2 className="heading-md" style={{ margin:0, marginBottom:'0.15rem' }}>{name}</h2>
                    <p className="text-xs text-muted">
                      {[st.street, st.area, st.district].filter(Boolean).join(', ') || st.fallbackLoc || ''}
                    </p>
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.75rem', marginBottom:'1.25rem' }}>
                  {[['TOTAL', total,'#fff'],['FREE', available,'var(--success)'],['BUSY', occupied,'var(--danger)']].map(([l,v,c])=>(
                    <div key={l} style={{ textAlign:'center', background:'rgba(255,255,255,0.03)', borderRadius:'0.5rem', padding:'0.6rem' }}>
                      <p style={{ fontSize:'0.62rem', color:'var(--text-muted)', fontWeight:700, marginBottom:'0.2rem' }}>{l}</p>
                      <p style={{ fontSize:'1.3rem', fontWeight:800, color:c }}>{v}</p>
                    </div>
                  ))}
                </div>

                {/* availability bar */}
                <div style={{ height:5, borderRadius:99, background:'rgba(255,255,255,0.08)', overflow:'hidden', marginBottom:'1.25rem' }}>
                  <div style={{ height:'100%', borderRadius:99, width:`${total>0?(available/total)*100:0}%`, background: available>0?'var(--success)':'var(--danger)', transition:'width 0.5s' }}/>
                </div>

                <button className="btn btn-primary" style={{ width:'100%', pointerEvents:'none' }}>
                  Select &nbsp;<ChevronRight size={16}/>
                </button>
              </div>
              );
            })}
          </div>
      }
    </div>
  );

  /* ── STEP 2: Vehicle Type ─────────────────────────────────────────────── */
  if (step === 2) {
    const types = [
      { key:'Four Wheeler', label:'Four Wheeler', Icon:Car,  color:'var(--primary)', bg:'rgba(79,70,229,0.15)' },
      { key:'Two Wheeler',  label:'Two Wheeler',  Icon:Bike, color:'var(--accent)',  bg:'rgba(139,92,246,0.15)' },
    ];
    return (
      <div className="container" style={{ minHeight:'80vh', paddingTop:'3rem' }}>
        <Stepper step={2}/>
        <BackBtn onClick={() => setLocation(null)} label="All Locations"/>
        <div className="animate-fade-up" style={{ textAlign:'center', marginBottom:'3rem' }}>
          <h1 className="heading-xl">{location}</h1>
          <p className="subtitle">Step 2 — Choose your vehicle type</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'2rem', maxWidth:600, margin:'0 auto' }}>
          {types.map(({ key, label, Icon, color, bg }) => {
            const st = vtypeStats[key] || { total:0, available:0 };
            const hasSlots = st.total > 0;
            return (
              <div key={key} className="glass-panel"
                onClick={() => hasSlots && setVtype(key)}
                style={{
                  cursor: hasSlots ? 'pointer' : 'not-allowed',
                  opacity: hasSlots ? 1 : 0.45,
                  padding:'2.5rem 2rem', textAlign:'center',
                  borderTop:`4px solid ${color}`,
                  transition:'transform 0.2s,box-shadow 0.2s',
                }}
                onMouseEnter={e => { if(hasSlots){ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 12px 40px ${color}44`; }}}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=''; }}
              >
                <div style={{ width:80, height:80, borderRadius:'1.5rem', background:bg, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem' }}>
                  <Icon size={40} color={color}/>
                </div>
                <h2 className="heading-md">{label}</h2>
                <p className="text-muted text-sm" style={{ marginBottom:'1.5rem' }}>
                  {hasSlots
                    ? <><span style={{ color:'var(--success)', fontWeight:700 }}>{st.available}</span> of <strong>{st.total}</strong> slots available</>
                    : 'No slots at this location'}
                </p>
                <button className="btn btn-primary" style={{ width:'100%', pointerEvents:'none', background: color, borderColor: color }}>
                  {hasSlots ? <>View Slots <ChevronRight size={16}/></> : 'Unavailable'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── STEP 3: Slots ────────────────────────────────────────────────────── */
  const avail = finalSlots.filter(s=>s.available).length;
  return (
    <div className="container" style={{ minHeight:'80vh', paddingTop:'3rem' }}>
      <Stepper step={3}/>
      <BackBtn onClick={() => setVtype(null)} label="Change Vehicle Type"/>

      <div className="flex-between mb-lg animate-fade-up" style={{ alignItems:'flex-end', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 className="heading-xl">{location}</h1>
          <p className="subtitle" style={{ marginLeft:0 }}>
            {vtype} · <span style={{ color:'var(--success)' }}>{avail} available</span> of {finalSlots.length} slots
          </p>
        </div>
      </div>

      {/* Ticket banner */}
      {ticket && (
        <div className="ticket-banner animate-fade-up">
          <div className="ticket-icon"><Ticket size={32}/></div>
          <div>
            <h3 className="heading-md" style={{ color:'var(--accent)', marginBottom:'0.25rem' }}>Booking Confirmed!</h3>
            <div className="ticket-details" style={{ flexWrap:'wrap' }}>
              <span className="ticket-pill">Slot: {ticket.slotNumber}</span>
              <span className="ticket-pill">Vehicle: {ticket.vehicleNumber}</span>
              <span className="ticket-pill">Date: {ticket.parkingDate}</span>
              <span className="ticket-pill">Time: {ticket.parkingTime} – {new Date(ticket.endTime).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} ({ticket.duration} hrs)</span>
            </div>
          </div>
          <button onClick={() => setTicket(null)} className="btn btn-outline" style={{ marginLeft:'auto', borderColor:'var(--accent)', color:'var(--accent)' }}>Close</button>
        </div>
      )}

      {finalSlots.length === 0
        ? <div className="glass-panel" style={{ padding:'4rem', textAlign:'center' }}>
            <p className="text-muted">No {vtype} slots at this location.</p>
          </div>
        : <div className="grid-cards animate-fade-up delay-100">
            {finalSlots.map(slot => (
              <div key={slot.id} className="glass-panel"
                style={{ opacity:slot.available?1:0.8, borderColor:slot.available?'var(--glass-border)':'rgba(239,68,68,0.4)', position:'relative', overflow:'hidden' }}>
                <div className="flex-between" style={{ alignItems:'flex-start', marginBottom:'1.5rem' }}>
                  <div style={{ width:48, height:48, borderRadius:'0.75rem', background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {slot.type==='Four Wheeler' ? <Car color="var(--primary)"/> : <Bike color="var(--primary)"/>}
                  </div>
                  <span className={`badge ${slot.available?'badge-success':'badge-danger'}`}>
                    {slot.available?'AVAILABLE':'OCCUPIED'}
                  </span>
                </div>
                <h3 className="heading-md" style={{ marginBottom:'0.25rem' }}>{slot.slotNumber}</h3>
                <div className="flex-center gap-sm text-sm text-muted" style={{ justifyContent:'flex-start', marginBottom:'1rem' }}>
                  <MapPin size={14}/> 
                  {[slot.street, slot.area, slot.district].filter(Boolean).join(', ') || slot.location}
                </div>
                <div className="flex-between" style={{ marginTop:'2rem', alignItems:'flex-end' }}>
                  <div>
                    <p style={{ fontSize:'10px', color:'var(--text-muted)', fontWeight:700 }}>RATE</p>
                    <div style={{ display:'flex', alignItems:'baseline' }}>
                      <span style={{ fontSize:'1.5rem', fontWeight:800 }}>₹{slot.pricePerHour}</span>
                      <small className="text-muted" style={{ marginLeft:4 }}>/hr</small>
                    </div>
                  </div>
                  {slot.available && (
                    <button onClick={() => openModal(slot)} className="btn btn-primary" style={{ padding:'0.5rem 1.1rem', borderRadius:'0.5rem' }}>
                      Book Now
                    </button>
                  )}
                </div>
                {!slot.available && (
                  <div style={{ position:'absolute', inset:0, background:'rgba(239,68,68,0.05)', backdropFilter:'blur(3px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span className="badge badge-danger" style={{ fontSize:'1.2rem', padding:'0.5rem 1rem', border:'2px solid rgba(239,68,68,0.8)', background:'rgba(239,68,68,0.2)', color:'#fca5a5', boxShadow:'0 8px 32px rgba(239,68,68,0.3)' }}>OCCUPIED</span>
                  </div>
                )}
              </div>
            ))}
          </div>
      }

      {/* Booking Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <h2 className="heading-md" style={{ marginBottom:'0.5rem' }}>Reserve — {modal.slotNumber}</h2>
            <p className="text-sm text-muted" style={{ marginBottom:'1.5rem' }}>Fill in your details to confirm the booking.</p>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleBook}>
              <div className="form-row" style={{ marginBottom:'1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Booking Date</label>
                  <input type="date" className="form-input" value={form.parkingDate}
                    onChange={e => setForm({...form, parkingDate:e.target.value})} required/>
                </div>
                <div className="form-group">
                  <label className="form-label">Vehicle Number</label>
                  <input type="text" className="form-input" placeholder="e.g. TN 01 AB 1234"
                    value={form.vehicleNumber} onChange={e => setForm({...form, vehicleNumber:e.target.value.toUpperCase()})} required/>
                </div>
              </div>
              <div className="form-row" style={{ marginBottom:'1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input type="time" className="form-input" value={form.parkingTime}
                    onChange={e => setForm({...form, parkingTime:e.target.value})} required/>
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input type="time" className="form-input" value={form.endTime}
                    onChange={e => setForm({...form, endTime:e.target.value})} required/>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Summary</label>
                <div style={{ background:'rgba(255,255,255,0.03)', padding:'1rem', borderRadius:'0.75rem', border:'1px solid var(--glass-border)' }}>
                  {[['Location', modal.parkingName || modal.location],['Type', modal.type],['Rate',`₹${modal.pricePerHour}/hr`]].map(([k,v])=>(
                    <div key={k} className="flex-between text-sm" style={{ marginBottom:'0.4rem' }}>
                      <span className="text-muted">{k}:</span>
                      <span className="text-bold" style={k==='Rate'?{color:'var(--accent)'}:{}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-row" style={{ marginTop:'1.5rem' }}>
                <button type="button" onClick={() => setModal(null)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
