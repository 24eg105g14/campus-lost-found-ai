import React from 'react';

/**
 * ElectricParticles — Subtle glowing particle dots that drift slowly.
 * 
 * Renders a small number of absolute-positioned dots.
 * Hidden on mobile, reduced on tablet via CSS.
 */

const PARTICLES = [
  // Blue particles
  { top: '15%', left: '10%', size: '4px', color: '#38bdf8', delay: '0s', duration: '12s' },
  { top: '60%', left: '15%', size: '3px', color: '#2563eb', delay: '2s', duration: '15s' },
  { top: '35%', left: '85%', size: '5px', color: '#38bdf8', delay: '4s', duration: '10s' },
  { top: '80%', left: '80%', size: '3px', color: '#2563eb', delay: '1s', duration: '14s' },
  
  // Coral particles
  { top: '25%', left: '75%', size: '4px', color: '#fb7185', delay: '3s', duration: '11s' },
  { top: '70%', left: '25%', size: '3px', color: '#f43f5e', delay: '5s', duration: '13s' },
  { top: '45%', left: '10%', size: '4px', color: '#fb7185', delay: '1s', duration: '12s' },
  
  // White/Spark particles
  { top: '20%', left: '40%', size: '2px', color: '#ffffff', delay: '0s', duration: '8s' },
  { top: '85%', left: '60%', size: '3px', color: '#ffffff', delay: '2s', duration: '9s' },
  { top: '50%', left: '90%', size: '2px', color: '#ffffff', delay: '4s', duration: '10s' },
];

export default function ElectricParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 hidden md:block" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-particle-drift"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${parseInt(p.size) * 3}px ${p.color}`,
            animationDelay: p.delay,
            animationDuration: p.duration,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
}
