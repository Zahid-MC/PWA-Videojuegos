import { Injectable, effect, inject, untracked } from '@angular/core';
import { concatMap } from 'rxjs';
import { LibraryChange } from '../models/library.model';
import { ConnectivityService } from './connectivity.service';
import { LibraryService } from './library.service';
import { PushNotificationService } from './push-notification.service';

/** Avisa al servidor de cada cambio en la biblioteca para que envíe la notificación. */
@Injectable({ providedIn: 'root' })
export class LibraryNotificationsService {
  private readonly library = inject(LibraryService);
  private readonly push = inject(PushNotificationService);
  private readonly online = inject(ConnectivityService).online;

  constructor() {
    // concatMap conserva el orden si se hacen varios cambios seguidos.
    this.library.changes.pipe(concatMap((change) => this.notify(change))).subscribe();

    // Al abrir la app, activar los avisos o recuperar la red, el servidor se pone al día.
    effect(() => {
      if (this.online() && this.push.enabled()) untracked(() => void this.sync());
    });
  }

  private async notify(change: LibraryChange): Promise<void> {
    if (!this.push.enabled()) return;
    // La biblioteca ya se guardó en el dispositivo: un fallo aquí no debe interrumpir nada.
    await this.push.notifyLibraryChange(change).catch(() => undefined);
  }

  private async sync(): Promise<void> {
    await this.push.syncLibrary(this.library.entries()).catch(() => undefined);
  }
}
