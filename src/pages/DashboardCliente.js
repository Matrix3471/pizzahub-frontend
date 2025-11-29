import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Gift, Calendar, TrendingUp } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DashboardCliente = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [telefono, setTelefono] = useState(location.state?.telefono || '');
  const [cliente, setCliente] = useState(null);
  const [ordini, setOrdini] = useState([]);
  const [showLogin, setShowLogin] = useState(!location.state?.telefono);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (telefono && !showLogin) {
      fetchCliente();
    }
  }, [telefono, showLogin]);

  const fetchCliente = async () => {
    setLoading(true);
    try {
      const clienteRes = await axios.get(`${API}/clienti/telefono/${telefono}`);
      setCliente(clienteRes.data);
      const ordiniRes = await axios.get(`${API}/clienti/${clienteRes.data.id}/ordini`);
      setOrdini(ordiniRes.data);
      setShowLogin(false);
    } catch (error) {
      console.error('Cliente non trovato:', error);
      alert('Numero di telefono non trovato. Effettua prima un ordine!');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    fetchCliente();
  };

  const getLivelloSuccessivo = () => {
    const punti = cliente?.punti_fedelta || 0;
    if (punti < 5) return { ordini: 5, sconto: '30%', prezzo: 18.20, sbloccato: false, mancano: 5 - punti };
    if (punti < 10) return { ordini: 10, sconto: '60%', prezzo: 10.40, sbloccato: false, mancano: 10 - punti };
    if (punti < 20) return { ordini: 20, sconto: '100%', prezzo: 0, sbloccato: false, mancano: 20 - punti };
    return { ordini: 20, sconto: '100%', prezzo: 0, sbloccato: true, mancano: 0 };
  };

  const getLivelliSbloccati = () => {
    const punti = cliente?.punti_fedelta || 0;
    const livelli = [];
    if (punti >= 5) livelli.push({ ordini: 5, sconto: '30%', prezzo: 18.20, badge: '🥉' });
    if (punti >= 10) livelli.push({ ordini: 10, sconto: '60%', prezzo: 10.40, badge: '🥈' });
    if (punti >= 20) livelli.push({ ordini: 20, sconto: '100%', prezzo: 0, badge: '🥇' });
    return livelli;
  };

  if (showLogin) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="glass-card" style={{ maxWidth: '400px', width: '100%' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '8px', textAlign: 'center' }}>💎 I Miei Premi</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', textAlign: 'center' }}>
            Inserisci il tuo numero per vedere i premi
          </p>
          <form onSubmit={handleLogin}>
            <input
              data-testid="telefono-input"
              className="input-glass"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+39 333 1234567"
              required
              style={{ marginBottom: '16px' }}
            />
            <button
              data-testid="login-btn"
              type="submit"
              className="neon-button"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Caricamento...' : 'ACCEDI'}
            </button>
          </form>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              marginTop: '16px',
              width: '100%'
            }}
          >
            ← Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--ocean-blue)' }}>
        Caricamento...
      </div>
    );
  }

  const livelloSuccessivo = getLivelloSuccessivo();
  const livelliSbloccati = getLivelliSbloccati();
  const scadenza = new Date(cliente.scadenza_punti);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: '64px' }}>
      {/* Header */}
      <header style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '16px 0'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            data-testid="back-btn"
            onClick={() => navigate('/')}
            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 style={{ fontSize: '20px', margin: 0 }}>💎 HEALTHYFOOD REWARDS</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>by Angelo Rosso</p>
          </div>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '32px', maxWidth: '800px' }}>
        {/* Welcome */}
        <div className="glass-card" style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Ciao {cliente.nome}! 👋</h2>
          <div style={{ fontSize: '48px', fontWeight: '700', color: 'var(--ocean-blue)', marginBottom: '8px' }}>
            {cliente.punti_fedelta}
          </div>
          <p style={{ fontSize: '18px', marginBottom: '16px' }}>I TUOI ORDINI</p>
          
          {/* Progress Bar */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '12px' }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: i < cliente.punti_fedelta ? 'var(--ocean-blue)' : 'var(--glass-bg)',
                  border: '2px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {i < cliente.punti_fedelta ? '✓' : ''}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '16px', fontWeight: '600' }}>{cliente.punti_fedelta}/10 ordini</p>
          </div>

          {!livelloSuccessivo.sbloccato ? (
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
              "{livelloSuccessivo.mancano} ordini al prossimo ECG scontato!"
            </p>
          ) : (
            <p style={{ fontSize: '16px', color: 'var(--ocean-blue)', fontWeight: '600' }}>
              🎉 Hai sbloccato tutti i livelli!
            </p>
          )}

          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '16px' }}>
            <Calendar size={16} style={{ display: 'inline', marginRight: '8px' }} />
            Scadenza punti: {scadenza.toLocaleDateString('it-IT')}
          </div>
        </div>

        {/* Premi Disponibili */}
        <div className="glass-card" style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🎁 PREMI DISPONIBILI
          </h3>

          {/* Livelli Sbloccati */}
          {livelliSbloccati.map((livello, idx) => (
            <div key={idx} className="glass-card" style={{ marginBottom: '16px', background: 'rgba(14, 165, 233, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅ SBLOCCATO</div>
                  <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>{livello.badge} {livello.ordini} ORDINI</h4>
                  <p style={{ fontSize: '16px', marginBottom: '4px' }}>ECG a Domicilio {livello.sconto}</p>
                  <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--ocean-blue)' }}>
                    €{livello.prezzo.toFixed(2)} {livello.prezzo > 0 && <span style={{ fontSize: '14px', textDecoration: 'line-through', color: 'var(--text-secondary)' }}>invece di €26</span>}
                    {livello.prezzo === 0 && <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>(Valore: €26)</span>}
                  </p>
                </div>
              </div>
              <button
                data-testid={`prenota-ecg-${livello.ordini}-btn`}
                onClick={() => navigate('/prenota-ecg', { state: { cliente, livello } })}
                className="neon-button"
                style={{ width: '100%' }}
              >
                PRENOTA ORA →
              </button>
            </div>
          ))}

          {/* Livelli Bloccati */}
          {cliente.punti_fedelta < 5 && (
            <div className="glass-card" style={{ marginBottom: '16px', opacity: 0.6 }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔒 MANCANO {5 - cliente.punti_fedelta} ORDINI</div>
              <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>🥉 5 ORDINI</h4>
              <p style={{ fontSize: '16px', marginBottom: '4px' }}>ECG a Domicilio -30%</p>
              <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--ocean-blue)' }}>€18.20 invece di €26</p>
            </div>
          )}
          {cliente.punti_fedelta < 10 && (
            <div className="glass-card" style={{ marginBottom: '16px', opacity: 0.6 }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔒 MANCANO {10 - cliente.punti_fedelta} ORDINI</div>
              <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>🥈 10 ORDINI</h4>
              <p style={{ fontSize: '16px', marginBottom: '4px' }}>ECG a Domicilio -60%</p>
              <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--ocean-blue)' }}>€10.40 invece di €26</p>
            </div>
          )}
          {cliente.punti_fedelta < 20 && (
            <div className="glass-card" style={{ marginBottom: '16px', opacity: 0.6 }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔒 MANCANO {20 - cliente.punti_fedelta} ORDINI</div>
              <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>🥇 20 ORDINI</h4>
              <p style={{ fontSize: '16px', marginBottom: '4px' }}>ECG a Domicilio GRATIS</p>
              <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--ocean-blue)' }}>Valore: €26</p>
            </div>
          )}
        </div>

        {/* Regala Punti */}
        <div className="glass-card" style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💝</div>
          <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>REGALA PUNTI</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Trasferisci ordini a familiari o amici
          </p>
          <button
            data-testid="regala-punti-btn"
            onClick={() => navigate('/regala-punti', { state: { cliente } })}
            className="neon-button"
            style={{ width: '100%' }}
          >
            REGALA ORA →
          </button>
        </div>

        {/* Storico Ordini */}
        <div className="glass-card">
          <h3 style={{ fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={24} /> STORICO ORDINI
          </h3>
          {ordini.slice(0, 5).map(ordine => (
            <div key={ordine.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: '1px solid var(--glass-border)'
            }}>
              <div>
                <div style={{ fontSize: '14px' }}>
                  {new Date(ordine.timestamp_creazione).toLocaleDateString('it-IT')}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Ordine #{ordine.id.slice(0, 8)}
                </div>
              </div>
              <div style={{ fontSize: '16px', fontWeight: '600' }}>€{ordine.totale.toFixed(2)}</div>
            </div>
          ))}
          {ordini.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '32px 0' }}>
              Nessun ordine ancora
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCliente;
