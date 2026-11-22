import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { Platform } from '../../core/models/game.model';
import { GameService } from '../../core/services/game.service';

export type SortOrder = 'newest' | 'oldest' | 'title';

const PAGE_SIZE = 24;

/** Vive en la raíz para conservar los filtros al volver del detalle de un juego. */
@Injectable({ providedIn: 'root' })
export class ExploreFilters {
  private readonly gamesService = inject(GameService);

  readonly query = signal('');
  readonly genre = signal<string | null>(null);
  readonly platform = signal<Platform | null>(null);
  readonly order = signal<SortOrder>('newest');

  readonly active = computed(
    () => this.query().trim() !== '' || this.genre() !== null || this.platform() !== null,
  );

  readonly results = computed(() => {
    const query = normalize(this.query());
    const genre = this.genre();
    const platform = this.platform();
    const order = this.order();

    return this.gamesService
      .games()
      .filter(
        (game) =>
          (!genre || game.genre === genre) &&
          (!platform || game.platforms.includes(platform)) &&
          (!query || normalize(`${game.title} ${game.developer}`).includes(query)),
      )
      .sort((a, b) => {
        if (order === 'title') return a.title.localeCompare(b.title);
        const difference = b.releaseDate.localeCompare(a.releaseDate);
        return order === 'newest' ? difference : -difference;
      });
  });

  /** Vuelve a la primera página cuando cambian los resultados. */
  private readonly limit = linkedSignal({ source: this.results, computation: () => PAGE_SIZE });
  readonly visible = computed(() => this.results().slice(0, this.limit()));
  readonly remaining = computed(() => this.results().length - this.visible().length);

  showMore(): void {
    this.limit.update((limit) => limit + PAGE_SIZE);
  }

  clear(): void {
    this.query.set('');
    this.genre.set(null);
    this.platform.set(null);
  }
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}
