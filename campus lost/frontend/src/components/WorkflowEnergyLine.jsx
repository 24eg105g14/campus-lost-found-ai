import React from 'react';

/**
 * WorkflowEnergyLine — Horizontal energy connection behind workflow steps.
 * 
 * Renders a glowing SVG line connecting the steps.
 * Hidden on mobile where cards stack vertically.
 */
export default function WorkflowEnergyLine() {
  return (
    <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-20 pointer-events-none select-none z-0 hidden md:block" aria-hidden="true">
      <svg className="w-full h-full" viewBox="0 0 1000 80" preserveAspectRatio="none">
        <defs>
          <linearGradient id="workflowLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.8" />
            <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#2563eb" stopOpacity="0.8" />
            <stop offset="75%" stopColor="#818cf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Base line */}
        <path
          d="M 50,40 Q 150,20 250,40 T 450,40 T 650,40 T 850,40 T 950,40"
          fill="none"
          stroke="url(#workflowLineGrad)"
          strokeWidth="4"
          className="electric-path-glow animate-electric-pulse-slow"
        />
        
        {/* Core line */}
        <path
          d="M 50,40 Q 150,20 250,40 T 450,40 T 650,40 T 850,40 T 950,40"
          fill="none"
          stroke="url(#workflowLineGrad)"
          strokeWidth="1.5"
          strokeDasharray="8 12"
          className="electric-path-core animate-dash-travel"
        />
      </svg>
    </div>
  );
}
