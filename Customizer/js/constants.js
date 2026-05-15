/**
 * constants.js
 * Shared immutable data used across the Customizer.
 */

const PRESETS = Object.freeze({
  default: { accentColor:'#4f46e5', accentHover:'#4338ca', bgColor:'#f0f4f8', cardColor:'#ffffff', cardRadius:'12px', cardShadow:'0 4px 24px rgba(0,0,0,0.10)', headingColor:'#1a1a2e', labelColor:'#374151', inputBorder:'#d1d5db', inputBg:'#ffffff', inputColor:'#111111', fontFamily:"'Segoe UI', sans-serif", animationSpeed:'0.4s' },
  dark:    { accentColor:'#7c6af7', accentHover:'#6457e8', bgColor:'#0f0f0f',  cardColor:'#1e1e2e', cardRadius:'12px', cardShadow:'0 4px 32px rgba(0,0,0,0.5)',    headingColor:'#e2e8f0', labelColor:'#94a3b8', inputBorder:'#334155', inputBg:'#0f172a', inputColor:'#e2e8f0', fontFamily:"'Segoe UI', sans-serif", animationSpeed:'0.4s' },
  ocean:   { accentColor:'#0891b2', accentHover:'#0e7490', bgColor:'#e0f2fe',  cardColor:'#f0f9ff', cardRadius:'16px', cardShadow:'0 6px 28px rgba(14,116,144,0.15)', headingColor:'#0c4a6e', labelColor:'#075985', inputBorder:'#7dd3fc', inputBg:'#ffffff', inputColor:'#0c4a6e', fontFamily:"'Segoe UI', sans-serif", animationSpeed:'0.4s' },
  rose:    { accentColor:'#e11d48', accentHover:'#be123c', bgColor:'#fff1f2',  cardColor:'#ffffff', cardRadius:'16px', cardShadow:'0 4px 24px rgba(225,29,72,0.10)', headingColor:'#881337', labelColor:'#9f1239', inputBorder:'#fda4af', inputBg:'#fff1f2', inputColor:'#881337', fontFamily:"'Georgia', serif",       animationSpeed:'0.35s' },
  forest:  { accentColor:'#16a34a', accentHover:'#15803d', bgColor:'#f0fdf4',  cardColor:'#ffffff', cardRadius:'10px', cardShadow:'0 4px 20px rgba(20,83,45,0.10)',   headingColor:'#14532d', labelColor:'#166534', inputBorder:'#86efac', inputBg:'#f0fdf4', inputColor:'#14532d', fontFamily:"'Segoe UI', sans-serif", animationSpeed:'0.4s' },
  custom:  { accentColor:'#4f46e5', accentHover:'#4338ca', bgColor:'#f0f4f8',  cardColor:'#ffffff', cardRadius:'12px', cardShadow:'0 4px 24px rgba(0,0,0,0.10)',     headingColor:'#1a1a2e', labelColor:'#374151', inputBorder:'#d1d5db', inputBg:'#ffffff', inputColor:'#111111', fontFamily:"'Segoe UI', sans-serif", animationSpeed:'0.4s' },
});

const PRESET_SWATCHES = Object.freeze({
  default: { bg:'#4f46e5', card:'#ffffff' },
  dark:    { bg:'#0f0f0f', card:'#1e1e2e' },
  ocean:   { bg:'#0891b2', card:'#f0f9ff' },
  rose:    { bg:'#e11d48', card:'#fff1f2' },
  forest:  { bg:'#16a34a', card:'#f0fdf4' },
  custom:  { bg:'#888',    card:'#ffffff' },
});

const INPUT_TYPES = Object.freeze(['text', 'number', 'email', 'password', 'url', 'tel', 'date', 'textarea']);

const DEFAULT_CONFIG = Object.freeze({
  formTitle          : 'My Book App Form',
  transition         : 'slide',
  transitionDuration : '0.4s',
  transitionDelay    : '0s',
  style: { preset: 'default', ...PRESETS.default },
  pages: [
    { pageTitle: 'Page 1', inputs: [{ name: 'Field 1', type: 'text', limit: 100, required: false }] }
  ],
});

