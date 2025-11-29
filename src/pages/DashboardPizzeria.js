import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Package, TrendingUp, Star, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DashboardPizzeria = () => {
  const { pizzeriaId } = useParams();
  const [pizzeria, setPizzeria] = useState(null);
  const [ordini, setOrdini] = useState([]);
  const [recensioni, setRecensioni] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Refresh ogni 30 secondi per ordini
    const interval = setInterval(() => fetchOrdini(), 30000);
    return () => clearInterval(interval);
  }, [pizzeriaId]);

  const fetchData = async () => {
    try {
      const [pizzeriaRes, ordiniRes, recensioniRes, analyticsRes] = await Promise.all([
        axios.get(`${API}/pizzerie/${pizzeriaId}`),
        axios.get(`${API}/ordini/pizzeria/${pizzeriaId}`),
        axios.get(`${API}/recensioni/pizzeria/${pizzeriaId}`),
        axios.get(`${API}/analytics/pizzeria/${pizzeriaId}`, { params: { giorni: 30 } })
      ]);
      setPizzeria(pizzeriaRes.data);
      setOrdini(ordiniRes.data);
      setRecensioni(recensioniRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Errore caricamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdini = async () => {
    try {
      const res = await axios.get(`${API}/ordini/pizzeria/${pizzeriaId}`);
      setOrdini(res.data);
    } catch (error) {
      console.error('Errore refresh ordini:', error);
    }
  };

  const updateStatus = async (ordineId, newStatus) => {
    try {
      await axios.put(`${API}/ordini/${ordineId}/status`, null, { params: { status: newStatus } });
      fetchOrdini();
    } catch (error) {
      console.error('Errore aggiornamento:', error);
    }
  };

  const ordiniOggi = ordini.filter(o => {
    const oggi = new Date().toISOString().split('T')[0];
    const dataOrdine = o.timestamp_creazione.split('T')[0];
    return dataOrdine === oggi;
  });

  const ordiniAttivi = ordini.filter(o => ['ricevuto', 'in_preparazione'].includes(o.status));
  const revenueOggi = ordiniOggi.reduce((sum, o) => sum + o.totale, 0);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--ocean-blue)' }}>Caricamento...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: '64px' }}>
      {/* Header */}
      <header style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '24px 0'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>🍕 {pizzeria?.nome}</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Dashboard Pizzeria</p>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '32px' }}>
        {/* Stats Oggi */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div className="glass-card" data-testid="stat-ordini">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Package size={24} style={{ color: 'var(--ocean-blue)' }} />
              <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Ordini Oggi</h3>
            </div>
            <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--ocean-blue)' }}>{ordiniOggi.length}</p>
          </div>
          <div className="glass-card" data-testid="stat-revenue">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <TrendingUp size={24} style={{ color: 'var(--teal)' }} />
              <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Revenue Oggi</h3>
            </div>
            <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--teal)' }}>€{revenueOggi.toFixed(2)}</p>
          </div>
          <div className="glass-card" data-testid="stat-rating">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Star size={24} style={{ color: '#FFD700' }} />
              <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Rating</h3>
            </div>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#FFD700' }}>{pizzeria?.rating_complessivo.toFixed(1)} ⭐</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>({pizzeria?.num_recensioni} recensioni)</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ordini" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="ordini" data-testid="tab-ordini">Ordini Attivi ({ordiniAttivi.length})</TabsTrigger>
            <TabsTrigger value="recensioni" data-testid="tab-recensioni">Recensioni</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Ordini Attivi */}
          <TabsContent value="ordini">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {ordiniAttivi.map(ordine => (
                <div key={ordine.id} className="glass-card" data-testid={`ordine-${ordine.id}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>Ordine #{ordine.id.slice(0, 8).toUpperCase()}</h3>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Slot: {ordine.slot_orario}
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: ordine.status === 'ricevuto' ? 'rgba(14, 165, 233, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                      color: ordine.status === 'ricevuto' ? 'var(--ocean-blue)' : '#EAB308'
                    }}>
                      {ordine.status === 'ricevuto' ? '🆕 Nuovo' : '🔥 In preparazione'}
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    {ordine.prodotti.map((prod, idx) => (
                      <div key={idx} style={{ fontSize: '14px', marginBottom: '4px' }}>
                        {prod.quantita}× {prod.nome}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <span><strong>Tipo:</strong> {ordine.tipo_ordine === 'ritiro' ? 'Ritiro' : 'Consegna'}</span>
                    <span>|</span>
                    <span><strong>Totale:</strong> €{ordine.totale.toFixed(2)}</span>
                  </div>

                  {ordine.note && (
                    <div style={{ padding: '12px', background: 'var(--glass-bg)', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                      <strong>Note:</strong> {ordine.note}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {ordine.status === 'ricevuto' && (
                      <>
                        <button
                          data-testid={`accetta-${ordine.id}`}
                          onClick={() => updateStatus(ordine.id, 'in_preparazione')}
                          style={{
                            flex: 1,
                            background: 'var(--ocean-blue)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          <CheckCircle size={18} /> ACCETTA
                        </button>
                        <button
                          onClick={() => updateStatus(ordine.id, 'annullato')}
                          style={{
                            flex: 1,
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.5)',
                            borderRadius: '8px',
                            padding: '12px',
                            color: '#EF4444',
                            cursor: 'pointer',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          <XCircle size={18} /> RIFIUTA
                        </button>
                      </>
                    )}
                    {ordine.status === 'in_preparazione' && (
                      <button
                        data-testid={`pronto-${ordine.id}`}
                        onClick={() => updateStatus(ordine.id, 'pronto')}
                        className="neon-button"
                        style={{ width: '100%' }}
                      >
                        SEGNA PRONTO ✓
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {ordiniAttivi.length === 0 && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '48px' }}>
                  <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Nessun ordine attivo al momento</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Recensioni */}
          <TabsContent value="recensioni">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recensioni.slice(0, 10).map(rec => (
                <div key={rec.id} className="glass-card" data-testid={`recensione-${rec.id}`}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} fill={i < Math.round((rec.voto_cibo * 0.7) + (rec.voto_servizio * 0.3)) ? '#FFD700' : 'none'} color='#FFD700' />
                    ))}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {new Date(rec.timestamp).toLocaleString('it-IT')}
                  </div>
                  <p style={{ fontSize: '14px', marginBottom: '12px' }}>{rec.commento || 'Nessun commento'}</p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>🍕 Cibo: {rec.voto_cibo}⭐</span>
                    <span>🚀 Servizio: {rec.voto_servizio}⭐</span>
                  </div>
                </div>
              ))}

              {recensioni.length === 0 && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '48px' }}>
                  <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Nessuna recensione ancora</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            {analytics && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div className="glass-card">
                  <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--text-secondary)' }}>Ultimi 30 Giorni</h3>
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Totale Ordini</p>
                    <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--ocean-blue)' }}>{analytics.totale_ordini}</p>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Revenue</p>
                    <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--teal)' }}>€{analytics.revenue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Ordine Medio</p>
                    <p style={{ fontSize: '24px', fontWeight: '600' }}>€{analytics.ordine_medio.toFixed(2)}</p>
                  </div>
                </div>

                <div className="glass-card">
                  <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--text-secondary)' }}>Top 5 Prodotti</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {analytics.top_prodotti.map((prod, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px' }}>{idx + 1}. {prod.nome}</span>
                        <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--ocean-blue)' }}>{prod.quantita}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardPizzeria;
