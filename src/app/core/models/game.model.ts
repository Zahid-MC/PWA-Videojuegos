/** Respuesta de GET /games. */
export interface GameDto {
  id: number;
  title: string;
  thumbnail: string;
  short_description: string;
  game_url: string;
  genre: string;
  platform: string;
  publisher: string;
  developer: string;
  release_date: string;
  freetogame_profile_url: string;
}

/** Respuesta de GET /game?id=. Los juegos de navegador no traen requisitos. */
export interface GameDetailDto extends GameDto {
  status: string;
  description: string;
  minimum_system_requirements?: Partial<Record<RequirementKey, string | null>> | null;
  screenshots?: { id: number; image: string }[] | null;
}

export type RequirementKey = 'os' | 'processor' | 'memory' | 'graphics' | 'storage';

export type Platform = 'pc' | 'browser';

export interface Game {
  id: number;
  title: string;
  image: string;
  summary: string;
  playUrl: string;
  genre: string;
  platforms: Platform[];
  publisher: string;
  developer: string;
  releaseDate: string;
}

export interface Requirement {
  label: string;
  value: string;
}

export interface GameDetail extends Game {
  description: string;
  requirements: Requirement[];
  screenshots: string[];
}
