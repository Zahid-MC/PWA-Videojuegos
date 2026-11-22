import { Component, inject, signal } from '@angular/core';
import { PushPreferences } from '../../core/models/push.model';
import { GameService } from '../../core/services/game.service';
import { PushNotificationService } from '../../core/services/push-notification.service';
import { genreColor, genreLabel } from '../../core/utils/genres';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-alerts',
  imports: [Icon],
  templateUrl: './alerts.html',
  styleUrl: './alerts.css',
})
export class Alerts {
  protected readonly push = inject(PushNotificationService);
  private readonly games = inject(GameService);

  protected readonly genres = this.games.genres;
  protected readonly genreLabel = genreLabel;
  protected readonly genreColor = genreColor;

  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly message = signal<string | null>(null);

  constructor() {
    this.games.ensureLoaded();
  }

  protected enable(): Promise<void> {
    return this.run(() => this.push.enable(), 'Avisos activados en este dispositivo.');
  }

  protected disable(): Promise<void> {
    return this.run(() => this.push.disable(), 'Avisos desactivados en este dispositivo.');
  }

  protected test(): Promise<void> {
    return this.run(() => this.push.sendTest(), 'Enviado. Debería llegar en unos segundos.');
  }

  protected update(changes: Partial<PushPreferences>): Promise<void> {
    const preferences = { ...this.push.preferences(), ...changes };
    return this.run(() => this.push.savePreferences(preferences), 'Preferencias guardadas.');
  }

  protected toggleGenre(name: string): Promise<void> {
    const { genres } = this.push.preferences();
    return this.update({
      genres: genres.includes(name) ? genres.filter((genre) => genre !== name) : [...genres, name],
    });
  }

  private async run(action: () => Promise<void>, success: string): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    this.message.set(null);
    try {
      await action();
      this.message.set(success);
    } catch (error) {
      this.error.set(this.push.describeError(error));
    } finally {
      this.busy.set(false);
    }
  }
}
