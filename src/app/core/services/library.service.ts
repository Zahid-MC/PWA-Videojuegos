import { Injectable, computed, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { Game } from '../models/game.model';
import { LibraryChange, LibraryEntry, LibraryStatus } from '../models/library.model';
import { readStorage, writeStorage } from '../utils/storage';

const LIBRARY_KEY = 'library';

/** Biblioteca personal: se guarda en el dispositivo y funciona siempre sin conexión. */
@Injectable({ providedIn: 'root' })
export class LibraryService {
  private readonly _entries = signal<LibraryEntry[]>(readStorage(LIBRARY_KEY, []));
  readonly entries = this._entries.asReadonly();
  readonly count = computed(() => this._entries().length);

  private readonly _changes = new Subject<LibraryChange>();
  readonly changes = this._changes.asObservable();

  get(id: number): LibraryEntry | undefined {
    return this._entries().find((entry) => entry.game.id === id);
  }

  setStatus(game: Game, status: LibraryStatus): void {
    const current = this.get(game.id);
    if (current?.status === status) return;

    if (current) {
      this.patch(game.id, { status });
    } else {
      this.save([
        { game: toSnapshot(game), status, addedAt: new Date().toISOString() },
        ...this._entries(),
      ]);
    }
    this._changes.next({ gameId: game.id, action: status });
  }

  setReminder(game: Game, remindAt: string | undefined): void {
    if (!this.get(game.id)) this.setStatus(game, 'wish');
    this.patch(game.id, { remindAt });
  }

  remove(id: number): void {
    if (!this.get(id)) return;
    this.save(this._entries().filter((entry) => entry.game.id !== id));
    this._changes.next({ gameId: id, action: 'removed' });
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
