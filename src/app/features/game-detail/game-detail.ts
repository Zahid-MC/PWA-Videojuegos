import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap, tap } from 'rxjs';
import { Game, GameDetail } from '../../core/models/game.model';
import { LIBRARY_STATUSES } from '../../core/models/library.model';
import { GameService } from '../../core/services/game.service';
import { LibraryService } from '../../core/services/library.service';
import { PushNotificationService } from '../../core/services/push-notification.service';
import { genreColor, genreLabel } from '../../core/utils/genres';
import { isUpcoming } from '../../core/utils/release';
import { GameBox } from '../../shared/game-box';
import { Icon } from '../../shared/icon';
import { ReminderPicker } from '../../shared/reminder-picker';

type DetailState =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; game: GameDetail };

@Component({
  selector: 'app-game-detail',
  imports: [DatePipe, GameBox, Icon, ReminderPicker, RouterLink],
  templateUrl: './game-detail.html',
  styleUrl: './game-detail.css',
})
export class GameDetailPage {
  private readonly service = inject(GameService);
  private readonly title = inject(Title);
  protected readonly library = inject(LibraryService);
  protected readonly push = inject(PushNotificationService);

  /** Parámetro :id de la ruta. */
  readonly id = input.required<string>();
  private readonly attempt = signal(0);
  private readonly request = computed(() => ({ id: Number(this.id()), attempt: this.attempt() }));

  protected readonly state = toSignal(
    toObservable(this.request).pipe(
      switchMap(({ id }) =>
        this.service.detail(id).pipe(
          tap((game) => this.title.setTitle(`${game.title} · Partida`)),
          map((game): DetailState => ({ status: 'ready', game })),
          startWith<DetailState>({ status: 'loading' }),
          catchError(() => of<DetailState>({ status: 'error' })),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } satisfies DetailState as DetailState },
  );

  protected readonly detail = computed(() => {
    const state = this.state();
    return state.status === 'ready' ? state.game : null;
  });

  /** Si el detalle no está disponible se usa lo que haya en el catálogo o la biblioteca. */
  protected readonly game = computed<Game | null>(() => {
    const id = Number(this.id());
    return this.detail() ?? this.service.find(id) ?? this.library.get(id)?.game ?? null;
  });

  protected readonly entry = computed(() => this.library.get(Number(this.id())));
  protected readonly color = computed(() => genreColor(this.game()?.genre ?? ''));
  protected readonly label = computed(() => genreLabel(this.game()?.genre ?? ''));
  protected readonly statuses = LIBRARY_STATUSES;

  protected readonly upcoming = computed(() => {
    const game = this.game();
    return game !== null && isUpcoming(game);
  });
  protected readonly releaseNotice = computed(() => {
    if (!this.push.enabled() || !this.push.preferences().releases) {
      return 'Activa los avisos de lanzamientos para saber cuándo sale.';
    }
    const status = this.entry()?.status;
    return status && status !== 'done'
      ? 'Te avisaremos la víspera y el día que salga.'
      : 'Guárdalo y te avisaremos cuando salga.';
  });

  /** Capturas que sí cargaron: sin conexión algunas pueden no estar guardadas. */
  protected readonly screenshots = linkedSignal(() => this.detail()?.screenshots ?? []);
  protected readonly selected = linkedSignal<string | undefined>(() => this.screenshots()[0]);

  protected readonly expanded = linkedSignal({ source: this.id, computation: () => false });

  protected retry(): void {
    this.attempt.update((value) => value + 1);
  }

  protected dropScreenshot(url: string): void {
    this.screenshots.update((list) => list.filter((item) => item !== url));
  }
}
