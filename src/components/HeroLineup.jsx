import React from 'react';

const HERO_CARS = [
  { src: '/images/vehicles/hero-up.png', alt: 'Volkswagen Up vermelho', position: 'hero-up' },
  { src: '/images/vehicles/hero-hb20.png', alt: 'Hyundai HB20 branco', position: 'hero-hb20' },
  { src: '/images/vehicles/hero-equinox.png', alt: 'Chevrolet Equinox branca', position: 'hero-equinox' },
  { src: '/images/vehicles/hero-cruze.png', alt: 'Chevrolet Cruze preto', position: 'hero-cruze' },
  { src: '/images/vehicles/hero-strada.png', alt: 'Fiat Strada branca', position: 'hero-strada' },
  { src: '/images/vehicles/hero-argo.png', alt: 'Fiat Argo prata', position: 'hero-argo' }
];

export function HeroLineup() {
  return (
    <div className="hero-lineup" aria-label="Veículos disponíveis na West Car">
      <div className="hero-lineup-stage">
        {HERO_CARS.map((car) => (
          <img
            key={car.src}
            src={car.src}
            alt={car.alt}
            className={`hero-vehicle ${car.position}`}
            loading="eager"
          />
        ))}
      </div>
    </div>
  );
}
