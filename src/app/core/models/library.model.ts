import { Game } from './game.model';

export type LibraryStatus = 'wish' | 'playing' | 'done';

export type LibraryAction = LibraryStatus | 'removed';

export interface LibraryChange {
  gameId: number;
  action: LibraryAction;
}

export interface LibraryEntry {
  /** Copia del juego para mostrar la biblioteca aunque no haya red ni caché. */
  game: Game;
  status: LibraryStatus;
  addedAt: string;
  remindAt?: string;
}

export const LIBRARY_STATUSES: readonly { value: LibraryStatus; label: string; hint: string }[] = [
  { value: 'wish', label: 'Quiero jugar', hint: 'Guarda aquí lo que te llame la atención.' },
  { value: 'playing', label: 'Jugando', hint: 'Lo que tienes empezado ahora mismo.' },
  { value: 'done', label: 'Terminado', hint: 'Los que ya te pasaste o dejaste atrás.' },
];
