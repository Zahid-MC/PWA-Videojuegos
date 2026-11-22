export interface PushPreferences {
  newGames: boolean;
  weekly: boolean;
  /** Vacío significa todos los géneros. */
  genres: string[];
}
