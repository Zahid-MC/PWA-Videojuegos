export interface PushPreferences {
  newGames: boolean;
  weekly: boolean;
  /** Al guardar, mover o eliminar un juego de la biblioteca. */
  library: boolean;
  /** Cuando sale un juego guardado. */
  releases: boolean;
  /** Vacío significa todos los géneros. */
  genres: string[];
}
