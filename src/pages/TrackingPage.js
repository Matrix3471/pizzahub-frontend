import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Package, Truck, Phone, MapPin } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TrackingPage = () => {
  const { ordineId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { nuovo, pizzeria: pizzeriaState } = location.state || {};
  const [ordine, setOrdine] = useState(null);
  const [pizzeria, setPizzeria] = useState(pizzeriaState || null);
  const [cliente, setCliente] = useState(null);

  useEffect(() => {
    fetchOrdine();
  }, [ordineId]);

  const fetchOrdine = async () => {
    try {
      const ordineRes = await axios.get(`${API}/ordini/${ordineId}`);
      setOrdine(ordineRes.data);

      if (!pizzeriaState) {
        const pizzeriaRes = await axios.get(`${API}/pizzerie/${ordineRes.data.pizzeria_id}`);
        setPizzeria(pizzeriaRes.data);
      }

      // Fetch cliente per punti
      try {
        const clienteRes = await axios.get(`${API}/clienti/${ordineRes.data.cliente_id}`);
        setCliente(clienteRes.data);
      } catch (err) {
        console.error('Cliente non trovato:', err);
      }
    } catch (error) {
      console.error('Errore caricamento ordine:', error);
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { status: 'ricevuto', label: 'Ricevuto', icon: CheckCircle, completato: true },
      { status: 'in_preparazione', label: 'In preparazione', icon: Package, completato: ['in_preparazione', 'pronto', 'consegnato'].includes(ordine?.status) },
      { status: 'pronto', label: 'Pronto', icon: CheckCircle, completato: ['pronto', 'consegnato'].includes(ordine?.status) },
      { status: 'consegnato', label: ordine?.tipo_ordine === 'consegna' ? 'Consegnato' : 'Ritirato', icon: Truck, completato: ordine?.status === 'consegnato' }
    ];
    return steps;
  };

  if (!ordine) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--ocean-blue)' }}>
        Caricamento...
      </div>
    );
  }

  const steps = getStatusSteps();
  const currentStepIndex = steps.findIndex(s => s.status === ordine.status);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: '64px' }}>
      {/* Header */}
      <header style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '24px 0'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>📦 Ordine #{ordine.id.slice(0, 8).toUpperCase()}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Pronto alle {ordine.slot_orario}</p>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '32px', maxWidth: '600px' }}>
        {/* Modal Conferma Nuovo Ordine */}
        {nuovo && cliente && (
          <div className="glass-card card-entrance" style={{ marginBottom: '32px', background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(20, 184, 166, 0.1))' }} data-testid="ordine-confermato-modal">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>ORDINE CONFERMATO!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Ti abbiamo inviato un SMS di conferma
              </p>

              {/* Punti Fedeltà */}
              <div className="glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
                <h3 style={{ fontSize: '18px', marginBottom: '12px', color: 'var(--ocean-blue)' }}>HAI GUADAGNATO 1 ORDINE!</h3>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '8px' }}>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: i < cliente.punti_fedelta ? 'var(--ocean-blue)' : 'var(--glass-bg)',
                        border: '2px solid var(--glass-border)'
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: '600' }}>{cliente.punti_fedelta}/10 ordini</p>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {cliente.punti_fedelta >= 20 ? 'ECG GRATIS sbloccato!' :
                    cliente.punti_fedelta >= 10 ? 'ECG a €10.40 sbloccato!' :
                      cliente.punti_fedelta >= 5 ? 'ECG a €18.20 sbloccato!' :
                        `Mancano ${10 - cliente.punti_fedelta} ordini per ECG scontato!`}
                </p>
                <button
                  onClick={() => navigate('/dashboard-cliente', { state: { telefono: ordine.cliente_id } })}
                  className="neon-button"
                  style={{ marginTop: '16px' }}
                  data-testid="vedi-premi-btn"
                >
                  VEDI PREMI →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tracking Status */}
        <div className="glass-card" style={{ marginBottom: '32px' }} data-testid="tracking-status">
          <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Stato Ordine:</h3>
          <div style={{ position: 'relative' }}>
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isLast = idx === steps.length - 1;
              return (
                <div key={step.status} style={{ position: 'relative', paddingBottom: isLast ? 0 : '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: step.completato ? 'var(--ocean-blue)' : 'var(--glass-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      zIndex: 2
                    }}>
                      <Icon size={20} color={step.completato ? 'white' : 'var(--text-secondary)'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '16px' }}>{step.label}</div>
                      {idx === currentStepIndex && (
                        <div style={{ fontSize: '14px', color: 'var(--ocean-blue)', marginTop: '4px' }}>In corso...</div>
                      )}
                      {step.completato && idx < currentStepIndex && (
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>✅ Completato</div>
                      )}
                    </div>
                  </div>
                  {!isLast && (
                    <div style={{
                      position: 'absolute',
                      left: '19px',
                      top: '40px',
                      width: '2px',
                      height: 'calc(100% - 8px)',
                      background: step.completato ? 'var(--ocean-blue)' : 'var(--glass-border)',
                      zIndex: 1
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {ordine.status !== 'consegnato' && (
            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
              <Clock size={24} style={{ color: 'var(--ocean-blue)', marginBottom: '8px' }} />
              <p style={{ fontSize: '16px', fontWeight: '600' }}>Tempo stimato: 25 minuti</p>
            </div>
          )}
        </div>

        {/* Info Pizzeria */}
        {pizzeria && (
          <div className="glass-card" style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>
              {ordine.tipo_ordine === 'ritiro' ? '📍 Ritiro presso:' : '🚚 Consegna da:'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>{pizzeria.nome}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <MapPin size={16} />
                <span>{pizzeria.indirizzo}, {pizzeria.citta}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <Phone size={16} />
                <span>{pizzeria.telefono}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <a href={`tel:${pizzeria.telefono}`} className="neon-button" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>
                Chiama Pizzeria
              </a>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/')}
            className="neon-button"
            style={{ flex: 1 }}
            data-testid="torna-home-btn"
          >
            Torna alla Home
          </button>
          {ordine.status === 'consegnato' && (
            <button
              onClick={() => navigate(`/rate/${ordineId}`)}
              className="neon-button"
              style={{ flex: 1 }}
              data-testid="valuta-btn"
            >
              Valuta ⭐
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
