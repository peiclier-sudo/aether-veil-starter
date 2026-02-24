/**
 * Procedural hero portrait system.
 * Generates unique SVG data-URIs for each hero based on their properties.
 * Each hero gets a distinct silhouette, color palette, and background pattern.
 */

const factionColors: Record<string, { primary: string; secondary: string; accent: string; bg: string }> = {
  'Dawn Sentinels':  { primary: '#fcd34d', secondary: '#f59e0b', accent: '#fef3c7', bg: '#451a03' },
  'Veil Walkers':    { primary: '#a78bfa', secondary: '#7c3aed', accent: '#ddd6fe', bg: '#1e1b4b' },
  'Obsidian Pact':   { primary: '#ef4444', secondary: '#b91c1c', accent: '#fecaca', bg: '#450a0a' },
  'Stormborn':       { primary: '#38bdf8', secondary: '#0284c7', accent: '#bae6fd', bg: '#0c4a6e' },
}

const roleShapes: Record<string, string> = {
  offensive: `
    <polygon points="100,15 115,55 155,55 123,78 135,118 100,93 65,118 77,78 45,55 85,55" fill="ACCENT" opacity="0.3"/>
    <line x1="80" y1="140" x2="120" y2="40" stroke="PRIMARY" stroke-width="3" opacity="0.5"/>
    <line x1="75" y1="135" x2="125" y2="45" stroke="PRIMARY" stroke-width="1.5" opacity="0.3"/>
  `,
  defensive: `
    <path d="M100,25 L140,55 L140,105 L100,135 L60,105 L60,55 Z" fill="none" stroke="PRIMARY" stroke-width="2.5" opacity="0.4"/>
    <path d="M100,40 L130,62 L130,98 L100,120 L70,98 L70,62 Z" fill="ACCENT" opacity="0.08"/>
  `,
  support: `
    <circle cx="100" cy="80" r="45" fill="none" stroke="PRIMARY" stroke-width="2" opacity="0.3"/>
    <circle cx="100" cy="80" r="30" fill="none" stroke="ACCENT" stroke-width="1" opacity="0.2"/>
    <path d="M100,50 L100,110 M70,80 L130,80" stroke="PRIMARY" stroke-width="2.5" opacity="0.4"/>
  `,
}

const rarityGlow: Record<string, { blur: number; opacity: number; rings: number }> = {
  common:    { blur: 8,  opacity: 0.3, rings: 0 },
  rare:      { blur: 12, opacity: 0.5, rings: 1 },
  epic:      { blur: 18, opacity: 0.6, rings: 2 },
  legendary: { blur: 25, opacity: 0.8, rings: 3 },
}

// Unique silhouette paths for each hero
const heroSilhouettes: Record<string, string> = {
  'Solaris':   'M100,30 C85,30 70,45 68,65 C66,80 72,95 80,105 L75,140 L90,130 L100,145 L110,130 L125,140 L120,105 C128,95 134,80 132,65 C130,45 115,30 100,30Z',
  'Nyx':       'M100,25 C80,25 65,40 65,60 C65,75 70,85 75,95 L60,110 L80,105 L70,145 L100,120 L130,145 L120,105 L140,110 L125,95 C130,85 135,75 135,60 C135,40 120,25 100,25Z',
  'Aurorae':   'M100,28 C88,28 78,38 75,52 C72,65 78,78 85,88 L80,95 C70,100 60,108 60,118 L75,115 L80,140 L100,125 L120,140 L125,115 L140,118 C140,108 130,100 120,95 L115,88 C122,78 128,65 125,52 C122,38 112,28 100,28Z',
  'Kaelith':   'M100,32 C82,32 68,48 68,68 C68,88 78,98 85,108 L75,115 L70,145 L100,130 L130,145 L125,115 L115,108 C122,98 132,88 132,68 C132,48 118,32 100,32Z M80,60 L85,75 M120,60 L115,75',
  'Zephyrine': 'M100,22 C90,22 80,30 78,42 C76,52 80,62 85,70 L55,85 L80,82 L75,100 L85,95 L80,145 L100,120 L120,145 L115,95 L125,100 L120,82 L145,85 L115,70 C120,62 124,52 122,42 C120,30 110,22 100,22Z',
  'Thalor':    'M100,35 C78,35 62,55 62,75 C62,95 75,108 85,115 L80,145 L100,132 L120,145 L115,115 C125,108 138,95 138,75 C138,55 122,35 100,35Z',
  'Lumiveil':  'M100,25 C92,25 84,32 82,42 L65,38 L78,52 C74,62 76,74 82,84 L72,90 L82,92 L78,140 L100,118 L122,140 L118,92 L128,90 L118,84 C124,74 126,62 122,52 L135,38 L118,42 C116,32 108,25 100,25Z',
  'Cindra':    'M100,24 C88,24 76,36 74,50 C72,62 78,74 84,82 L60,95 L82,90 L78,145 L100,122 L122,145 L118,90 L140,95 L116,82 C122,74 128,62 126,50 C124,36 112,24 100,24Z',
  'Orinvex':   'M100,30 C80,30 65,50 65,72 C65,90 78,105 90,112 L85,145 L100,135 L115,145 L110,112 C122,105 135,90 135,72 C135,50 120,30 100,30Z M75,65 Q100,55 125,65',
  'Seraphyn':  'M100,20 L90,30 C78,35 70,48 70,62 C70,78 80,90 88,98 L75,105 L85,108 L80,145 L100,125 L120,145 L115,108 L125,105 L112,98 C120,90 130,78 130,62 C130,48 122,35 110,30 L100,20Z',
  'Varek':     'M100,28 C85,28 72,42 72,58 C72,72 80,84 88,92 L82,145 L100,130 L118,145 L112,92 C120,84 128,72 128,58 C128,42 115,28 100,28Z M78,52 L88,62 M122,52 L112,62',
  'Mirael':    'M100,26 C90,26 80,34 78,46 C76,58 82,70 88,78 L80,85 L70,82 L78,95 L75,140 L100,120 L125,140 L122,95 L130,82 L120,85 L112,78 C118,70 124,58 122,46 C120,34 110,26 100,26Z',
  'Gorrik':    'M100,35 C75,35 58,58 58,78 C58,98 72,112 88,118 L82,145 L100,135 L118,145 L112,118 C128,112 142,98 142,78 C142,58 125,35 100,35Z',
  'Lyswen':    'M100,22 C88,22 78,32 76,44 C74,56 80,66 86,74 L55,78 L82,80 L78,145 L100,125 L122,145 L118,80 L145,78 L114,74 C120,66 126,56 124,44 C122,32 112,22 100,22Z',
  'Fenwick':   'M100,28 C90,28 82,36 80,48 C78,58 82,68 88,76 L82,82 L88,88 L82,145 L100,125 L118,145 L112,88 L118,82 L112,76 C118,68 122,58 120,48 C118,36 110,28 100,28Z',
  'Duskara':   'M100,30 C88,30 78,40 76,54 C74,66 80,76 86,84 L78,145 L100,128 L122,145 L114,84 C120,76 126,66 124,54 C122,40 112,30 100,30Z',
  'Bront':     'M100,38 C72,38 55,62 55,82 C55,102 70,118 90,122 L85,145 L100,138 L115,145 L110,122 C130,118 145,102 145,82 C145,62 128,38 100,38Z',
  'Ellara':    'M100,28 C90,28 82,36 80,46 C78,56 82,66 88,74 L80,80 L88,86 L82,140 L100,122 L118,140 L112,86 L120,80 L112,74 C118,66 122,56 120,46 C118,36 110,28 100,28Z',
  'Riven':     'M100,26 C86,26 74,38 72,52 C70,64 76,76 84,84 L78,90 L84,94 L80,145 L100,128 L120,145 L116,94 L122,90 L116,84 C124,76 130,64 128,52 C126,38 114,26 100,26Z',
  'Mossveil':  'M100,30 C88,30 78,42 76,56 C74,68 80,80 88,88 L68,92 L86,94 L80,142 L100,125 L120,142 L114,94 L132,92 L112,88 C120,80 126,68 124,56 C122,42 112,30 100,30Z',
}

export function generateHeroPortrait(
  name: string,
  faction: string,
  rarity: string,
  role: string
): string {
  const colors = factionColors[faction] || factionColors['Dawn Sentinels']
  const glow = rarityGlow[rarity] || rarityGlow['common']
  const shape = (roleShapes[role] || roleShapes['offensive'])
    .replace(/PRIMARY/g, colors.primary)
    .replace(/ACCENT/g, colors.accent)
  const silhouette = heroSilhouettes[name] || heroSilhouettes['Solaris']

  const rings = Array.from({ length: glow.rings }, (_, i) => {
    const r = 55 + i * 12
    return `<circle cx="100" cy="80" r="${r}" fill="none" stroke="${colors.primary}" stroke-width="0.5" opacity="${0.15 - i * 0.04}"/>`
  }).join('')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 170">
    <defs>
      <radialGradient id="bg_${name}" cx="50%" cy="40%" r="70%">
        <stop offset="0%" stop-color="${colors.secondary}" stop-opacity="0.4"/>
        <stop offset="50%" stop-color="${colors.bg}" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#000" stop-opacity="1"/>
      </radialGradient>
      <radialGradient id="glow_${name}" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stop-color="${colors.primary}" stop-opacity="${glow.opacity * 0.6}"/>
        <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="body_${name}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${colors.accent}" stop-opacity="0.9"/>
        <stop offset="40%" stop-color="${colors.primary}" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="${colors.secondary}" stop-opacity="0.6"/>
      </linearGradient>
      <filter id="blur_${name}">
        <feGaussianBlur stdDeviation="${glow.blur * 0.4}"/>
      </filter>
    </defs>
    <rect width="200" height="170" fill="url(#bg_${name})"/>
    <ellipse cx="100" cy="80" rx="60" ry="50" fill="url(#glow_${name})" filter="url(#blur_${name})"/>
    ${rings}
    ${shape}
    <path d="${silhouette}" fill="url(#body_${name})" stroke="${colors.primary}" stroke-width="1" opacity="0.85"/>
    <ellipse cx="100" cy="145" rx="40" ry="6" fill="${colors.primary}" opacity="0.15" filter="url(#blur_${name})"/>
  </svg>`

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
