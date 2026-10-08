import React from 'react';
import lostLinkLogo from '../logo/image.png';

export default function BrandLogo({ variant = 'navbar', className = '' }) {
  return (
    <img
      src={lostLinkLogo}
      alt="LostLink - Anurag University"
      width="126"
      height="42"
      className={`lostlink-logo lostlink-logo-${variant} ${className}`.trim()}
    />
  );
}
