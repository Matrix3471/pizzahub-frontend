import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PrenotaECG = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cliente, livello } = location.state || {};

  const [formData, setFormData] = useState({
    nome: cliente?.nome || '',
    cognome: '',
    telefono: cliente?.telefono || '',
    indirizzo: cliente?.indirizzo_default || '',
    citta: cliente?.citta || '',
    cap: '',
    data_preferita: '',
    fascia_oraria: 'pomeriggio',
    note: ''
  });
  const [accettato, setAccettato] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!cliente || !livello) {
    navigate('/dashboard-cliente');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accettato) {
      toast.error('Devi accettare l\'informativa sanitaria');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/riscatti-ecg`, {
        cliente_id: cliente.id,
        ordini_usati: livello.ordini,
        nome: `${formData.nome} ${formData.cognome}`,
        indirizzo: `${formData.indirizzo}, ${formData.citta} ${formData.cap}`,
        telefono: formData.telefono,
        data_preferita: formData.data_preferita,
        fascia_oraria: formData.fascia_oraria,
        note: formData.note || null
      });

      toast.success('Prenotazione ECG confermata! Sarai contattato presto.');
      setTimeout(() => navigate('/dashboard-cliente', { state: { telefono: cliente.telefono } }), 2000);
    } catch (error) {
      console.error('Errore prenotazione:', error);
      toast.error('Errore durante la prenotazione');
    } finally {
      setLoading(false);
    }
  };

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
            onClick={() => navigate(-1)}
            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ fontSize: '20px', margin: 0 }}>🩺 Prenota il Tuo ECG</h1>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '32px', maxWidth: '600px' }}>
        {/* Info Sconto */}
        <div className="glass-card" style={{ marginBottom: '32px', textAlign: 'center', background: 'rgba(14, 165, 233, 0.1)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Hai sbloccato: ECG {livello.sconto}</h2>
          <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--ocean-blue)' }}>
            Prezzo finale: €{livello.prezzo.toFixed(2)}
          </p>
          {livello.prezzo > 0 && (
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>Prezzo normale: €26.00</p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Dati Paziente */}
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} /> Dati Paziente
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Nome *</label>
                  <input
                    data-testid="input-nome"
                    className="input-glass"
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Cognome *</label>
                  <input
                    data-testid="input-cognome"
                    className="input-glass"
                    type="text"
                    value={formData.cognome}
                    onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px' }}>
                  <Phone size={16} /> Telefono *
                </label>
                <input
                  data-testid="input-telefono"
                  className="input-glass"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px' }}>
                  <MapPin size={16} /> Indirizzo *
                </label>
                <input
                  data-testid="input-indirizzo"
                  className="input-glass"
                  type="text"
                  value={formData.indirizzo}
                  onChange={(e) => setFormData({ ...formData, indirizzo: e.target.value })}
                  required
                  placeholder="Via Roma 15"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Città *</label>
                  <input
                    data-testid="input-citta"
                    className="input-glass"
                    type="text"
                    value={formData.citta}
                    onChange={(e) => setFormData({ ...formData, citta: e.target.value })}
                    required
                    placeholder="Catania"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>CAP *</label>
                  <input
                    data-testid="input-cap"
                    className="input-glass"
                    type="text"
                    value={formData.cap}
                    onChange={(e) => setFormData({ ...formData, cap: e.target.value })}
                    required
                    placeholder="95100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Data e Orario */}
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} /> Data Preferita
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <input
                data-testid="input-data"
                className="input-glass"
                type="date"
                value={formData.data_preferita}
                onChange={(e) => setFormData({ ...formData, data_preferita: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <h4 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} /> Fascia Oraria
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['mattina', 'pomeriggio', 'sera'].map(fascia => (
                <label key={fascia} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '12px',
                  background: formData.fascia_oraria === fascia ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                  borderRadius: '8px',
                  border: '1px solid ' + (formData.fascia_oraria === fascia ? 'var(--ocean-blue)' : 'var(--glass-border)')
                }}>
                  <input
                    type="radio"
                    name="fascia"
                    value={fascia}
                    checked={formData.fascia_oraria === fascia}
                    onChange={(e) => setFormData({ ...formData, fascia_oraria: e.target.value })}
                    data-testid={`fascia-${fascia}`}
                  />
                  <span style={{ textTransform: 'capitalize' }}>
                    {fascia} ({fascia === 'mattina' ? '9:00-13:00' : fascia === 'pomeriggio' ? '14:00-18:00' : '18:00-20:00'})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Note aggiuntive</h3>
            <textarea
              data-testid="input-note"
              className="textarea-glass"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Eventuali informazioni mediche rilevanti..."
            />
          </div>

          {/* Privacy */}
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'start', gap: '12px', cursor: 'pointer' }}>
              <input
                data-testid="privacy-checkbox"
                type="checkbox"
                checked={accettato}
                onChange={(e) => setAccettato(e.target.checked)}
                style={{ marginTop: '4px' }}
              />
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Ho letto e accetto l'<a href="#" style={{ color: 'var(--ocean-blue)', textDecoration: 'underline' }}>informativa sanitaria</a> e autorizzo il trattamento dei dati
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            data-testid="conferma-prenotazione-btn"
            type="submit"
            className="neon-button"
            style={{ width: '100%', fontSize: '18px' }}
            disabled={loading}
          >
            {loading ? 'Invio...' : 'CONFERMA PRENOTAZIONE'}
          </button>
        </form>

        <div style={{ marginTop: '24px', padding: '16px', background: 'var(--glass-bg)', borderRadius: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p style={{ marginBottom: '8px' }}>📞 <strong>Cosa succede ora?</strong></p>
          <p>Angelo Rosso ti contatterà entro 24 ore per confermare l'appuntamento e concordare i dettagli.</p>
        </div>
      </div>
    </div>
  );
};

export default PrenotaECG;
