const fs = require('fs');
const path = require('path');

const menDir = path.join(__dirname, '../public/social-assets/men');
const womenDir = path.join(__dirname, '../public/social-assets/women');

fs.mkdirSync(menDir, { recursive: true });
fs.mkdirSync(womenDir, { recursive: true });

function svgWrapper(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#1E293B" flood-opacity="0.12" />
    </filter>
    <linearGradient id="foldLight" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.15" />
      <stop offset="50%" stop-color="#000000" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.1" />
    </linearGradient>
  </defs>
  ${content}
</svg>`;
}

// -------------------------------------------------------------
// MEN'S PIECES
// -------------------------------------------------------------
const menAssets = {
  'kaftan-slate.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <!-- Main Kaftan Body -->
      <path d="M120 70 L280 70 L265 370 L135 370 Z" fill="#475569" />
      <!-- Sleeves -->
      <path d="M120 70 L50 160 L90 190 L130 130 Z" fill="#3B485A" />
      <path d="M280 70 L350 160 L310 190 L270 130 Z" fill="#3B485A" />
      <!-- Traditional Nigerian V-Neck Embroidery -->
      <path d="M175 70 L200 170 L225 70" fill="none" stroke="#D1D5DB" stroke-width="4" stroke-linecap="round" />
      <path d="M190 70 L200 150 L210 70" fill="none" stroke="#94A3B8" stroke-width="2" />
      <circle cx="200" cy="185" r="4" fill="#E2E8F0" />
      <circle cx="200" cy="210" r="4" fill="#E2E8F0" />
      <!-- Subtle Center Fold -->
      <line x1="200" y1="170" x2="200" y2="370" stroke="#334155" stroke-width="1.5" stroke-dasharray="3,3" />
      <!-- Side Slits -->
      <line x1="135" y1="310" x2="135" y2="370" stroke="#1E293B" stroke-width="2" />
      <line x1="265" y1="310" x2="265" y2="370" stroke="#1E293B" stroke-width="2" />
    </g>
  `),

  'kaftan-white.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <path d="M120 70 L280 70 L265 370 L135 370 Z" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
      <path d="M120 70 L50 160 L90 190 L130 130 Z" fill="#F1F5F9" />
      <path d="M280 70 L350 160 L310 190 L270 130 Z" fill="#F1F5F9" />
      <!-- Gold Thread Minimalist Embroidery -->
      <path d="M175 70 L200 165 L225 70" fill="none" stroke="#D97706" stroke-width="3" stroke-linecap="round" />
      <path d="M185 70 L200 150 L215 70" fill="none" stroke="#F59E0B" stroke-width="1.5" />
      <circle cx="200" cy="180" r="3.5" fill="#D97706" />
      <circle cx="200" cy="200" r="3.5" fill="#D97706" />
      <line x1="200" y1="165" x2="200" y2="370" stroke="#E2E8F0" stroke-width="1.5" stroke-dasharray="2,2" />
    </g>
  `),

  'blazer-navy.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <path d="M110 80 L290 80 L305 340 L95 340 Z" fill="#1E293B" />
      <!-- Sleeves -->
      <path d="M110 80 L40 250 L85 260 L120 160 Z" fill="#0F172A" />
      <path d="M290 80 L360 250 L315 260 L280 160 Z" fill="#0F172A" />
      <!-- Lapels -->
      <polygon points="150,80 120,200 200,240 200,80" fill="#334155" />
      <polygon points="250,80 280,200 200,240 200,80" fill="#334155" />
      <!-- Horn Buttons -->
      <circle cx="200" cy="245" r="4.5" fill="#B45309" stroke="#78350F" stroke-width="1" />
      <circle cx="200" cy="275" r="4.5" fill="#B45309" stroke="#78350F" stroke-width="1" />
      <!-- Pocket Square Slot -->
      <rect x="135" y="150" width="35" height="4" rx="2" fill="#E2E8F0" />
    </g>
  `),

  'shirt-white.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <path d="M125 90 L275 90 L260 350 L140 350 Z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
      <path d="M125 90 L60 220 L95 230 L135 150 Z" fill="#F8FAFC" />
      <path d="M275 90 L340 220 L305 230 L265 150 Z" fill="#F8FAFC" />
      <!-- Pointed Collar -->
      <polygon points="155,90 200,125 175,135 145,95" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1" />
      <polygon points="245,90 200,125 225,135 255,95" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1" />
      <!-- Placket and Mother of Pearl Buttons -->
      <line x1="200" y1="125" x2="200" y2="350" stroke="#E2E8F0" stroke-width="12" />
      <circle cx="200" cy="155" r="3" fill="#94A3B8" />
      <circle cx="200" cy="195" r="3" fill="#94A3B8" />
      <circle cx="200" cy="235" r="3" fill="#94A3B8" />
      <circle cx="200" cy="275" r="3" fill="#94A3B8" />
    </g>
  `),

  'shirt-linen-beige.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <path d="M120 90 L280 90 L265 340 L135 340 Z" fill="#E5D9C5" />
      <path d="M120 90 L55 200 L95 210 L135 140 Z" fill="#DACBB4" />
      <path d="M280 90 L345 200 L305 210 L265 140 Z" fill="#DACBB4" />
      <!-- Camp Collar Notch -->
      <polygon points="145,90 200,120 180,135 135,100" fill="#D3C3AB" />
      <polygon points="255,90 200,120 220,135 265,100" fill="#D3C3AB" />
      <!-- Wooden Buttons -->
      <line x1="200" y1="120" x2="200" y2="340" stroke="#DACBB4" stroke-width="10" />
      <circle cx="200" cy="160" r="3.5" fill="#78350F" />
      <circle cx="200" cy="210" r="3.5" fill="#78350F" />
      <circle cx="200" cy="260" r="3.5" fill="#78350F" />
    </g>
  `),

  'polo-olive.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <path d="M125 90 L275 90 L265 330 L135 330 Z" fill="#4B5842" />
      <path d="M125 90 L65 180 L105 195 L140 135 Z" fill="#3F4B37" />
      <path d="M275 90 L335 180 L295 195 L260 135 Z" fill="#3F4B37" />
      <!-- Ribbed Collar -->
      <polygon points="150,90 200,115 175,130 135,95" fill="#36402F" />
      <polygon points="250,90 200,115 225,130 265,95" fill="#36402F" />
      <rect x="193" y="115" width="14" height="60" fill="#3F4B37" />
      <circle cx="200" cy="135" r="3" fill="#D1D5DB" />
      <circle cx="200" cy="155" r="3" fill="#D1D5DB" />
    </g>
  `),

  'shirt-black.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <path d="M125 90 L275 90 L260 340 L140 340 Z" fill="#18181B" />
      <path d="M125 90 L60 210 L100 220 L135 140 Z" fill="#09090B" />
      <path d="M275 90 L340 210 L300 220 L265 140 Z" fill="#09090B" />
      <!-- Mandarin Stand Collar -->
      <path d="M165 85 Q200 95 235 85 L235 75 Q200 85 165 75 Z" fill="#27272A" />
      <!-- Concealed Placket -->
      <line x1="200" y1="85" x2="200" y2="340" stroke="#27272A" stroke-width="8" />
    </g>
  `),

  'trousers-charcoal.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <!-- Waistband -->
      <rect x="130" y="50" width="140" height="24" rx="4" fill="#334155" />
      <!-- Pleats & Legs -->
      <path d="M130 74 L110 360 L185 360 L195 140 L205 140 L215 360 L290 360 L270 74 Z" fill="#475569" />
      <!-- Center Creases -->
      <line x1="150" y1="74" x2="147" y2="360" stroke="#1E293B" stroke-width="1.5" />
      <line x1="250" y1="74" x2="253" y2="360" stroke="#1E293B" stroke-width="1.5" />
    </g>
  `),

  'chinos-khaki.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <rect x="135" y="50" width="130" height="22" rx="3" fill="#BFAF9B" />
      <path d="M135 72 L120 355 L185 355 L195 130 L205 130 L215 355 L280 355 L265 72 Z" fill="#D3C5B2" />
      <line x1="165" y1="72" x2="165" y2="105" stroke="#9E8E7A" stroke-width="1.5" />
      <line x1="235" y1="72" x2="235" y2="105" stroke="#9E8E7A" stroke-width="1.5" />
    </g>
  `),

  'denim-indigo.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <rect x="130" y="50" width="140" height="24" rx="3" fill="#1E3A8A" />
      <path d="M130 74 L115 360 L185 360 L195 140 L205 140 L215 360 L285 360 L270 74 Z" fill="#172554" />
      <!-- Tobacco Contrast Stitching -->
      <line x1="130" y1="74" x2="270" y2="74" stroke="#D97706" stroke-width="1.5" stroke-dasharray="3,2" />
      <path d="M195 74 L195 140" stroke="#D97706" stroke-width="1.5" stroke-dasharray="3,2" />
    </g>
  `),

  'linen-pants-cream.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <rect x="135" y="50" width="130" height="24" rx="4" fill="#E2DDD5" />
      <path d="M135 74 L115 355 L185 355 L195 140 L205 140 L215 355 L285 355 L265 74 Z" fill="#EFECE6" />
      <!-- Drawstring Detail -->
      <circle cx="195" cy="62" r="2.5" fill="#78350F" />
      <circle cx="205" cy="62" r="2.5" fill="#78350F" />
      <path d="M195 64 Q190 85 185 95" stroke="#78350F" stroke-width="2" fill="none" />
      <path d="M205 64 Q210 85 215 95" stroke="#78350F" stroke-width="2" fill="none" />
    </g>
  `),

  'loafers-tan.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <!-- Left Shoe -->
      <path d="M110 240 Q105 170 140 150 Q175 160 170 240 Q165 270 140 270 Q115 270 110 240 Z" fill="#92400E" />
      <path d="M125 180 Q140 175 155 180" stroke="#78350F" stroke-width="4" fill="none" />
      <rect x="133" y="177" width="14" height="6" rx="2" fill="#B45309" />
      <!-- Right Shoe -->
      <path d="M230 240 Q225 170 260 150 Q295 160 290 240 Q285 270 260 270 Q235 270 230 240 Z" fill="#92400E" />
      <path d="M245 180 Q260 175 275 180" stroke="#78350F" stroke-width="4" fill="none" />
      <rect x="253" y="177" width="14" height="6" rx="2" fill="#B45309" />
    </g>
  `),

  'monkstraps-black.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <path d="M110 240 Q105 160 140 145 Q175 155 170 240 Q165 270 140 270 Q115 270 110 240 Z" fill="#09090B" />
      <rect x="125" y="180" width="30" height="7" rx="2" fill="#27272A" />
      <rect x="155" y="178" width="6" height="11" rx="1" fill="#E2E8F0" />
      <rect x="125" y="195" width="30" height="7" rx="2" fill="#27272A" />
      <rect x="155" y="193" width="6" height="11" rx="1" fill="#E2E8F0" />
      <!-- Right Shoe -->
      <path d="M230 240 Q225 160 260 145 Q295 155 290 240 Q285 270 260 270 Q235 270 230 240 Z" fill="#09090B" />
      <rect x="245" y="180" width="30" height="7" rx="2" fill="#27272A" />
      <rect x="275" y="178" width="6" height="11" rx="1" fill="#E2E8F0" />
      <rect x="245" y="195" width="30" height="7" rx="2" fill="#27272A" />
      <rect x="275" y="193" width="6" height="11" rx="1" fill="#E2E8F0" />
    </g>
  `),

  'sneakers-white.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <path d="M110 240 Q105 165 140 150 Q175 160 170 240 Q165 270 140 270 Q115 270 110 240 Z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" />
      <path d="M125 175 L155 175" stroke="#CBD5E1" stroke-width="2" />
      <path d="M125 190 L155 190" stroke="#CBD5E1" stroke-width="2" />
      <path d="M125 205 L155 205" stroke="#CBD5E1" stroke-width="2" />
      <!-- Right Sneaker -->
      <path d="M230 240 Q225 165 260 150 Q295 160 290 240 Q285 270 260 270 Q235 270 230 240 Z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" />
      <path d="M245 175 L275 175" stroke="#CBD5E1" stroke-width="2" />
      <path d="M245 190 L275 190" stroke="#CBD5E1" stroke-width="2" />
      <path d="M245 205 L275 205" stroke="#CBD5E1" stroke-width="2" />
    </g>
  `),

  'slides-leather.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <!-- Left Slide Sole -->
      <rect x="110" y="150" width="60" height="120" rx="28" fill="#3F2E23" />
      <path d="M108 190 L172 230" stroke="#25160E" stroke-width="16" stroke-linecap="round" />
      <path d="M108 230 L172 190" stroke="#25160E" stroke-width="16" stroke-linecap="round" />
      <!-- Right Slide Sole -->
      <rect x="230" y="150" width="60" height="120" rx="28" fill="#3F2E23" />
      <path d="M228 190 L292 230" stroke="#25160E" stroke-width="16" stroke-linecap="round" />
      <path d="M228 230 L292 190" stroke="#25160E" stroke-width="16" stroke-linecap="round" />
    </g>
  `),

  'watch-gold.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <!-- Leather Straps -->
      <rect x="185" y="90" width="30" height="220" rx="4" fill="#78350F" />
      <!-- Gold Casing -->
      <circle cx="200" cy="200" r="50" fill="#F59E0B" stroke="#D97706" stroke-width="4" />
      <!-- Dial -->
      <circle cx="200" cy="200" r="42" fill="#FFFBEB" />
      <!-- Hands & Markers -->
      <circle cx="200" cy="200" r="3" fill="#78350F" />
      <line x1="200" y1="200" x2="200" y2="175" stroke="#78350F" stroke-width="2.5" stroke-linecap="round" />
      <line x1="200" y1="200" x2="218" y2="200" stroke="#78350F" stroke-width="2" stroke-linecap="round" />
      <line x1="200" y1="165" x2="200" y2="170" stroke="#B45309" stroke-width="2" />
      <line x1="200" y1="230" x2="200" y2="235" stroke="#B45309" stroke-width="2" />
      <line x1="165" y1="200" x2="170" y2="200" stroke="#B45309" stroke-width="2" />
      <line x1="230" y1="200" x2="235" y2="200" stroke="#B45309" stroke-width="2" />
    </g>
  `),

  'sunglasses-tortoise.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <!-- Frames -->
      <rect x="100" y="170" width="85" height="60" rx="14" fill="#78350F" stroke="#92400E" stroke-width="5" />
      <rect x="215" y="170" width="85" height="60" rx="14" fill="#78350F" stroke="#92400E" stroke-width="5" />
      <!-- Bridge -->
      <path d="M185 185 Q200 180 215 185" stroke="#92400E" stroke-width="5" fill="none" />
      <!-- Dark Tinted Lenses with Reflection -->
      <rect x="105" y="175" width="75" height="50" rx="10" fill="#1C1917" />
      <line x1="115" y1="180" x2="140" y2="220" stroke="#44403C" stroke-width="3" stroke-linecap="round" opacity="0.6" />
      <rect x="220" y="175" width="75" height="50" rx="10" fill="#1C1917" />
      <line x1="230" y1="180" x2="255" y2="220" stroke="#44403C" stroke-width="3" stroke-linecap="round" opacity="0.6" />
    </g>
  `)
};

// -------------------------------------------------------------
// WOMEN'S PIECES
// -------------------------------------------------------------
const womenAssets = {
  'ankara-wrap.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <!-- Wrap Top -->
      <path d="M130 70 L270 70 L240 220 L160 220 Z" fill="#B45309" />
      <polygon points="130,70 200,160 170,180 110,80" fill="#1E3A8A" />
      <polygon points="270,70 180,180 210,195 290,80" fill="#047857" />
      <!-- Flare Midi Skirt Section -->
      <path d="M160 220 L240 220 L310 365 L90 365 Z" fill="#B45309" />
      <!-- Traditional Swirl / Floral Motifs -->
      <circle cx="200" cy="280" r="28" fill="#F59E0B" />
      <circle cx="200" cy="280" r="14" fill="#1E3A8A" />
      <circle cx="140" cy="320" r="20" fill="#047857" />
      <circle cx="260" cy="320" r="20" fill="#047857" />
      <!-- Tie Belt -->
      <rect x="150" y="212" width="100" height="12" rx="4" fill="#78350F" />
    </g>
  `),

  'blazer-camel.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <path d="M120 75 L280 75 L295 320 L105 320 Z" fill="#C28E58" />
      <path d="M120 75 L55 230 L95 240 L130 150 Z" fill="#AD7944" />
      <path d="M280 75 L345 230 L305 240 L270 150 Z" fill="#AD7944" />
      <!-- Lapels -->
      <polygon points="150,75 130,190 200,230 200,75" fill="#D3A26D" />
      <polygon points="250,75 270,190 200,230 200,75" fill="#D3A26D" />
      <!-- Tortoise Double Buttons -->
      <circle cx="185" cy="235" r="4.5" fill="#451A03" />
      <circle cx="215" cy="235" r="4.5" fill="#451A03" />
      <circle cx="185" cy="265" r="4.5" fill="#451A03" />
      <circle cx="215" cy="265" r="4.5" fill="#451A03" />
    </g>
  `),

  'blouse-silk.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <path d="M140 70 L260 70 L275 320 L125 320 Z" fill="#FEFDF9" stroke="#E2E8F0" stroke-width="1.5" />
      <!-- Delicate High Neck Drape -->
      <path d="M165 70 Q200 85 235 70 L245 105 Q200 120 155 105 Z" fill="#F8FAFC" />
      <!-- Sleeveless Armhole Arches -->
      <path d="M140 70 Q130 115 125 150" stroke="#CBD5E1" stroke-width="2" fill="none" />
      <path d="M260 70 Q270 115 275 150" stroke="#CBD5E1" stroke-width="2" fill="none" />
    </g>
  `),

  'knit-sage.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <path d="M130 80 L270 80 L260 300 L140 300 Z" fill="#78866B" />
      <!-- Cap Sleeves -->
      <path d="M130 80 L90 125 L120 145 L135 110 Z" fill="#67745B" />
      <path d="M270 80 L310 125 L280 145 L265 110 Z" fill="#67745B" />
      <!-- Ribbing Lines -->
      <line x1="160" y1="80" x2="160" y2="300" stroke="#5E6A53" stroke-width="1.5" />
      <line x1="180" y1="80" x2="180" y2="300" stroke="#5E6A53" stroke-width="1.5" />
      <line x1="200" y1="80" x2="200" y2="300" stroke="#5E6A53" stroke-width="1.5" />
      <line x1="220" y1="80" x2="220" y2="300" stroke="#5E6A53" stroke-width="1.5" />
      <line x1="240" y1="80" x2="240" y2="300" stroke="#5E6A53" stroke-width="1.5" />
    </g>
  `),

  'dress-linen.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <!-- Bodice -->
      <path d="M150 65 L250 65 L235 170 L165 170 Z" fill="#C2410C" />
      <!-- Straps -->
      <rect x="160" y="35" width="10" height="35" rx="3" fill="#9A3412" />
      <rect x="230" y="35" width="10" height="35" rx="3" fill="#9A3412" />
      <!-- Tier 1 Skirt -->
      <path d="M165 170 L235 170 L265 260 L135 260 Z" fill="#D95018" />
      <line x1="135" y1="260" x2="265" y2="260" stroke="#9A3412" stroke-width="2" />
      <!-- Tier 2 Flare -->
      <path d="M135 260 L265 260 L305 365 L95 365 Z" fill="#EA580C" />
    </g>
  `),

  'trousers-taupe.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <rect x="135" y="50" width="130" height="24" rx="4" fill="#786B5A" />
      <!-- Wide-Leg Drape -->
      <path d="M135 74 L95 360 L185 360 L195 150 L205 150 L215 360 L305 360 L265 74 Z" fill="#968673" />
      <!-- High Pleat Details -->
      <line x1="160" y1="74" x2="140" y2="360" stroke="#685B4C" stroke-width="1.5" />
      <line x1="240" y1="74" x2="260" y2="360" stroke="#685B4C" stroke-width="1.5" />
    </g>
  `),

  'skirt-midi-emerald.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <rect x="145" y="70" width="110" height="18" rx="3" fill="#044E39" />
      <path d="M145 88 L95 350 L305 350 L255 88 Z" fill="#065F46" />
      <!-- Knife Pleats -->
      <line x1="165" y1="88" x2="135" y2="350" stroke="#033F2E" stroke-width="1.5" />
      <line x1="185" y1="88" x2="175" y2="350" stroke="#033F2E" stroke-width="1.5" />
      <line x1="205" y1="88" x2="205" y2="350" stroke="#033F2E" stroke-width="1.5" />
      <line x1="225" y1="88" x2="235" y2="350" stroke="#033F2E" stroke-width="1.5" />
      <line x1="245" y1="88" x2="275" y2="350" stroke="#033F2E" stroke-width="1.5" />
    </g>
  `),

  'skirt-slip-black.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <rect x="145" y="70" width="110" height="16" rx="3" fill="#09090B" />
      <!-- Bias Cut Flare -->
      <path d="M145 86 Q120 220 100 350 L300 350 Q280 220 255 86 Z" fill="#18181B" />
      <!-- Silk Luster Highlight -->
      <path d="M180 86 Q165 220 150 350" stroke="#27272A" stroke-width="8" opacity="0.6" />
    </g>
  `),

  'denim-straight.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <rect x="135" y="55" width="130" height="22" rx="3" fill="#1E3A8A" />
      <path d="M135 77 L120 355 L180 355 L195 140 L205 140 L220 355 L280 355 L265 77 Z" fill="#172554" />
      <line x1="135" y1="77" x2="265" y2="77" stroke="#F59E0B" stroke-width="1" stroke-dasharray="2,2" />
    </g>
  `),

  'mules-nude.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <!-- Left Mule -->
      <path d="M125 240 L115 155 Q135 135 155 135 L175 240 Z" fill="#D4A373" />
      <rect x="135" y="240" width="20" height="25" rx="3" fill="#A9714B" />
      <!-- Right Mule -->
      <path d="M225 240 L215 155 Q235 135 255 135 L275 240 Z" fill="#D4A373" />
      <rect x="235" y="240" width="20" height="25" rx="3" fill="#A9714B" />
    </g>
  `),

  'heels-block.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <!-- Left Shoe -->
      <path d="M120 230 Q110 160 145 140 Q175 160 170 230 Z" fill="#9A3412" />
      <rect x="130" y="230" width="30" height="35" rx="4" fill="#7C2D12" />
      <!-- Right Shoe -->
      <path d="M230 230 Q220 160 255 140 Q285 160 280 230 Z" fill="#9A3412" />
      <rect x="240" y="230" width="30" height="35" rx="4" fill="#7C2D12" />
    </g>
  `),

  'sneakers-white.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <path d="M115 240 Q110 165 145 150 Q175 160 170 240 Q165 270 145 270 Q125 270 115 240 Z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" />
      <path d="M130 175 L160 175" stroke="#CBD5E1" stroke-width="2" />
      <path d="M130 190 L160 190" stroke="#CBD5E1" stroke-width="2" />
      <!-- Right Sneaker -->
      <path d="M225 240 Q220 165 255 150 Q285 160 280 240 Q275 270 255 270 Q235 270 225 240 Z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" />
      <path d="M240 175 L270 175" stroke="#CBD5E1" stroke-width="2" />
      <path d="M240 190 L270 190" stroke="#CBD5E1" stroke-width="2" />
    </g>
  `),

  'sandals-gold.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <!-- Left Foot Sole -->
      <rect x="120" y="140" width="45" height="125" rx="22" fill="#F59E0B" />
      <line x1="115" y1="170" x2="170" y2="170" stroke="#D97706" stroke-width="5" stroke-linecap="round" />
      <line x1="115" y1="210" x2="170" y2="210" stroke="#D97706" stroke-width="5" stroke-linecap="round" />
      <!-- Right Foot Sole -->
      <rect x="235" y="140" width="45" height="125" rx="22" fill="#F59E0B" />
      <line x1="230" y1="170" x2="285" y2="170" stroke="#D97706" stroke-width="5" stroke-linecap="round" />
      <line x1="230" y1="210" x2="285" y2="210" stroke="#D97706" stroke-width="5" stroke-linecap="round" />
    </g>
  `),

  'tote-leather.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <!-- Handles -->
      <path d="M160 160 Q160 70 200 70 Q240 70 240 160" stroke="#25160E" stroke-width="8" fill="none" stroke-linecap="round" />
      <!-- Tote Body -->
      <path d="M120 160 L280 160 L265 320 L135 320 Z" fill="#3F2E23" />
      <line x1="120" y1="160" x2="280" y2="160" stroke="#25160E" stroke-width="4" />
      <line x1="200" y1="160" x2="200" y2="320" stroke="#25160E" stroke-width="2" stroke-dasharray="3,3" />
    </g>
  `),

  'earrings-gold.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <!-- Left Hoop -->
      <circle cx="150" cy="200" r="38" fill="none" stroke="#F59E0B" stroke-width="12" stroke-linecap="round" />
      <circle cx="150" cy="162" r="5" fill="#D97706" />
      <!-- Right Hoop -->
      <circle cx="250" cy="200" r="38" fill="none" stroke="#F59E0B" stroke-width="12" stroke-linecap="round" />
      <circle cx="250" cy="162" r="5" fill="#D97706" />
    </g>
  `),

  'sunglasses-black.svg': svgWrapper(`
    <g filter="url(#shadow)">
      <!-- Cat-Eye Wings -->
      <path d="M90 170 Q130 155 185 175 L175 225 Q130 235 95 190 Z" fill="#09090B" />
      <path d="M310 170 Q270 155 215 175 L225 225 Q270 235 305 190 Z" fill="#09090B" />
      <path d="M180 178 Q200 172 220 178" stroke="#09090B" stroke-width="6" fill="none" />
      <!-- Lens Reflections -->
      <line x1="110" y1="180" x2="150" y2="215" stroke="#3F3F46" stroke-width="3" stroke-linecap="round" />
      <line x1="250" y1="180" x2="290" y2="215" stroke="#3F3F46" stroke-width="3" stroke-linecap="round" />
    </g>
  `)
};

for (const [filename, content] of Object.entries(menAssets)) {
  fs.writeFileSync(path.join(menDir, filename), content.trim());
}

for (const [filename, content] of Object.entries(womenAssets)) {
  fs.writeFileSync(path.join(womenDir, filename), content.trim());
}

console.log("Successfully generated all fashion SVG catalog assets!");

