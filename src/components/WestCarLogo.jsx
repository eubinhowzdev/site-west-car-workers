import React from 'react';

export function WestCarLogo({ variant = 'light', className = '', height = 48 }) {
  return (
    <div
      className={`westcar-logo-wrapper ${variant === 'dark' ? 'is-on-dark' : ''} ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center' }}
    >
      <img
        src="/images/west-car-logo-black.png"
        alt="West Car Multimarcas"
        className="westcar-logo-raster"
        style={{ height: `${height}px`, width: 'auto', display: 'block' }}
      />
    </div>
  );
}
