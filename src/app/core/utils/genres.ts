/** La API repite géneros con otro nombre o con espacios de más. */
const ALIASES: Record<string, string> = {
  'Card Game': 'Card',
  'Action Game': 'Action',
  ARPG: 'Action RPG',
  MMOARPG: 'MMORPG',
  MMO: 'MMORPG',
};

const GENRES: Record<string, { label: string; color: string }> = {
  MMORPG: { label: 'MMORPG', color: '#6fc3f7' },
  Shooter: { label: 'Disparos', color: '#ff7a59' },
  Strategy: { label: 'Estrategia', color: '#f4c752' },
  Card: { label: 'Cartas', color: '#8ed081' },
  MOBA: { label: 'MOBA', color: '#c9a0f5' },
  Sports: { label: 'Deportes', color: '#b8e04a' },
  Fighting: { label: 'Lucha', color: '#ff7fa8' },
  RPG: { label: 'RPG', color: '#9db2ff' },
  'Battle Royale': { label: 'Battle royale', color: '#ffa94d' },
  Social: { label: 'Social', color: '#ffc6d9' },
  'Action RPG': { label: 'RPG de acción', color: '#7fb0ff' },
  Action: { label: 'Acción', color: '#ff9c8a' },
  Racing: { label: 'Carreras', color: '#4fe0c1' },
  Fantasy: { label: 'Fantasía', color: '#d9b8ff' },
  'Dungeon Crawler': { label: 'Mazmorras', color: '#d3b58c' },
};

// Debe coincidir con normalizeGenre() del servidor de avisos.
export function normalizeGenre(genre: string): string {
  const clean = genre.trim();
  return ALIASES[clean] ?? clean;
}

export function genreLabel(genre: string): string {
  return GENRES[genre]?.label ?? genre;
}

export function genreColor(genre: string): string {
  return GENRES[genre]?.color ?? '#c5d0d2';
}
