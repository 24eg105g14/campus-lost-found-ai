import React, { useEffect, useRef, useState } from 'react';

/**
 * ElectricBackground — Decorative SVG energy trails that flow behind content.
 * 
 * Props:
 *  - variant: 'hero' | 'features' | 'workflow' | 'why' — controls which paths render
 *  
 * Each path has 3 layers: blurred glow, medium glow, and thin bright core.
 * All layers use pointer-events: none so content remains interactive.
 */

const PATHS = {
  hero: [
    // Upper-left flowing in: blue → cyan → violet
    {
      d: 'M-60,80 C60,90 140,20 260,60 C380,100 420,160 540,120 C660,80 700,40 800,90',
      gradient: 'heroPath1',
      colors: ['#2563eb', '#38bdf8', '#818cf8'],
      delay: '0s',
    },
    // Upper-right flowing in: coral → violet → blue
    {
      d: 'M1400,40 C1280,80 1180,120 1060,70 C940,20 860,90 760,60 C660,30 580,80 500,50',
      gradient: 'heroPath2',
      colors: ['#f43f5e', '#fb7185', '#818cf8', '#38bdf8'],
      delay: '2s',
    },
    // Below hero CTAs: blue → white → coral
    {
      d: 'M100,380 C200,360 320,400 460,370 C600,340 700,390 840,360 C980,330 1100,380 1260,350',
      gradient: 'heroPath3',
      colors: ['#2563eb', '#38bdf8', '#ffffff', '#fb7185', '#f43f5e'],
      delay: '1s',
    },
    // Connecting toward features: cyan → violet → coral
    {
      d: 'M-40,480 C80,460 200,520 340,480 C480,440 580,500 720,470',
      gradient: 'heroPath4',
      colors: ['#38bdf8', '#818cf8', '#fb7185'],
      delay: '3s',
    },
  ],
  features: [
    // Horizontal line behind feature cards
    {
      d: 'M40,40 C180,30 300,60 460,35 C620,10 740,55 900,30 C1060,5 1180,50 1340,25',
      gradient: 'featPath1',
      colors: ['#2563eb', '#38bdf8', '#818cf8', '#fb7185'],
      delay: '0s',
    },
  ],
  workflow: [
    // Energy trailing left side
    {
      d: 'M-30,60 C80,40 180,100 300,70 C420,40 500,90 620,55',
      gradient: 'workPath1',
      colors: ['#2563eb', '#38bdf8', '#818cf8'],
      delay: '0.5s',
    },
    // Energy trailing right side
    {
      d: 'M780,80 C900,50 1000,110 1120,70 C1240,30 1340,90 1420,60',
      gradient: 'workPath2',
      colors: ['#818cf8', '#fb7185', '#f43f5e'],
      delay: '1.5s',
    },
  ],
  why: [
    // Subtle trail on left
    {
      d: 'M-40,100 C60,80 160,140 280,100 C400,60 480,120 580,90',
      gradient: 'whyPath1',
      colors: ['#2563eb', '#38bdf8', '#818cf8'],
      delay: '0s',
    },
    // Subtle trail on right
    {
      d: 'M820,160 C940,130 1040,190 1160,150 C1280,110 1360,170 1440,140',
      gradient: 'whyPath2',
      colors: ['#fb7185', '#818cf8', '#38bdf8'],
      delay: '2s',
    },
  ],
  auth: [
    { d: 'M-80,150 C100,70 220,190 390,105 C520,40 610,90 720,65', gradient: 'authBlue', colors: ['#2563eb', '#38bdf8', '#818cf8'], delay: '0s' },
    { d: 'M760,760 C930,680 1080,790 1210,700 C1310,635 1390,680 1490,620', gradient: 'authCoral', colors: ['#818cf8', '#fb7185', '#f43f5e'], delay: '2s' },
  ],
  dashboard: [
    { d: 'M-80,145 C160,75 310,175 520,110 C720,50 880,155 1080,92 C1220,48 1360,75 1480,35', gradient: 'dashTop', colors: ['#2563eb', '#38bdf8', '#818cf8', '#fb7185'], delay: '0s' },
    { d: 'M-60,720 C140,650 300,760 470,700 C650,635 790,745 970,680 C1160,610 1320,720 1480,650', gradient: 'dashBottom', colors: ['#2563eb', '#38bdf8', '#ffffff', '#fb7185'], delay: '2s' },
  ],
  content: [
    { d: 'M-100,190 C110,120 250,225 450,160 C650,95 780,205 990,145 C1170,95 1320,145 1500,90', gradient: 'contentTop', colors: ['#2563eb', '#38bdf8', '#818cf8', '#fb7185'], delay: '1s' },
    { d: 'M-80,790 C170,720 340,820 560,760 C780,700 930,800 1150,735 C1280,700 1400,720 1500,680', gradient: 'contentBottom', colors: ['#38bdf8', '#818cf8', '#fb7185'], delay: '3s' },
  ],
  form: [
    { d: 'M-90,250 C100,165 230,280 410,205 C540,150 630,180 745,145', gradient: 'formLeft', colors: ['#2563eb', '#38bdf8', '#818cf8'], delay: '0s' },
    { d: 'M720,850 C900,770 1050,890 1210,805 C1330,740 1410,770 1500,720', gradient: 'formRight', colors: ['#818cf8', '#fb7185', '#f43f5e'], delay: '2s' },
  ],
  verification: [
    { d: 'M-80,170 C120,70 260,220 450,125 C630,35 760,190 950,100 C1140,10 1300,145 1500,55', gradient: 'verifyTop', colors: ['#2563eb', '#38bdf8', '#818cf8', '#fb7185'], delay: '0s' },
    { d: 'M-60,700 C130,610 300,760 490,665 C680,570 810,735 1010,635 C1200,540 1350,670 1490,590', gradient: 'verifyBottom', colors: ['#2563eb', '#38bdf8', '#ffffff', '#fb7185', '#f43f5e'], delay: '2s' },
  ],
  chat: [
    { d: 'M-100,220 C130,145 270,250 480,180 C680,115 850,225 1060,155 C1230,100 1370,145 1500,105', gradient: 'chatTrail', colors: ['#2563eb', '#38bdf8', '#818cf8', '#fb7185'], delay: '1s' },
  ],
};

function ElectricPath({ pathData, index }) {
  const { d, gradient, colors, delay } = pathData;
  const gradId = `${gradient}_${index}`;

  return (
    <>
      {/* Gradient definition */}
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          {colors.map((color, i) => (
            <stop
              key={i}
              offset={`${(i / (colors.length - 1)) * 100}%`}
              stopColor={color}
              stopOpacity={color === '#ffffff' ? 0.6 : 0.9}
            />
          ))}
        </linearGradient>
      </defs>

      {/* Layer 1: Large blurred glow */}
      <path
        d={d}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="6"
        strokeLinecap="round"
        className="electric-path-glow animate-electric-pulse"
        style={{ animationDelay: delay }}
      />

      {/* Layer 2: Medium glow */}
      <path
        d={d}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        className="electric-path-mid animate-electric-pulse-slow"
        style={{ animationDelay: delay }}
      />

      {/* Layer 3: Thin bright core with dash animation */}
      <path
        d={d}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="12 18 6 24"
        className="electric-path-core animate-dash-travel"
        style={{ animationDelay: delay }}
      />
    </>
  );
}

export default function ElectricBackground({ variant = 'hero', fixed = false }) {
  const paths = PATHS[variant] || [];
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Determine viewBox height based on variant
  const heights = { hero: 540, features: 80, workflow: 200, why: 260, auth: 900, dashboard: 900, content: 900, form: 1000, verification: 900, chat: 900 };
  const viewHeight = heights[variant] || 400;

  return (
    <div
      ref={ref}
      className={`${fixed ? 'fixed' : 'absolute'} inset-0 overflow-hidden pointer-events-none select-none electric-background electric-background-${variant}`}
      style={{ zIndex: fixed ? 0 : 1 }}
      aria-hidden="true"
    >
      <svg
        className={`w-full h-full transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}
        viewBox={`0 0 1400 ${viewHeight}`}
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {paths.map((pathData, i) => (
          <ElectricPath key={i} pathData={pathData} index={i} />
        ))}
      </svg>
    </div>
  );
}
