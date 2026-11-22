import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ExploreFilters } from '../../features/explore/explore-filters.service';
import { GameDetail, GameDto } from '../models/game.model';
import { GameService } from './game.service';

const dto = (id: number, changes: Partial<GameDto> = {}): GameDto => ({
  id,
  title: `Juego ${id}`,
  thumbnail: 'x.jpg',
  short_description: '',
  game_url: '',
  genre: 'Shooter',
  platform: 'PC (Windows)',
  publisher: '',
  developer: '',
  release_date: `202${id}-01-01`,
  freetogame_profile_url: '',
  ...changes,
});

describe('GameService', () => {
  let service: GameService;
  let http: HttpTestingController;
  const url = 'https://www.freetogame.com/api/games';

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GameService);
    http = TestBed.inject(HttpTestingController);
  });

  it('carga el catálogo y unifica los géneros repetidos', () => {
    service.load();
    expect(service.loading()).toBe(true);
    http
      .expectOne(url)
      .flush([
        dto(1, { genre: ' MMORPG' }),
        dto(2, { genre: 'MMOARPG', platform: 'PC (Windows), Web Browser' }),
        dto(3, { genre: 'Card Game' }),
      ]);
    expect(service.loading()).toBe(false);
    expect(service.genres()).toEqual([
      { name: 'MMORPG', count: 2 },
      { name: 'Card', count: 1 },
    ]);
    expect(service.find(2)?.platforms).toEqual(['pc', 'browser']);
    expect(service.newest().map((game) => game.id)).toEqual([3, 2, 1]);
    expect(service.lastUpdate()).not.toBeNull();
  });

  it('expone un error y permite reintentar', () => {
    service.load();
    http.expectOne(url).flush(null, { status: 504, statusText: 'Gateway Timeout' });
    expect(service.error()).toContain('no responde');
    expect(service.loading()).toBe(false);
    service.load();
    http.expectOne(url).flush([dto(1)]);
    expect(service.error()).toBeNull();
    expect(service.games().length).toBe(1);
  });

  it('tolera fichas sin requisitos ni capturas', () => {
    let detail: GameDetail | undefined;
    service.detail(1).subscribe((value) => (detail = value));
    http
      .expectOne('https://www.freetogame.com/api/game?id=1')
      .flush({ ...dto(1), status: 'Live', description: ' Hola ' });
    expect(detail?.description).toBe('Hola');
    expect(detail?.requirements).toEqual([]);
    expect(detail?.screenshots).toEqual([]);
  });

  it('filtra y ordena los resultados', () => {
    const filters = TestBed.inject(ExploreFilters);
    service.load();
    http
      .expectOne(url)
      .flush([
        dto(1, { title: 'Ápex' }),
        dto(2, { genre: 'MOBA' }),
        dto(3, { platform: 'Web Browser' }),
      ]);
    expect(filters.results().map((game) => game.id)).toEqual([3, 2, 1]);
    filters.query.set('apex');
    expect(filters.results().map((game) => game.id)).toEqual([1]);
    filters.clear();
    filters.platform.set('browser');
    expect(filters.results().map((game) => game.id)).toEqual([3]);
    filters.clear();
    filters.genre.set('MOBA');
    expect(filters.results().map((game) => game.id)).toEqual([2]);
  });
});
