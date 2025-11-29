import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Menu, MapPin, Star, Clock, TrendingUp, Award } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [pizzerie, setPizzerie] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCitta, setFiltroCitta] = useState('Tutte');
  const [sortBy, setSortBy] = useState('rating');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchPizzerie();
    // Auto-redirect se c'è parametro pizzeria
    const pizzeriaParam = searchParams.get('pizzeria');
    if (pizzeriaParam) {
      // Trova pizzeria per nome/slug
      // Per ora skip, implementabile dopo
    }
  }, [filtroCitta, sortBy]);

  const fetchPizzerie = async () => {
    try {
      const params = {};
      if (filtroCitta !== 'Tutte') params.citta = filtroCitta;
      params.sort_by = sortBy;

      const response = await axios.get(`${API}/pizzerie`, { params });
      setPizzerie(response.data);
    } catch (error) {
      console.error('Errore caricamento pizzerie:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadges = (pizzeria) => {
    const badges = [];
    if (pizzeria.rating_complessivo > 4.7) badges.push({ text: 'Top Rated', class: 'badge-top' });
    if (pizzeria.piano === 'PRO' || pizzeria.piano === 'PREMIUM') badges.push({ text: 'PRO', class: 'badge-pro' });
    if (pizzeria.num_recensioni > 100) badges.push({ text: 'Molto Richiesto', class: 'badge-hot' });
    return badges;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--ocean-blue)', fontSize: '24px' }}>Caricamento...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '24px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🍕 PIZZAHUB
          </h1>
          <button
            data-testid="hamburger-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <Menu size={28} />
          </button>
        </div>
      </header>

      {/* Hamburger Menu Overlay */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '300px',
            height: '100vh',
            background: 'var(--bg-secondary)',
            zIndex: 200,
            padding: '24px',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.5)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px' }}>Menu</h2>
            <button
              data-testid="close-menu-btn"
              onClick={() => setMenuOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button
              data-testid="dashboard-cliente-link"
              onClick={() => navigate('/dashboard-cliente')}
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '16px',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '16px'
              }}
            >
              💎 I Miei Premi
            </button>
            <button
              onClick={() => navigate('/admin')}
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '16px',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '16px'
              }}
            >
              👑 Admin
            </button>
          </div>
          <div style={{ marginTop: '32px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <p>Made with ❤️ by Angelo Rosso</p>
            <p style={{ marginTop: '8px' }}>Infermiere & Food-Tech Innovator</p>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.7)',
            zIndex: 150
          }}
        />
      )}

      <div className="container" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
        {/* Titolo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '16px' }}>Ordina dalla Tua Pizzeria Preferita</h2>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>Zero commissioni, rating trasparenti, premi fedeltà</p>
        </div>

        {/* Filtri */}
        <div className="glass-card" style={{ marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px' }}>
            <MapPin size={20} style={{ color: 'var(--ocean-blue)' }} />
            <select
              data-testid="filter-citta"
              className="select-glass"
              value={filtroCitta}
              onChange={(e) => setFiltroCitta(e.target.value)}
            >
              <option>Tutte</option>
              <option>Catania</option>
              <option>Palermo</option>
              <option>Messina</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px' }}>
            <TrendingUp size={20} style={{ color: 'var(--ocean-blue)' }} />
            <select
              data-testid="sort-by"
              className="select-glass"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="rating">Rating più alto</option>
              <option value="recensioni">Più recensioni</option>
            </select>
          </div>
        </div>

        {/* Lista Pizzerie */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {pizzerie.map((pizzeria, idx) => (
            <div
              key={pizzeria.id}
              className="glass-card card-entrance"
              style={{ animationDelay: `${idx * 0.1}s` }}
              data-testid={`pizzeria-card-${pizzeria.id}`}
            >
              {/* Logo */}
              <div style={{
                width: '100%',
                height: '180px',
                background: pizzeria.logo_url ? `url(${pizzeria.logo_url})` : 'linear-gradient(135deg, var(--ocean-blue), var(--teal))',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '12px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px'
              }}>
                {!pizzeria.logo_url && '🍕'}
              </div>

              {/* Nome e Badges */}
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{pizzeria.nome}</h3>
              <div style={{ marginBottom: '12px' }}>
                {getBadges(pizzeria).map((badge, i) => (
                  <span key={i} className={`badge ${badge.class}`}>{badge.text}</span>
                ))}
              </div>

              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="stars">{'⭐'.repeat(Math.round(pizzeria.rating_complessivo))}</span>
                <span style={{ fontWeight: '600' }}>{pizzeria.rating_complessivo.toFixed(1)}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>({pizzeria.num_recensioni} recensioni)</span>
              </div>

              {/* Rating Dettagli */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <span>🍕 Cibo: {pizzeria.rating_cibo.toFixed(1)}</span>
                <span>🚀 Servizio: {pizzeria.rating_servizio.toFixed(1)}</span>
              </div>

              {/* Indirizzo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                <MapPin size={16} />
                <span>{pizzeria.indirizzo}, {pizzeria.citta}</span>
              </div>

              {/* Orari */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                <Clock size={16} />
                <span>Aperto fino alle 23:00</span>
              </div>

              {/* Button */}
              <button
                data-testid={`ordina-btn-${pizzeria.id}`}
                className="neon-button"
                style={{ width: '100%' }}
                onClick={() => navigate(`/menu/${pizzeria.id}`)}
              >
                ORDINA ORA →
              </button>
            </div>
          ))}
        </div>

        {pizzerie.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '18px' }}>Nessuna pizzeria trovata</p>
          </div>
        )}

        {/* Footer */}
        <footer style={{ textAlign: 'center', marginTop: '64px', padding: '32px 0', borderTop: '1px solid var(--glass-border)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Made with ❤️ by Angelo Rosso - Infermiere & Food-Tech Innovator</p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
