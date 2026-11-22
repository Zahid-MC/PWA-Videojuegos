import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GAMES_API_URL } from '../config/api.config';
import {
  Game,
  GameDetail,
  GameDetailDto,
  GameDto,
  Platform,
  Requirement,
  RequirementKey,
} from '../models/game.model';
import { normalizeGenre } from '../utils/genres';
import { readStorage, writeStorage } from '../utils/storage';

const LAST_UPDATE_KEY = 'catalog:last-update';

const REQUIREMENT_LABELS: readonly [RequirementKey, string][] = [
  ['os', 'Sistema'],
  ['processor', 'Procesador'],
  ['memory', 'Memoria'],
  ['graphics', 'Gráficos'],
  ['storage', 'Espacio'],
];

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly http = inject(HttpClient);

  private readonly _games = signal<Game[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _lastUpdate = signal<string | null>(readStorage(LAST_UPDATE_KEY, null));

  readonly games = this._games.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  /** Fecha ISO de la última carga hecha con conexión. */
  readonly lastUpdate = this._lastUpdate.asReadonly();

  /** Géneros con su número de juegos, del más al menos común. */
  readonly genres = computed(() => {
    const counts = new Map<string, number>();
    for (const { genre } of this._games()) counts.set(genre, (counts.get(genre) ?? 0) + 1);
    return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  });

  readonly newest = computed(() =>
    [...this._games()].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate)).slice(0, 3),
  );

  /** Carga el catálogo solo si aún no está en memoria. */
  ensureLoaded(): void {
    if (this._games().length === 0) this.load();
  }

  load(): void {
    if (this._loading()) return;
    this._loading.set(true);
    this._error.set(null);

    this.http
      .get<GameDto[]>(`${GAMES_API_URL}/games`)
      .pipe(map((games) => games.map(toGame)))
      .subscribe({
        next: (games) => {
          this._games.set(games);
          this._loading.set(false);
          // Sin conexión responde la caché del service worker: la fecha no debe cambiar.
          if (navigator.onLine) {
            const now = new Date().toISOString();
            this._lastUpdate.set(now);
            writeStorage(LAST_UPDATE_KEY, now);
          }
        },
        error: () => {
          this._error.set(
            navigator.onLine
              ? 'El catálogo no responde. Espera un momento y vuelve a intentarlo.'
              : 'Estás sin conexión y este dispositivo aún no tiene el catálogo guardado.',
          );
          this._loading.set(false);
        },
      });
  }

  detail(id: number): Observable<GameDetail> {
    return this.http
      .get<GameDetailDto>(`${GAMES_API_URL}/game?id=${id}`)
      .pipe(map((dto) => toGameDetail(dto)));
  }

  find(id: number): Game | undefined {
    return this._games().find((game) => game.id === id);
  }
}

function toGame(dto: GameDto): Game {
  return {
    id: dto.id,
    title: dto.title,
    image: dto.thumbnail,
    summary: dto.short_description,
    playUrl: dto.game_url,
    genre: normalizeGenre(dto.genre),
    platforms: toPlatforms(dto.platform),
    publisher: dto.publisher,
    developer: dto.developer,
    releaseDate: dto.release_date,
  };
}

function toPlatforms(platform: string): Platform[] {
  const platforms: Platform[] = [];
  if (platform.includes('Windows')) platforms.push('pc');
  if (platform.includes('Browser')) platforms.push('browser');
  return platforms;
}

function toGameDetail(dto: GameDetailDto): GameDetail {
  const raw = dto.minimum_system_requirements ?? {};
  const requirements = REQUIREMENT_LABELS.flatMap(([key, label]): Requirement[] => {
    const value = raw[key]?.trim();
    return value ? [{ label, value }] : [];
  });
  return {
    ...toGame(dto),
    description: dto.description.trim(),
    requirements,
    screenshots: (dto.screenshots ?? []).map((item) => item.image),
  };
}
