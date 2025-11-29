import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RatingPage = () => {
  const { ordineId } = useParams();
  const navigate = useNavigate();
  const [ordine, setOrdine] = useState(null);
  const [pizzeria, setPizzeria] = useState(null);
  const [votoCibo, setVotoCibo] = useState(0);
  const [votoServizio, setVotoServizio] = useState(0);
  const [commento, setCommento] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [ordineId]);

  const fetchData = async () => {
    try {
      const ordineRes = await axios.get(`${API}/ordini/${ordineId}`);
      setOrdine(ordineRes.data);
      const pizzeriaRes = await axios.get(`${API}/pizzerie/${ordineRes.data.pizzeria_id}`);
      setPizzeria(pizzeriaRes.data);
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (votoCibo === 0 || votoServizio === 0) {
      toast.error('Devi votare sia il cibo che il servizio');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/recensioni`, {
        ordine_id: ordineId,
        voto_cibo: votoCibo,
        voto_servizio: votoServizio,
        commento: commento || null
      });

      toast.success('Grazie per la tua recensione!');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Errore invio recensione:', error);
      toast.error('Errore durante l\'invio della recensione');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (voto, setVoto, testId) => {
    return (
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {[1, 2, 3, 4, 5].map(num => (
          <button
            key={num}
            type="button"
            data-testid={`${testId}-${num}`}
            onClick={() => setVoto(num)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '32px',
              padding: '4px',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Star
              size={40}
              fill={num <= voto ? '#FFD700' : 'none'}
              color={num <= voto ? '#FFD700' : 'var(--text-secondary)'}
            />
          </button>
        ))}
      </div>
    );
  };

  if (!ordine || !pizzeria) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--ocean-blue)' }}>
        Caricamento...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: '64px' }}>
      {/* Header */}
      <header style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '24px 0'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>⭐ Valuta {pizzeria.nome}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>La tua opinione ci aiuta a migliorare</p>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '32px', maxWidth: '600px' }}>
        <form onSubmit={handleSubmit}>
          {/* Qualità Cibo */}
          <div className="glass-card" style={{ marginBottom: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍕</div>
            <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>QUALITÀ DEL CIBO</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Tap per votare</p>
            {renderStars(votoCibo, setVotoCibo, 'voto-cibo')}
            {votoCibo > 0 && (
              <div style={{ marginTop: '16px', fontSize: '18px', fontWeight: '600', color: 'var(--ocean-blue)' }}>
                {votoCibo} {votoCibo === 1 ? 'stella' : 'stelle'}
              </div>
            )}
          </div>

          {/* Servizio */}
          <div className="glass-card" style={{ marginBottom: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
            <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>SERVIZIO E PUNTUALITÀ</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Tap per votare</p>
            {renderStars(votoServizio, setVotoServizio, 'voto-servizio')}
            {votoServizio > 0 && (
              <div style={{ marginTop: '16px', fontSize: '18px', fontWeight: '600', color: 'var(--ocean-blue)' }}>
                {votoServizio} {votoServizio === 1 ? 'stella' : 'stelle'}
              </div>
            )}
          </div>

          {/* Commento */}
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>💬 Commento (facoltativo)</h3>
            <textarea
              data-testid="commento-input"
              className="textarea-glass"
              value={commento}
              onChange={(e) => setCommento(e.target.value)}
              placeholder="Condividi la tua esperienza..."
              maxLength={300}
              style={{ minHeight: '120px' }}
            />
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'right' }}>
              {commento.length}/300 caratteri
            </div>
          </div>

          {/* Preview Rating Finale */}
          {votoCibo > 0 && votoServizio > 0 && (
            <div className="glass-card" style={{ marginBottom: '24px', textAlign: 'center', background: 'rgba(14, 165, 233, 0.1)' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Rating finale</p>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--ocean-blue)' }}>
                {((votoCibo * 0.7) + (votoServizio * 0.3)).toFixed(1)} ⭐
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                (Cibo 70% + Servizio 30%)
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            data-testid="invia-recensione-btn"
            type="submit"
            className="neon-button"
            style={{ width: '100%', fontSize: '18px' }}
            disabled={loading || votoCibo === 0 || votoServizio === 0}
          >
            {loading ? 'Invio...' : 'INVIA RECENSIONE'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RatingPage;
