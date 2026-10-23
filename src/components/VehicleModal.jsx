import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Cog,
  Fuel,
  Gauge,
  Palette,
  Wrench,
  X
} from 'lucide-react';
import { STORE_INFO } from '../data/vehicles';
import { WhatsAppMark } from './WhatsAppMark';

const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(value);

export function VehicleModal({ vehicle, onClose }) {
  const [activeImage, setActiveImage] = useState(0);
  const modalRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;

      const focusable = [...modalRef.current.querySelectorAll('button:not(:disabled), a[href]')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  const goToImage = (direction) => {
    setActiveImage((current) =>
      (current + direction + vehicle.images.length) % vehicle.images.length
    );
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <article ref={modalRef} className="vehicle-modal" role="dialog" aria-modal="true" aria-labelledby="vehicle-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <button ref={closeRef} className="modal-close" type="button" onClick={onClose} aria-label="Fechar detalhes">
          <X />
        </button>

        <div className="modal-gallery">
          <div className="modal-main-photo">
            <img
              src={vehicle.images[activeImage]}
              alt={`${vehicle.brand} ${vehicle.model} — foto ${activeImage + 1}`}
            />
            <button type="button" className="gallery-arrow gallery-arrow-left" onClick={() => goToImage(-1)} aria-label="Foto anterior">
              <ArrowLeft />
            </button>
            <button type="button" className="gallery-arrow gallery-arrow-right" onClick={() => goToImage(1)} aria-label="Próxima foto">
              <ArrowRight />
            </button>
            <span className="gallery-counter">{activeImage + 1} / {vehicle.images.length}</span>
          </div>

          <div className="modal-thumbnails">
            {vehicle.images.map((image, index) => (
              <button
                key={image}
                type="button"
                className={activeImage === index ? 'active' : ''}
                onClick={() => setActiveImage(index)}
                aria-label={`Abrir foto ${index + 1}`}
              >
                <img src={image} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        <div className="modal-details">
          <p className="modal-brand">{vehicle.brand} · {vehicle.category}</p>
          <h2 id="vehicle-modal-title">{vehicle.model}</h2>
          <p className="modal-version">{vehicle.version}</p>

          <div className="modal-price">
            <small>Preço à vista</small>
            <strong>{formatPrice(vehicle.price)}</strong>
          </div>

          <div className="modal-facts">
            <span><CalendarDays /> <small>Ano</small><strong>{vehicle.year}</strong></span>
            <span><Gauge /> <small>Quilometragem</small><strong>{vehicle.mileage || 'Sob consulta'}</strong></span>
            <span><Cog /> <small>Câmbio</small><strong>{vehicle.transmission}</strong></span>
            <span><Fuel /> <small>Combustível</small><strong>{vehicle.fuel}</strong></span>
            <span><Palette /> <small>Cor</small><strong>{vehicle.color}</strong></span>
            <span><Wrench /> <small>Motor</small><strong>{vehicle.engine}</strong></span>
          </div>

          <p className="modal-description">{vehicle.description}</p>

          <a className="button button-primary modal-call" href={STORE_INFO.whatsappHref} target="_blank" rel="noreferrer">
            <WhatsAppMark size={20} />
            Consultar no WhatsApp
          </a>
          <p className="modal-note">Confirme disponibilidade e demais informações diretamente com a loja.</p>
        </div>
      </article>
    </div>
  );
}
