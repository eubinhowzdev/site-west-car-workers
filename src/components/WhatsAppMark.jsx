import React from 'react';

export function WhatsAppMark({ variant = 'white', size = 24, className = '' }) {
  return (
    <img
      src={`/icons/whatsapp-glyph-${variant}.svg`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`whatsapp-mark ${className}`}
    />
  );
}
