import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Settings, ShoppingCart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MenuPage = () => {
  const { pizzeriaId } = useParams();
  const navigate = useNavigate();
  const [pizzeria, setPizzeria] = useState(null);
  const [menu, setMenu] = useState([]);
  const [categoriaSelezionata, setCategoriaSelezionata] = useState('Pizze');
  const [carrello, setCarrello] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [prodottoSelezionato, setProdottoSelezionato] = useState(null);
  const [personalizzazione, setPersonalizzazione] = useState({ base: 'margherita', extra: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Carica carrello da localStorage
    const saved = localStorage.getItem(`carrello_${pizzeriaId}`);
    if (saved) setCarrello(JSON.parse(saved));
  }, [pizzeriaId]);

  const fetchData = async () => {
    try {
      const [pizzeriaRes, menuRes] = await Promise.all([
        axios.get(`${API}/pizzerie/${pizzeriaId}`),
        axios.get(`${API}/menu/${pizzeriaId}`)
      ]);
      setPizzeria(pizzeriaRes.data);
      setMenu(menuRes.data);
    } catch (error) {
      console.error('Errore caricamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const categorie = ['Pizze', 'Panini', 'Bibite', 'Dessert'];
  const menuFiltrato = menu.filter(item => item.categoria === categoriaSelezionata && item.disponibile);

  const apriPersonalizza = (prodotto) => {
    setProdottoSelezionato(prodotto);
    setPersonalizzazione({ base: 'margherita', extra: [] });
    setModalOpen(true);
  };

  const aggiungiAlCarrello = (prodotto, personalizzato = false) => {
    const item = {
      id: prodotto.id + (personalizzato ? '_custom' : ''),
      nome: prodotto.nome,
      prezzo: prodotto.prezzo,
      quantita: 1,
      personalizzazione: personalizzato ? personalizzazione : null
    };

    if (personalizzato) {
      // Calcola prezzo con extra
      const prezzoExtra = personalizzazione.extra.reduce((sum, e) => sum + e.prezzo, 0);
      item.prezzo += prezzoExtra;
      item.nome += ' (personalizzata)';
    }

    const nuovoCarrello = [...carrello, item];
    setCarrello(nuovoCarrello);
    localStorage.setItem(`carrello_${pizzeriaId}`, JSON.stringify(nuovoCarrello));
    setModalOpen(false);
  };

  const totaleCarrello = carrello.reduce((sum, item) => sum + (item.prezzo * item.quantita), 0);

  const extraDisponibili = [
    { nome: 'Prosciutto', prezzo: 1.5 },
    { nome: 'Funghi', prezzo: 1.0 },
    { nome: 'Olive', prezzo: 0.8 },
    { nome: 'Salame piccante', prezzo: 1.2 },
    { nome: 'Mozzarella extra', prezzo: 1.5 },
    { nome: 'Rucola', prezzo: 0.5 }
  ];

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ocean-blue)' }}>Caricamento...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: '100px' }}>
      {/* Header */}
      <header style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100
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
            <h1 style={{ fontSize: '20px', margin: 0 }}>{pizzeria?.nome}</h1>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              ⭐ {pizzeria?.rating_complessivo.toFixed(1)}/5 ({pizzeria?.num_recensioni} recensioni)
            </div>
          </div>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '24px' }}>
        {/* Categorie */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', padding: '8px 0' }}>
          {categorie.map(cat => (
            <button
              key={cat}
              data-testid={`categoria-${cat}`}
              onClick={() => setCategoriaSelezionata(cat)}
              style={{
                background: categoriaSelezionata === cat ? 'var(--ocean-blue)' : 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '20px',
                padding: '8px 20px',
                color: 'white',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: categoriaSelezionata === cat ? '600' : '400',
                transition: 'all 0.3s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {menuFiltrato.map(item => (
            <div key={item.id} className="glass-card" data-testid={`menu-item-${item.id}`} style={{ display: 'flex', gap: '16px', padding: '16px' }}>
              {/* Foto */}
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '12px',
                background: item.foto_url ? `url(${item.foto_url})` : 'linear-gradient(135deg, var(--ocean-blue), var(--teal))',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}>
                {!item.foto_url && '🍕'}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '18px', margin: 0 }}>{item.nome}</h3>
                  <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--ocean-blue)' }}>€{item.prezzo.toFixed(2)}</span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>{item.descrizione}</p>
                
                {/* Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    data-testid={`add-btn-${item.id}`}
                    onClick={() => aggiungiAlCarrello(item)}
                    style={{
                      background: 'var(--ocean-blue)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    <Plus size={16} /> Aggiungi
                  </button>
                  {item.personalizzabile && (
                    <button
                      data-testid={`personalizza-btn-${item.id}`}
                      onClick={() => apriPersonalizza(item)}
                      style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <Settings size={16} /> Personalizza
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {menuFiltrato.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>
            <p>Nessun prodotto disponibile in questa categoria</p>
          </div>
        )}
      </div>

      {/* Carrello Fixed Bottom */}
      {carrello.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--glass-border)',
          padding: '16px',
          zIndex: 100
        }}>
          <div className="container">
            <button
              data-testid="vai-checkout-btn"
              className="neon-button"
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onClick={() => navigate('/checkout', { state: { pizzeriaId, carrello, pizzeria } })}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingCart size={20} />
                CARRELLO ({carrello.length} prodotti)
              </span>
              <span>€{totaleCarrello.toFixed(2)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Personalizzazione */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md" style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}>
          <DialogHeader>
            <DialogTitle>✨ Personalizza la tua pizza</DialogTitle>
          </DialogHeader>
          
          <div style={{ padding: '16px 0' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '16px' }}>Base:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              {['margherita', 'bianca', 'integrale'].map(base => (
                <label key={base} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="base"
                    checked={personalizzazione.base === base}
                    onChange={() => setPersonalizzazione({ ...personalizzazione, base })}
                  />
                  <span style={{ textTransform: 'capitalize' }}>{base} {base === 'margherita' ? '(+€0)' : base === 'bianca' ? '(+€0.50)' : '(+€1.00)'}</span>
                </label>
              ))}
            </div>

            <h4 style={{ marginBottom: '12px', fontSize: '16px' }}>Ingredienti Extra:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {extraDisponibili.map(extra => (
                <label key={extra.nome} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <Checkbox
                    checked={personalizzazione.extra.some(e => e.nome === extra.nome)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPersonalizzazione({
                          ...personalizzazione,
                          extra: [...personalizzazione.extra, extra]
                        });
                      } else {
                        setPersonalizzazione({
                          ...personalizzazione,
                          extra: personalizzazione.extra.filter(e => e.nome !== extra.nome)
                        });
                      }
                    }}
                  />
                  <span>{extra.nome} (+€{extra.prezzo.toFixed(2)})</span>
                </label>
              ))}
            </div>

            <div style={{ marginTop: '24px', padding: '16px', background: 'var(--glass-bg)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600' }}>Totale:</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--ocean-blue)' }}>
                  €{(prodottoSelezionato?.prezzo + personalizzazione.extra.reduce((s, e) => s + e.prezzo, 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Annulla</Button>
            <Button
              data-testid="aggiungi-personalizzato-btn"
              onClick={() => aggiungiAlCarrello(prodottoSelezionato, true)}
              style={{ background: 'var(--ocean-blue)' }}
            >
              Aggiungi al Carrello
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuPage;
