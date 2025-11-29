import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, Phone, MessageCircle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RegalaPunti = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cliente } = location.state || {};

  const [destinatario, setDestinatario] = useState('');
  const [ordiniDaRegalare, setOrdiniDaRegalare] = useState(1);
  const [messaggio, setMessaggio] = useState('');
  const [loading, setLoading] = useState(false);

  if (!cliente) {
    navigate('/dashboard-cliente');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destinatario || ordiniDaRegalare < 1) {
      toast.error('Compila tutti i campi');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/trasferimenti`, null, {
        params: {
          mittente_id: cliente.id,
          destinatario_telefono: destinatario,
          ordini: ordiniDaRegalare,
          messaggio: messaggio || null
        }
      });

      toast.success('Punti regalati con successo!');
      setTimeout(() => navigate('/dashboard-cliente', { state: { telefono: cliente.telefono } }), 2000);
    } catch (error) {
      console.error('Errore trasferimento:', error);
      toast.error(error.response?.data?.detail || 'Errore durante il trasferimento');
    } finally {
      setLoading(false);
    }
  };

  const puntiRimanenti = cliente.punti_fedelta - ordiniDaRegalare;

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
          <h1 style={{ fontSize: '20px', margin: 0 }}>💝 Regala i Tuoi Ordini</h1>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '32px', maxWidth: '600px' }}>
        {/* Info */}
        <div className="glass-card" style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎁</div>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Condividi la Salute</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Trasferisci i tuoi ordini a chi vuoi bene
          </p>
          <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '8px' }}>
            <p style={{ fontSize: '16px', marginBottom: '4px' }}>I tuoi ordini attuali</p>
            <p style={{ fontSize: '48px', fontWeight: '700', color: 'var(--ocean-blue)' }}>{cliente.punti_fedelta}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Destinatario */}
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={20} /> A chi vuoi regalare?
            </h3>
            <input
              data-testid="input-destinatario"
              className="input-glass"
              type="tel"
              value={destinatario}
              onChange={(e) => setDestinatario(e.target.value)}
              required
              placeholder="+39 333 1234567"
            />
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Il destinatario deve aver già fatto almeno 1 ordine sulla piattaforma
            </p>
          </div>

          {/* Quantità */}
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gift size={20} /> Quanti ordini vuoi regalare?
            </h3>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '48px', fontWeight: '700', color: 'var(--ocean-blue)' }}>{ordiniDaRegalare}</span>
                <span style={{ fontSize: '20px', marginLeft: '8px', color: 'var(--text-secondary)' }}>ordini</span>
              </div>
              <Slider
                data-testid="slider-ordini"
                value={[ordiniDaRegalare]}
                onValueChange={([val]) => setOrdiniDaRegalare(val)}
                min={1}
                max={Math.min(cliente.punti_fedelta, 20)}
                step={1}
                className="w-full"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span>min 1</span>
                <span>max {Math.min(cliente.punti_fedelta, 20)}</span>
              </div>
            </div>

            {/* Preview */}
            <div style={{ background: 'rgba(14, 165, 233, 0.1)', borderRadius: '8px', padding: '16px' }}>
              <p style={{ fontSize: '16px', marginBottom: '12px', fontWeight: '600' }}>Dopo il regalo:</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Tu avrai:</span>
                <span style={{ fontSize: '18px', fontWeight: '600' }}>{puntiRimanenti} ordini</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Il destinatario riceverà:</span>
                <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--ocean-blue)' }}>+{ordiniDaRegalare} ordini</span>
              </div>
            </div>
          </div>

          {/* Messaggio */}
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageCircle size={18} /> Messaggio (opzionale)
            </h3>
            <input
              data-testid="input-messaggio"
              className="input-glass"
              type="text"
              value={messaggio}
              onChange={(e) => setMessaggio(e.target.value)}
              placeholder='Es: "Buon compleanno!"'
              maxLength={100}
            />
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'right' }}>
              {messaggio.length}/100 caratteri
            </p>
          </div>

          {/* Warning */}
          {puntiRimanenti < 5 && (
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}>
              ⚠️ Attenzione: dopo il regalo avrai meno di 5 ordini e non potrai riscattare premi ECG fino al prossimo livello.
            </div>
          )}

          {/* Submit */}
          <button
            data-testid="conferma-regalo-btn"
            type="submit"
            className="neon-button"
            style={{ width: '100%', fontSize: '18px', marginBottom: '16px' }}
            disabled={loading || puntiRimanenti < 0}
          >
            {loading ? 'Invio...' : 'CONFERMA REGALO →'}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              padding: '12px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Annulla
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegalaPunti;
