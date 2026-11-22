import { TestBed } from '@angular/core/testing';
import { Game } from '../models/game.model';
import { LibraryChange } from '../models/library.model';
import { isUpcoming } from '../utils/release';
import { LibraryService } from './library.service';

const game: Game = {
  id: 7,
  title: 'Prueba',
  image: '',
  summary: '',
  playUrl: '',
  genre: 'RPG',
  platforms: ['pc'],
  publisher: '',
  developer: '',
  releaseDate: '2026-01-01',
};

describe('LibraryService', () => {
  beforeEach(() => localStorage.clear());

  it('guarda, cambia de estado y quita juegos', () => {
    const library = TestBed.inject(LibraryService);
    library.setStatus(game, 'wish');
    library.setStatus(game, 'playing');
    expect(library.count()).toBe(1);
    expect(library.get(7)?.status).toBe('playing');
    library.remove(7);
    expect(library.count()).toBe(0);
  });

  it('emite cada cambio una sola vez', () => {
    const library = TestBed.inject(LibraryService);
    const changes: LibraryChange[] = [];
    library.changes.subscribe((change) => changes.push(change));
    library.setStatus(game, 'wish');
    library.setStatus(game, 'wish');
    library.setStatus(game, 'playing');
    library.setStatus(game, 'done');
    library.remove(7);
    library.remove(7);
    expect(changes.map((change) => change.action)).toEqual(['wish', 'playing', 'done', 'removed']);
  });

  it('distingue los juegos que aún no salen', () => {
    const today = new Date(2026, 0, 1);
    expect(isUpcoming(game, today)).toBe(false);
    expect(isUpcoming({ ...game, releaseDate: '2026-01-02' }, today)).toBe(true);
  });

  it('un recordatorio añade el juego y todo persiste', () => {
    TestBed.inject(LibraryService).setReminder(game, '2030-01-01T00:00:00.000Z');
    TestBed.resetTestingModule();
    const restored = TestBed.inject(LibraryService).get(7);
    expect(restored?.status).toBe('wish');
    expect(restored?.remindAt).toBe('2030-01-01T00:00:00.000Z');
  });
});
