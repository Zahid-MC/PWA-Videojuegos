import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Game } from '../core/models/game.model';
import { LibraryService } from '../core/services/library.service';
import { PushNotificationService } from '../core/services/push-notification.service';
import { Icon } from './icon';

type When = 'minute' | 'hour' | 'tomorrow' | 'week';

@Component({
  selector: 'app-reminder-picker',
  imports: [DatePipe, Icon, RouterLink],
  template: `
    @if (pending(); as date) {
      <p class="set">
        <app-icon name="clock" />
        Te avisaremos el {{ date | date: 'dd/MM' }} a las {{ date | date: 'HH:mm' }}
        <button type="button" [disabled]="busy()" (click)="cancel()">Cancelar</button>
      </p>
    } @else if (push.enabled()) {
      <div class="row">
        <select class="field" #when aria-label="Cuándo avisarte">
          <option value="tomorrow">Mañana a las 20:00</option>
          <option value="hour">En una hora</option>
          <option value="week">En una semana</option>
          <option value="minute">En un minuto (prueba)</option>
        </select>
        <button class="btn" type="button" [disabled]="busy()" (click)="set(when.value)">
          <app-icon name="clock" /> Recordarme
        </button>
      </div>
    } @else {
      <p class="hint">
        <a routerLink="/avisos">Activa los avisos</a> para programar un recordatorio.
      </p>
    }
    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    }
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .row > * {
      flex: 1 1 150px;
    }
    .set {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      font-size: 0.925rem;
    }
    .set button {
      padding: 6px 4px;
      border: 0;
      background: none;
      color: var(--mute);
      text-decoration: underline;
    }
    .hint {
      color: var(--mute);
      font-size: 0.925rem;
    }
    .hint a {
      color: var(--cream);
    }
    .error {
      margin-top: 8px;
      color: var(--danger);
      font-size: 0.925rem;
    }
  `,
})
export class ReminderPicker {
  private readonly library = inject(LibraryService);
  protected readonly push = inject(PushNotificationService);

  readonly game = input.required<Game>();
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  /** Los recordatorios ya vencidos dejan de mostrarse. */
  protected readonly pending = computed(() => {
    const date = this.library.get(this.game().id)?.remindAt;
    return date && Date.parse(date) > Date.now() ? date : null;
  });

  protected set(when: string): Promise<void> {
    const remindAt = toDate(when as When).toISOString();
    return this.run(async () => {
      await this.push.setReminder(this.game().id, remindAt);
      this.library.setReminder(this.game(), remindAt);
    });
  }

  protected cancel(): Promise<void> {
    return this.run(async () => {
      await this.push.cancelReminder(this.game().id);
      this.library.setReminder(this.game(), undefined);
    });
  }

  private async run(action: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    try {
      await action();
    } catch (error) {
      this.error.set(this.push.describeError(error));
    } finally {
      this.busy.set(false);
    }
  }
}

function toDate(when: When): Date {
  const date = new Date();
  switch (when) {
    case 'minute':
      date.setMinutes(date.getMinutes() + 1);
      break;
    case 'hour':
      date.setHours(date.getHours() + 1);
      break;
    case 'week':
      date.setDate(date.getDate() + 7);
      break;
    case 'tomorrow':
      date.setDate(date.getDate() + 1);
      date.setHours(20, 0, 0, 0);
  }
  return date;
}
