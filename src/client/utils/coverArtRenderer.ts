/**
 * Advanced Procedural & SVG Conceptual World Map Cover Art Generator
 * Creates museum-grade speculative cartographic artworks, thumbnails, and cover posters.
 */

export interface CoverArtOptions {
  scenarioTitle: string;
  scenarioDescription: string;
  startingYear?: number;
  endYear?: number;
  geographicScope?: string;
  style?: 'imperial_gold' | 'obsidian_noir' | 'tactical_holo' | 'renaissance_chart' | 'steampunk_brass' | 'cosmic_orbital';
  showCompass?: boolean;
  showTradeArcs?: boolean;
  showCartouche?: boolean;
  showConflictZones?: boolean;
  customSubtitle?: string;
}

export interface StyleTheme {
  id: string;
  name: string;
  subtitle: string;
  bgGradStart: string;
  bgGradMid: string;
  bgGradEnd: string;
  landFill: string;
  landStroke: string;
  borderGlow: string;
  accentGold: string;
  secondaryAccent: string;
  textColor: string;
  mutedText: string;
  gridColor: string;
  rhumbLineColor: string;
  cartoucheBg: string;
  cartoucheBorder: string;
}

export const COVER_ART_THEMES: Record<string, StyleTheme> = {
  imperial_gold: {
    id: 'imperial_gold',
    name: 'Imperial Vellum & Gold',
    subtitle: '18th Century Royal Atlas & Cartographic Folio',
    bgGradStart: '#1A150E',
    bgGradMid: '#120F0A',
    bgGradEnd: '#0A0806',
    landFill: '#241D14',
    landStroke: '#C5A059',
    borderGlow: 'rgba(197, 160, 89, 0.4)',
    accentGold: '#E5C384',
    secondaryAccent: '#B8860B',
    textColor: '#F5E6CC',
    mutedText: '#A89980',
    gridColor: 'rgba(197, 160, 89, 0.12)',
    rhumbLineColor: 'rgba(197, 160, 89, 0.18)',
    cartoucheBg: '#18140E',
    cartoucheBorder: '#C5A059',
  },
  obsidian_noir: {
    id: 'obsidian_noir',
    name: 'Obsidian Noir Speculative',
    subtitle: 'High-Contrast Luxury Slate & Molten Gold',
    bgGradStart: '#0F1012',
    bgGradMid: '#090A0B',
    bgGradEnd: '#040405',
    landFill: '#1A1C20',
    landStroke: '#F59E0B',
    borderGlow: 'rgba(245, 158, 11, 0.5)',
    accentGold: '#FBBF24',
    secondaryAccent: '#E11D48',
    textColor: '#FFFFFF',
    mutedText: '#9CA3AF',
    gridColor: 'rgba(255, 255, 255, 0.08)',
    rhumbLineColor: 'rgba(245, 158, 11, 0.15)',
    cartoucheBg: '#0F1012',
    cartoucheBorder: '#F59E0B',
  },
  tactical_holo: {
    id: 'tactical_holo',
    name: 'Cyber-Tactical Hologram',
    subtitle: 'Deep Oceanic Radar Grid & Telemetry Vectors',
    bgGradStart: '#061320',
    bgGradMid: '#030B14',
    bgGradEnd: '#01050A',
    landFill: '#0C2238',
    landStroke: '#06B6D4',
    borderGlow: 'rgba(6, 182, 212, 0.6)',
    accentGold: '#38BDF8',
    secondaryAccent: '#10B981',
    textColor: '#E0F2FE',
    mutedText: '#7DD3FC',
    gridColor: 'rgba(6, 182, 212, 0.15)',
    rhumbLineColor: 'rgba(56, 189, 248, 0.25)',
    cartoucheBg: '#071A2E',
    cartoucheBorder: '#06B6D4',
  },
  renaissance_chart: {
    id: 'renaissance_chart',
    name: 'Renaissance Portolan Chart',
    subtitle: 'Crimson Rhumb Lines & Illuminated Sea Lanes',
    bgGradStart: '#211311',
    bgGradMid: '#160B09',
    bgGradEnd: '#0C0605',
    landFill: '#2E1A17',
    landStroke: '#E11D48',
    borderGlow: 'rgba(225, 29, 72, 0.45)',
    accentGold: '#FDA4AF',
    secondaryAccent: '#C5A059',
    textColor: '#FFE4E6',
    mutedText: '#C49E9E',
    gridColor: 'rgba(225, 29, 72, 0.12)',
    rhumbLineColor: 'rgba(225, 29, 72, 0.22)',
    cartoucheBg: '#1F0F0D',
    cartoucheBorder: '#E11D48',
  },
  steampunk_brass: {
    id: 'steampunk_brass',
    name: 'Steampunk Brass & Dynamo',
    subtitle: 'Burnished Copper Gears & Industrial Meridian',
    bgGradStart: '#1E1710',
    bgGradMid: '#140E0A',
    bgGradEnd: '#0A0704',
    landFill: '#2E2216',
    landStroke: '#D97706',
    borderGlow: 'rgba(217, 119, 6, 0.5)',
    accentGold: '#F59E0B',
    secondaryAccent: '#78350F',
    textColor: '#FEF3C7',
    mutedText: '#B45309',
    gridColor: 'rgba(217, 119, 6, 0.14)',
    rhumbLineColor: 'rgba(245, 158, 11, 0.2)',
    cartoucheBg: '#1A130D',
    cartoucheBorder: '#D97706',
  },
  cosmic_orbital: {
    id: 'cosmic_orbital',
    name: 'Cosmic / Off-World Orbital',
    subtitle: 'Starlight Astrogation & Geodesic Meridian Grid',
    bgGradStart: '#160F26',
    bgGradMid: '#0D0818',
    bgGradEnd: '#05030A',
    landFill: '#241640',
    landStroke: '#A855F7',
    borderGlow: 'rgba(168, 85, 247, 0.6)',
    accentGold: '#C084FC',
    secondaryAccent: '#06B6D4',
    textColor: '#F3E8FF',
    mutedText: '#A855F7',
    gridColor: 'rgba(168, 85, 247, 0.15)',
    rhumbLineColor: 'rgba(192, 132, 252, 0.25)',
    cartoucheBg: '#130C22',
    cartoucheBorder: '#A855F7',
  }
};

/**
 * Generates an SVG string representation of the conceptual world map cover art.
 */
export function generateCoverArtSVG(options: CoverArtOptions): string {
  const {
    scenarioTitle = 'Counterfactual World Simulation',
    scenarioDescription = 'A rigorous divergent history simulation.',
    startingYear = 1888,
    endYear = 1950,
    style = 'imperial_gold',
    showCompass = true,
    showTradeArcs = true,
    showCartouche = true,
    showConflictZones = true,
  } = options;

  const theme = COVER_ART_THEMES[style] || COVER_ART_THEMES.imperial_gold;
  const width = 1200;
  const height = 675; // 16:9 ratio

  // Format years
  const yearStr = startingYear > 0 
    ? `${startingYear} AD → ${endYear || startingYear + 50} AD` 
    : `${Math.abs(startingYear)} BCE → ${endYear ? (endYear > 0 ? `${endYear} AD` : `${Math.abs(endYear)} BCE`) : '500 BCE'}`;

  const rawTitle = (options?.scenarioTitle || 'Counterfactual World Simulation').trim() || 'Counterfactual World Simulation';
  const rawDesc = (options?.scenarioDescription || 'A rigorous divergent history simulation.').trim() || 'A rigorous divergent history simulation.';

  // Escape XML characters
  const safeTitle = rawTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const safeDesc = rawDesc.substring(0, 140).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') + (rawDesc.length > 140 ? '...' : '');

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color: ${theme.bgGradEnd}; font-family: 'Cinzel', 'Playfair Display', Georgia, serif;">
  <defs>
    <!-- Background Radial Gradient -->
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${theme.bgGradStart}" />
      <stop offset="60%" stop-color="${theme.bgGradMid}" />
      <stop offset="100%" stop-color="${theme.bgGradEnd}" />
    </radialGradient>

    <!-- Landmass Gradient -->
    <linearGradient id="landGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.landFill}" />
      <stop offset="100%" stop-color="${theme.bgGradMid}" />
    </linearGradient>

    <!-- Gold Foil Gradient -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${theme.secondaryAccent}" />
      <stop offset="50%" stop-color="${theme.accentGold}" />
      <stop offset="100%" stop-color="${theme.secondaryAccent}" />
    </linearGradient>

    <!-- Glowing Border Filter -->
    <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <filter id="intenseGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Canvas Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

  <!-- Aged Cartographic Latitude & Longitude Graticule -->
  <g stroke="${theme.gridColor}" stroke-width="0.75" stroke-dasharray="3 3">
    <!-- Horizontal parallels -->
    <line x1="40" y1="100" x2="${width - 40}" y2="100" />
    <line x1="40" y1="180" x2="${width - 40}" y2="180" />
    <line x1="40" y1="260" x2="${width - 40}" y2="260" />
    <line x1="40" y1="340" x2="${width - 40}" y2="340" />
    <line x1="40" y1="420" x2="${width - 40}" y2="420" />
    <line x1="40" y1="500" x2="${width - 40}" y2="500" />
    <line x1="40" y1="580" x2="${width - 40}" y2="580" />

    <!-- Vertical meridians -->
    <line x1="140" y1="40" x2="140" y2="${height - 40}" />
    <line x1="280" y1="40" x2="280" y2="${height - 40}" />
    <line x1="420" y1="40" x2="420" y2="${height - 40}" />
    <line x1="560" y1="40" x2="560" y2="${height - 40}" />
    <line x1="700" y1="40" x2="700" y2="${height - 40}" />
    <line x1="840" y1="40" x2="840" y2="${height - 40}" />
    <line x1="980" y1="40" x2="980" y2="${height - 40}" />
    <line x1="1080" y1="40" x2="1080" y2="${height - 40}" />
  </g>

  <!-- Portolan Navigation Rhumb Lines radiating from astrolabe center -->
  <g stroke="${theme.rhumbLineColor}" stroke-width="0.6">
    <line x1="940" y1="460" x2="0" y2="100" />
    <line x1="940" y1="460" x2="0" y2="460" />
    <line x1="940" y1="460" x2="1200" y2="100" />
    <line x1="940" y1="460" x2="600" y2="0" />
    <line x1="940" y1="460" x2="600" y2="675" />
    <line x1="940" y1="460" x2="200" y2="675" />
    <line x1="940" y1="460" x2="1200" y2="675" />
    <line x1="940" y1="460" x2="350" y2="200" />
    <circle cx="940" cy="460" r="140" fill="none" stroke="${theme.rhumbLineColor}" stroke-dasharray="2 4" />
    <circle cx="940" cy="460" r="220" fill="none" stroke="${theme.rhumbLineColor}" stroke-dasharray="4 6" />
  </g>

  <!-- Speculative World Landmass Silhouettes (Artistic Vector Topography) -->
  <g fill="url(#landGrad)" stroke="${theme.landStroke}" stroke-width="1.4" filter="url(#goldGlow)">
    <!-- North America & Arctic -->
    <path d="M 120 120 Q 180 100 240 110 T 310 160 Q 280 220 250 260 T 170 290 Q 130 240 110 180 Z" />
    <!-- Central America & Caribbean Arcs -->
    <path d="M 230 280 Q 250 310 270 340 T 290 380 Q 275 390 260 370 Z" />
    <!-- South America Speculative -->
    <path d="M 270 370 Q 350 380 370 440 T 340 540 Q 300 590 270 610 T 260 520 Q 250 430 270 370 Z" />
    <!-- Europe & Mediterranean Basin -->
    <path d="M 490 120 Q 560 110 610 140 T 630 210 Q 580 250 530 240 T 470 200 Q 460 150 490 120 Z" />
    <!-- British Isles & Scandinavia -->
    <path d="M 460 110 Q 480 90 490 110 T 470 140 Z" />
    <path d="M 520 80 Q 560 60 580 100 T 550 120 Z" />
    <!-- Africa & Horn of Africa -->
    <path d="M 480 250 Q 580 240 620 290 T 640 400 Q 610 490 560 540 T 500 480 Q 460 370 480 250 Z" />
    <!-- Middle East & Levant -->
    <path d="M 620 220 Q 680 210 700 260 T 660 300 Q 630 280 620 220 Z" />
    <!-- Asia / Eurasia Vast Steppes & Subcontinent -->
    <path d="M 640 120 Q 780 90 920 130 T 1020 220 Q 980 320 880 310 T 780 380 Q 730 360 720 280 T 640 210 Z" />
    <!-- Indian Subcontinent Peninsula -->
    <path d="M 730 280 Q 780 300 790 360 T 750 410 Q 720 370 730 280 Z" />
    <!-- East Asia & Archipelago -->
    <path d="M 920 210 Q 980 220 1010 270 T 960 330 Q 910 300 920 210 Z" />
    <!-- Maritime Southeast Asia Islands -->
    <path d="M 880 380 Q 940 370 980 400 T 920 440 Z" />
    <path d="M 940 420 Q 990 410 1010 440 Z" />
    <!-- Australia & Oceania -->
    <path d="M 920 460 Q 1020 450 1050 510 T 990 590 Q 920 580 900 520 Z" />
  </g>

  <!-- Divergent Geodesic Trade Corridors (Flowing Arcs) -->
  ${showTradeArcs ? `
  <g stroke="${theme.accentGold}" stroke-width="1.8" fill="none" opacity="0.7" stroke-dasharray="6 6">
    <!-- Transatlantic Silk Arc -->
    <path d="M 280 220 Q 400 160 520 200" />
    <!-- Mediterranean - Indian Ocean Maritime Nexus -->
    <path d="M 540 220 Q 650 260 760 350" />
    <!-- Eurasia Grand Overland Arterial -->
    <path d="M 520 180 Q 700 140 920 230" />
    <!-- Pacific Oceanic Route -->
    <path d="M 960 260 Q 1080 300 1140 260" />
    <!-- Southern Spice & Resource Meridian -->
    <path d="M 560 480 Q 720 520 940 510" />
  </g>

  <!-- Trade Node Sparkles -->
  <g fill="${theme.accentGold}">
    <circle cx="280" cy="220" r="3.5" />
    <circle cx="520" cy="200" r="4.5" />
    <circle cx="760" cy="350" r="4" />
    <circle cx="920" cy="230" r="4" />
    <circle cx="960" cy="260" r="3.5" />
  </g>
  ` : ''}

  <!-- Conflict Flashpoints / Divergence Epicenters -->
  ${showConflictZones ? `
  <g>
    <!-- Epicenter 1 -->
    <circle cx="560" cy="190" r="14" fill="none" stroke="${theme.secondaryAccent}" stroke-width="1.5" stroke-dasharray="2 3" />
    <circle cx="560" cy="190" r="4" fill="${theme.secondaryAccent}" />
    <!-- Epicenter 2 -->
    <circle cx="740" cy="290" r="12" fill="none" stroke="${theme.secondaryAccent}" stroke-width="1.2" stroke-dasharray="2 2" />
    <circle cx="740" cy="290" r="3" fill="${theme.secondaryAccent}" />
  </g>
  ` : ''}

  <!-- Ornate Brass Compass Rose / Astrolabe in Upper Right -->
  ${showCompass ? `
  <g transform="translate(980, 140)">
    <!-- Outer Rings -->
    <circle cx="0" cy="0" r="65" fill="none" stroke="${theme.accentGold}" stroke-width="1.5" />
    <circle cx="0" cy="0" r="58" fill="none" stroke="${theme.secondaryAccent}" stroke-width="0.8" stroke-dasharray="1 3" />
    <circle cx="0" cy="0" r="48" fill="none" stroke="${theme.accentGold}" stroke-width="0.8" />
    
    <!-- 8 Compass Rose Star Points -->
    <!-- North Point (Ornate Gold Fleur-de-lis) -->
    <polygon points="0,-62 -8,-12 0,-18 8,-12" fill="url(#goldGrad)" />
    <!-- South Point -->
    <polygon points="0,62 -8,12 0,18 8,12" fill="${theme.secondaryAccent}" />
    <!-- East Point -->
    <polygon points="62,0 12,-8 18,0 12,8" fill="url(#goldGrad)" />
    <!-- West Point -->
    <polygon points="-62,0 -12,-8 -18,0 -12,8" fill="${theme.secondaryAccent}" />

    <!-- 4 Diagonal Points -->
    <polygon points="40,-40 8,-2 12,-12 2,-8" fill="${theme.mutedText}" opacity="0.8" />
    <polygon points="-40,-40 -8,-2 -12,-12 -2,-8" fill="${theme.mutedText}" opacity="0.8" />
    <polygon points="40,40 8,2 12,12 2,8" fill="${theme.mutedText}" opacity="0.8" />
    <polygon points="-40,40 -8,2 -12,12 -2,8" fill="${theme.mutedText}" opacity="0.8" />

    <!-- Center Pivot -->
    <circle cx="0" cy="0" r="7" fill="${theme.accentGold}" />
    <circle cx="0" cy="0" r="3" fill="${theme.bgGradStart}" />

    <!-- Cardinal Labels -->
    <text x="0" y="-70" fill="${theme.accentGold}" font-size="12" font-weight="bold" text-anchor="middle" letter-spacing="2">N</text>
    <text x="0" y="80" fill="${theme.mutedText}" font-size="10" text-anchor="middle" letter-spacing="1">S</text>
    <text x="75" y="4" fill="${theme.mutedText}" font-size="10" text-anchor="middle" letter-spacing="1">E</text>
    <text x="-75" y="4" fill="${theme.mutedText}" font-size="10" text-anchor="middle" letter-spacing="1">W</text>
  </g>
  ` : ''}

  <!-- Grand Ornate Cartouche / Title Plate in Lower Left -->
  ${showCartouche ? `
  <g transform="translate(60, 390)">
    <!-- Cartouche Box Shadow & Base -->
    <rect x="0" y="0" width="540" height="225" rx="8" fill="${theme.cartoucheBg}" stroke="${theme.cartoucheBorder}" stroke-width="1.8" filter="url(#goldGlow)" />
    <rect x="8" y="8" width="524" height="209" rx="4" fill="none" stroke="${theme.secondaryAccent}" stroke-width="0.8" stroke-dasharray="4 2" />

    <!-- Corner Filigree Flourishes -->
    <!-- Top Left -->
    <path d="M 12 26 L 26 12 M 12 36 L 36 12" stroke="${theme.accentGold}" stroke-width="1.2" />
    <!-- Top Right -->
    <path d="M 528 26 L 514 12 M 528 36 L 504 12" stroke="${theme.accentGold}" stroke-width="1.2" />
    <!-- Bottom Left -->
    <path d="M 12 199 L 26 213 M 12 189 L 36 213" stroke="${theme.accentGold}" stroke-width="1.2" />
    <!-- Bottom Right -->
    <path d="M 528 199 L 514 213 M 528 189 L 504 213" stroke="${theme.accentGold}" stroke-width="1.2" />

    <!-- Top Badge / Header -->
    <text x="270" y="36" fill="${theme.accentGold}" font-size="10" font-weight="bold" letter-spacing="4" text-anchor="middle" font-family="monospace">
      CHRONOS SPECULATIVE ATLAS • VOL. I
    </text>
    <line x1="60" y1="46" x2="480" y2="46" stroke="${theme.secondaryAccent}" stroke-width="0.75" />

    <!-- Scenario Title (Auto-wrapped / fitted) -->
    <text x="270" y="80" fill="${theme.textColor}" font-size="21" font-weight="bold" text-anchor="middle" font-style="italic">
      ${safeTitle.length > 34 ? safeTitle.substring(0, 32) + '...' : safeTitle}
    </text>

    <!-- Divergence Timeline Horizon Badge -->
    <g transform="translate(160, 95)">
      <rect x="0" y="0" width="220" height="22" rx="4" fill="${theme.bgGradMid}" stroke="${theme.accentGold}" stroke-width="0.7" />
      <text x="110" y="15" fill="${theme.accentGold}" font-size="11" font-family="monospace" font-weight="bold" letter-spacing="1" text-anchor="middle">
        ${yearStr}
      </text>
    </g>

    <!-- Scenario Brief Description -->
    <foreignObject x="30" y="128" width="480" height="60">
      <p xmlns="http://www.w3.org/1999/xhtml" style="color: ${theme.mutedText}; font-size: 11px; line-height: 1.45; text-align: center; margin: 0; font-style: italic; font-family: Georgia, serif;">
        "${safeDesc}"
      </p>
    </foreignObject>

    <!-- Bottom Seal / Rigor Stamp -->
    <line x1="90" y1="192" x2="450" y2="192" stroke="${theme.secondaryAccent}" stroke-width="0.5" />
    <text x="270" y="206" fill="${theme.accentGold}" font-size="9" letter-spacing="3" text-anchor="middle" font-family="monospace">
      ✦ CAUSALLY GROUNDED MULTI-AGENT SYNTHESIS ✦
    </text>
  </g>
  ` : ''}

  <!-- Grand Ornate Double Outer Border Frame -->
  <rect x="16" y="16" width="${width - 32}" height="${height - 32}" fill="none" stroke="${theme.landStroke}" stroke-width="2.5" />
  <rect x="24" y="24" width="${width - 48}" height="${height - 48}" fill="none" stroke="${theme.secondaryAccent}" stroke-width="0.8" stroke-dasharray="6 3" />

  <!-- Four Corner Cartographic Sun / Diamond Accents -->
  <g fill="${theme.accentGold}">
    <!-- Top-Left Corner -->
    <polygon points="20,16 24,20 20,24 16,20" />
    <circle cx="24" cy="24" r="3" />
    <!-- Top-Right Corner -->
    <polygon points="${width - 20},16 ${width - 16},20 ${width - 20},24 ${width - 24},20" />
    <circle cx="${width - 24}" cy="24" r="3" />
    <!-- Bottom-Left Corner -->
    <polygon points="20,${height - 24} 24,${height - 20} 20,${height - 16} 16,${height - 20}" />
    <circle cx="24" cy="${height - 24}" r="3" />
    <!-- Bottom-Right Corner -->
    <polygon points="${width - 20},${height - 24} ${width - 16},${height - 20} ${width - 20},${height - 16} ${width - 24},${height - 20}" />
    <circle cx="${width - 24}" cy="${height - 24}" r="3" />
  </g>
</svg>
  `.trim();
}

/**
 * Converts SVG code into an image Data URL or downloads it as a PNG file using HTML Canvas.
 */
export async function exportCoverArtToDataUrl(
  options: CoverArtOptions,
  format: 'png' | 'svg' = 'png',
  exportWidth = 1920,
  exportHeight = 1080
): Promise<string> {
  const svgString = generateCoverArtSVG(options);

  if (format === 'svg') {
    const encoded = encodeURIComponent(svgString);
    return `data:image/svg+xml;charset=utf-8,${encoded}`;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const urlObj = window.URL || window.webkitURL;
    const blobURL = urlObj.createObjectURL(svgBlob);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = exportWidth;
        canvas.height = exportHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          urlObj.revokeObjectURL(blobURL);
          reject(new Error('Failed to get 2D canvas context'));
          return;
        }

        // Draw image scaled
        ctx.drawImage(img, 0, 0, exportWidth, exportHeight);
        urlObj.revokeObjectURL(blobURL);
        const pngUrl = canvas.toDataURL('image/png', 0.95);
        resolve(pngUrl);
      } catch (err) {
        urlObj.revokeObjectURL(blobURL);
        reject(err);
      }
    };

    img.onerror = (err) => {
      urlObj.revokeObjectURL(blobURL);
      reject(err);
    };

    img.src = blobURL;
  });
}
