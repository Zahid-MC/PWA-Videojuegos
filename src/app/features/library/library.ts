import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Game } from '../../core/models/game.model';
import { LIBRARY_STATUSES, LibraryStatus } from '../../core/models/library.model';
import { LibraryService } from '../../core/services/library.service';
import { PushNotificationService } from '../../core/services/push-notification.service';
import { GameBox } from '../../shared/game-box';
import { Icon } from '../../shared/icon';
import { ReminderPicker } from '../../shared/reminder-picker';

@Component({
  selector: 'app-library',
  imports: [GameBox, Icon, ReminderPicker, RouterLink],
  templateUrl: './library.html',
  styleUrl: './library.css',
})
export class Library {
  private readonly library = inject(LibraryService);
  protected readonly push = inject(PushNotificationService);

  protected readonly count = this.library.count;
  protected readonly statuses = LIBRARY_STATUSES;
  protected readonly lanes = computed(() =>
    LIBRARY_STATUSES.map((status) => ({
      ...status,
      entries: this.library.entries().filter((entry) => entry.status === status.value),
    })),
  );

  protected move(game: Game, status: string): void {
    this.library.setStatus(game, status as LibraryStatus);
  }

  protected remove(id: number): void {
    this.library.remove(id);
  }
}
