import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Phone, Mail, FileText } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pizzeriaId, carrello, pizzeria } = location.state || {};

  const [tipoOrdine, setTipoOrdine] = useState('ritiro');
  const [slots, setSlots] = useState([]);
  const [slotSelezionato, setSlotSelezionato] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    telefono: '',
    email: '',
    indirizzo: '',
    note: ''
  });
  const [accettato, setAccettato] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pizzeriaId || !carrello) {
      navigate('/');
      return;
    }
    fetchSlots();
  }, [pizzeriaId]);

  const fetchSlots = async () => {
    try {
      const oggi = new Date().toISOString().split('T')[0];
      const response = await axios.get(`${API}/slots/${pizzeriaId}`, { params: { data: oggi } });
      setSlots(response.data);
      // Seleziona automaticamente il primo disponibile
      const primo = response.data.find(s => s.disponibile);
      if (primo) setSlotSelezionato(primo.orario);
    } catch (error) {
      console.error('Errore caricamento slot:', error);
    }
  };

  const totale = carrello?.reduce((sum, item) => sum + (item.prezzo * item.quantita), 0) || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accettato) {
      toast.error('Devi accettare termini e privacy');
      return;
    }

    setLoading(true);
    try {
      const ordineData = {
        cliente_nome: formData.nome,
        cliente_telefono: formData.telefono,
        cliente_email: formData.email || null,
        pizzeria_id: pizzeriaId,
        prodotti: carrello,
        totale: totale,
        tipo_ordine: tipoOrdine,
        indirizzo_consegna: tipoOrdine === 'consegna' ? formData.indirizzo : null,
        slot_orario: slotSelezionato,
        note: formData.note || null
      };

      const response = await axios.post(`${API}/ordini`, ordineData);
      const ordineId = response.data.id;

      // Svuota carrello
      localStorage.removeItem(`carrello_${pizzeriaId}`);

      // Redirect a conferma
      navigate(`/track/${ordineId}`, { state: { nuovo: true, pizzeria } });
    } catch (error) {
      console.error('Errore creazione ordine:', error);
      toast.error('Errore durante la creazione dell\'ordine');
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
          <h1 style={{ fontSize: '20px', margin: 0 }}>📋 Riepilogo Ordine</h1>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '32px', maxWidth: '600px' }}>
        <form onSubmit={handleSubmit}>
          {/* Riepilogo */}
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>{pizzeria?.nome}</h2>
            {carrello?.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', padding: '8px 0', borderBottom: idx < carrello.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                <div>
                  <div>{item.quantita}× {item.nome}</div>
                  {item.personalizzazione && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {item.personalizzazione.extra.map(e => e.nome).join(', ')}
                    </div>
                  )}
                </div>
                <div>€{(item.prezzo * item.quantita).toFixed(2)}</div>
              </div>
            ))}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px solid var(--ocean-blue)', display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '700' }}>
              <span>TOTALE:</span>
              <span style={{ color: 'var(--ocean-blue)' }}>€{totale.toFixed(2)}</span>
            </div>
          </div>

          {/* Tipo Ordine */}
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Tipo Ordine:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px', background: tipoOrdine === 'ritiro' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', borderRadius: '8px', border: '1px solid ' + (tipoOrdine === 'ritiro' ? 'var(--ocean-blue)' : 'var(--glass-border)') }}>
                <input
                  type="radio"
                  name="tipo"
                  value="ritiro"
                  checked={tipoOrdine === 'ritiro'}
                  onChange={(e) => setTipoOrdine(e.target.value)}
                  data-testid="tipo-ritiro"
                />
                <span>Ritiro in sede</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px', background: tipoOrdine === 'consegna' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', borderRadius: '8px', border: '1px solid ' + (tipoOrdine === 'consegna' ? 'var(--ocean-blue)' : 'var(--glass-border)') }}>
                <input
                  type="radio"
                  name="tipo"
                  value="consegna"
                  checked={tipoOrdine === 'consegna'}
                  onChange={(e) => setTipoOrdine(e.target.value)}
                  data-testid="tipo-consegna"
                />
                <span>Consegna a domicilio</span>
              </label>
            </div>
          </div>

          {/* Slot Temporale */}
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} /> Quando lo vuoi?
            </h3>
            <select
              data-testid="slot-select"
              className="select-glass"
              value={slotSelezionato}
              onChange={(e) => setSlotSelezionato(e.target.value)}
              required
            >
              <option value="">Seleziona orario</option>
              {slots.map(slot => (
                <option key={slot.orario} value={slot.orario} disabled={!slot.disponibile}>
                  {slot.orario} - {slot.disponibile ? `Disponibile (${slot.occupazione}%)` : 'Occupato'}
                </option>
              ))}
            </select>
          </div>

          {/* Dati Cliente */}
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>I Tuoi Dati:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Nome *</label>
                <input
                  data-testid="input-nome"
                  className="input-glass"
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  placeholder="Mario Rossi"
                />
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
                  placeholder="+39 333 1234567"
                />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px' }}>
                  <Mail size={16} /> Email (opzionale)
                </label>
                <input
                  data-testid="input-email"
                  className="input-glass"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="mario@example.com"
                />
              </div>
              {tipoOrdine === 'consegna' && (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px' }}>
                    <MapPin size={16} /> Indirizzo Consegna *
                  </label>
                  <input
                    data-testid="input-indirizzo"
                    className="input-glass"
                    type="text"
                    value={formData.indirizzo}
                    onChange={(e) => setFormData({ ...formData, indirizzo: e.target.value })}
                    required={tipoOrdine === 'consegna'}
                    placeholder="Via Roma 15, Catania"
                  />
                </div>
              )}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px' }}>
                  <FileText size={16} /> Note aggiuntive
                </label>
                <textarea
                  data-testid="input-note"
                  className="textarea-glass"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Es: Suonare al citofono..."
                />
              </div>
            </div>
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
                Accetto i <a href="#" style={{ color: 'var(--ocean-blue)', textDecoration: 'underline' }}>Termini & Condizioni</a> e la <a href="#" style={{ color: 'var(--ocean-blue)', textDecoration: 'underline' }}>Privacy Policy</a>
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            data-testid="conferma-ordine-btn"
            type="submit"
            className="neon-button"
            style={{ width: '100%', fontSize: '18px' }}
            disabled={loading}
          >
            {loading ? 'Invio in corso...' : 'CONFERMA ORDINE →'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
