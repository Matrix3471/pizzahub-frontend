import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Home, Store, Users, Heart, TrendingUp, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pizzerie, setPizzerie] = useState([]);
  const [riscatti, setRiscatti] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, pizzerieRes, riscattiRes] = await Promise.all([
        axios.get(`${API}/analytics/admin`),
        axios.get(`${API}/pizzerie`),
        axios.get(`${API}/riscatti-ecg`)
      ]);
      setStats(statsRes.data);
      setPizzerie(pizzerieRes.data);
      setRiscatti(riscattiRes.data);
    } catch (error) {
      console.error('Errore caricamento:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--ocean-blue)' }}>Caricamento...</div>;
  }

  const riscattiPending = riscatti.filter(r => r.status === 'pending');
  const revenueCanoni = pizzerie.reduce((sum, p) => {
    const prezzo = p.piano === 'EARLY_BIRD' ? 49 : p.piano === 'PRO' ? 69 : p.piano === 'PREMIUM' ? 99 : 39;
    return sum + prezzo;
  }, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: '64px' }}>
      {/* Header */}
      <header style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '24px 0'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>👑 Admin Dashboard</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Angelo Rosso - PizzaHub</p>
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              padding: '8px 16px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Home size={18} /> Home
          </button>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '32px' }}>
        {/* Stats Globali */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div className="glass-card" data-testid="stat-pizzerie">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Store size={24} style={{ color: 'var(--ocean-blue)' }} />
              <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Pizzerie Attive</h3>
            </div>
            <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--ocean-blue)' }}>{stats?.pizzerie_attive || 0}</p>
          </div>
          <div className="glass-card" data-testid="stat-clienti">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Users size={24} style={{ color: 'var(--teal)' }} />
              <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Clienti Registrati</h3>
            </div>
            <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--teal)' }}>{stats?.clienti_registrati || 0}</p>
          </div>
          <div className="glass-card" data-testid="stat-ordini-oggi">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <TrendingUp size={24} style={{ color: '#FFD700' }} />
              <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Ordini Oggi</h3>
            </div>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#FFD700' }}>{stats?.ordini_oggi || 0}</p>
          </div>
          <div className="glass-card" data-testid="stat-revenue">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <TrendingUp size={24} style={{ color: '#10B981' }} />
              <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Revenue Canoni/Mese</h3>
            </div>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#10B981' }}>€{revenueCanoni}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pizzerie" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="pizzerie" data-testid="tab-pizzerie">Pizzerie ({pizzerie.length})</TabsTrigger>
            <TabsTrigger value="riscatti" data-testid="tab-riscatti">Richieste ECG ({riscattiPending.length})</TabsTrigger>
          </TabsList>

          {/* Pizzerie */}
          <TabsContent value="pizzerie">
            <div style={{ marginBottom: '16px' }}>
              <button
                data-testid="add-pizzeria-btn"
                className="neon-button"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={20} /> AGGIUNGI NUOVA PIZZERIA
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pizzerie.map(pizzeria => (
                <div key={pizzeria.id} className="glass-card" data-testid={`pizzeria-${pizzeria.id}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>{pizzeria.nome}</h3>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{pizzeria.citta}</p>
                    </div>
                    <div style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: pizzeria.piano === 'EARLY_BIRD' ? 'rgba(255, 215, 0, 0.2)' : 'rgba(14, 165, 233, 0.2)',
                      color: pizzeria.piano === 'EARLY_BIRD' ? '#FFD700' : 'var(--ocean-blue)'
                    }}>
                      {pizzeria.piano}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px', fontSize: '14px' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Piano:</span>
                      <span style={{ marginLeft: '8px', fontWeight: '600' }}>
                        {pizzeria.piano === 'EARLY_BIRD' ? '€49/mese' : pizzeria.piano === 'PRO' ? '€69/mese' : pizzeria.piano === 'PREMIUM' ? '€99/mese' : '€39/mese'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                      <span style={{ marginLeft: '8px', fontWeight: '600', color: pizzeria.status === 'attivo' ? '#10B981' : '#EF4444' }}>
                        {pizzeria.status === 'attivo' ? '✓ Attivo' : '✗ Disattivo'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Rating:</span>
                      <span style={{ marginLeft: '8px', fontWeight: '600' }}>⭐ {pizzeria.rating_complessivo.toFixed(1)}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Recensioni:</span>
                      <span style={{ marginLeft: '8px', fontWeight: '600' }}>{pizzeria.num_recensioni}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => navigate(`/dashboard-pizzeria/${pizzeria.id}`)}
                      style={{
                        flex: 1,
                        background: 'var(--ocean-blue)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Dettagli
                    </button>
                    <button
                      style={{
                        padding: '10px 16px',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        color: pizzeria.status === 'attivo' ? '#EF4444' : '#10B981',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      {pizzeria.status === 'attivo' ? 'Disattiva' : 'Attiva'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Riscatti ECG */}
          <TabsContent value="riscatti">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {riscatti.map(riscatto => (
                <div key={riscatto.id} className="glass-card" data-testid={`riscatto-${riscatto.id}`} style={{
                  background: riscatto.status === 'pending' ? 'rgba(14, 165, 233, 0.05)' : 'var(--glass-bg)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{riscatto.nome}</h3>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        {new Date(riscatto.timestamp).toLocaleString('it-IT')}
                      </p>
                    </div>
                    <div style={{
                      padding: '6px 14px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      background: riscatto.status === 'pending' ? 'rgba(234, 179, 8, 0.2)' : riscatto.status === 'confermato' ? 'rgba(14, 165, 233, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: riscatto.status === 'pending' ? '#EAB308' : riscatto.status === 'confermato' ? 'var(--ocean-blue)' : '#10B981'
                    }}>
                      {riscatto.status === 'pending' ? '⏳ Pending' : riscatto.status === 'confermato' ? '📞 Confermato' : '✓ Completato'}
                    </div>
                  </div>

                  <div className="glass-card" style={{ marginBottom: '16px', padding: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Telefono:</span>
                        <div style={{ fontWeight: '600', marginTop: '4px' }}>{riscatto.telefono}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Indirizzo:</span>
                        <div style={{ fontWeight: '600', marginTop: '4px' }}>{riscatto.indirizzo}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Data Preferita:</span>
                        <div style={{ fontWeight: '600', marginTop: '4px' }}>{new Date(riscatto.data_preferita).toLocaleDateString('it-IT')}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Fascia Oraria:</span>
                        <div style={{ fontWeight: '600', marginTop: '4px', textTransform: 'capitalize' }}>{riscatto.fascia_oraria}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Sconto Applicato</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--ocean-blue)' }}>
                      {riscatto.tipo_sconto} - €{riscatto.prezzo_pagato.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      ({riscatto.ordini_usati} ordini usati)
                    </div>
                  </div>

                  {riscatto.note && (
                    <div style={{ padding: '12px', background: 'var(--glass-bg)', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                      <strong>Note:</strong> {riscatto.note}
                    </div>
                  )}

                  {riscatto.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href={`tel:${riscatto.telefono}`}
                        style={{
                          flex: 1,
                          background: 'var(--ocean-blue)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px',
                          color: 'white',
                          cursor: 'pointer',
                          fontWeight: '600',
                          textAlign: 'center',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <Heart size={18} /> CONTATTA
                      </a>
                      <button
                        style={{
                          flex: 1,
                          background: 'var(--glass-bg)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '8px',
                          padding: '12px',
                          color: 'white',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        Segna Completato
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {riscatti.length === 0 && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '48px' }}>
                  <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Nessuna richiesta ECG</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardAdmin;
