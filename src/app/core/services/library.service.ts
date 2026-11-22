import { Injectable, computed, signal } from '@angular/core';
import { Game } from '../models/game.model';
import { LibraryEntry, LibraryStatus } from '../models/library.model';
import { readStorage, writeStorage } from '../utils/storage';

const LIBRARY_KEY = 'library';

/** Biblioteca personal: se guarda en el dispositivo y funciona siempre sin conexión. */
@Injectable({ providedIn: 'root' })
export class LibraryService {
  private readonly _entries = signal<LibraryEntry[]>(readStorage(LIBRARY_KEY, []));
  readonly entries = this._entries.asReadonly();
  readonly count = computed(() => this._entries().length);

  get(id: number): LibraryEntry | undefined {
    return this._entries().find((entry) => entry.game.id === id);
  }

  setStatus(game: Game, status: LibraryStatus): void {
    if (this.get(game.id)) {
      this.patch(game.id, { status });
    } else {
      this.save([
        { game: toSnapshot(game), status, addedAt: new Date().toISOString() },
        ...this._entries(),
      ]);
    }
  }

  setReminder(game: Game, remindAt: string | undefined): void {
    if (!this.get(game.id)) this.setStatus(game, 'wish');
    this.patch(game.id, { remindAt });
  }

  remove(id: number): void {
    this.save(this._entries().filter((entry) => entry.game.id !== id));
  }

  private patch(id: number, changes: Partial<LibraryEntry>): void {
    this.save(
      this._entries().map((entry) => (entry.game.id === id ? { ...entry, ...changes } : entry)),
    );
  }

  private save(entries: LibraryEntry[]): void {
    this._entries.set(entries);
    writeStorage(LIBRARY_KEY, entries);
  }
}

/** Evita guardar la descripción larga y las capturas si llega un GameDetail. */
function toSnapshot(game: Game): Game {
  const { id, title, image, summary, playUrl, genre, platforms, publisher, developer } = game;
  return {
    id,
    title,
    image,
    summary,
    playUrl,
    genre,
    platforms,
    publisher,
    developer,
    releaseDate: game.releaseDate,
  };
}
