import { Game } from '../models/game.model';

/** La API da la fecha como AAAA-MM-DD: se compara con el día local. */
export function isUpcoming(game: Game, today = new Date()): boolean {
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return game.releaseDate > `${today.getFullYear()}-${month}-${day}`;
}
