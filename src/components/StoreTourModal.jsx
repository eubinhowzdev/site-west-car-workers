import React, { useEffect } from 'react';
import { X, Play, MapPin, Shield, Award, Users, Calendar } from 'lucide-react';
import { STORE_INFO } from '../data/vehicles';

export function StoreTourModal({ onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="video-modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#E5242D', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Experiência West Car
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', color: '#FFFFFF' }}>
              Tour Virtual & Estrutura da Loja
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{ position: 'static' }}>
            <X size={20} />
          </button>
        </div>

        {/* Video Showcase Frame */}
        <div className="video-player-wrapper">
          <iframe
            src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=0"
            title="West Car Showroom Experience"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Informações da Loja e Agendamento */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
          <div style={{ background: '#141E28', padding: '1rem', borderRadius: '12px', border: '1px solid #1E2D3D' }}>
            <Award size={20} color="#E5242D" style={{ marginBottom: '0.4rem' }} />
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF' }}>Showroom Premium</h4>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.2rem' }}>Ambiente climatizado com mais de 50 carros em exposição</p>
          </div>
          <div style={{ background: '#141E28', padding: '1rem', borderRadius: '12px', border: '1px solid #1E2D3D' }}>
            <Shield size={20} color="#10B981" style={{ marginBottom: '0.4rem' }} />
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF' }}>Perícia Cautelar</h4>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.2rem' }}>Box exclusivo de perícia e inspeção mecânica presencial</p>
          </div>
          <div style={{ background: '#141E28', padding: '1rem', borderRadius: '12px', border: '1px solid #1E2D3D' }}>
            <Users size={20} color="#38BDF8" style={{ marginBottom: '0.4rem' }} />
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF' }}>Atendimento VIP</h4>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.2rem' }}>Cafeteria gourmet e consultoria financeira personalizada</p>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #1E2D3D', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={16} color="#E5242D" />
            {STORE_INFO.address}
          </div>
          <a
            href={`https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de agendar uma visita e test-drive na West Car Multimarcas.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary-pill"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
          >
            <Calendar size={16} />
            Agendar Visita & Test-Drive
          </a>
        </div>
      </div>
    </div>
  );
}
