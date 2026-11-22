import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Platform } from '../../core/models/game.model';
import { GameService } from '../../core/services/game.service';
import { genreColor, genreLabel } from '../../core/utils/genres';
import { GameBox } from '../../shared/game-box';
import { GameCard } from '../../shared/game-card';
import { Icon } from '../../shared/icon';
import { ExploreFilters, SortOrder } from './explore-filters.service';

@Component({
  selector: 'app-explore',
  imports: [DatePipe, GameBox, GameCard, Icon, RouterLink],
  templateUrl: './explore.html',
  styleUrl: './explore.css',
})
export class Explore {
  private readonly service = inject(GameService);
  private readonly router = inject(Router);
  protected readonly filters = inject(ExploreFilters);

  protected readonly games = this.service.games;
  protected readonly genres = this.service.genres;
  protected readonly newest = this.service.newest;
  protected readonly loading = this.service.loading;
  protected readonly error = this.service.error;
  protected readonly lastUpdate = this.service.lastUpdate;

  protected readonly genreLabel = genreLabel;
  protected readonly genreColor = genreColor;
  protected readonly skeletons = Array.from({ length: 8 }, (_, index) => index);
  protected readonly platforms: readonly { value: Platform | null; label: string }[] = [
    { value: null, label: 'Todas' },
    { value: 'pc', label: 'PC' },
    { value: 'browser', label: 'Navegador' },
  ];

  constructor() {
    this.service.ensureLoaded();
  }

  protected retry(): void {
    this.service.load();
  }

  protected setOrder(value: string): void {
    this.filters.order.set(value as SortOrder);
  }

  /** Abre un juego al azar entre los resultados actuales. */
  protected surprise(): void {
    const results = this.filters.results();
    const game = results[Math.floor(Math.random() * results.length)];
    if (game) this.router.navigate(['/juego', game.id]);
  }
}
