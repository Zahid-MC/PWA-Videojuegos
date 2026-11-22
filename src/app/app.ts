import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { filter } from 'rxjs';
import { ConnectivityService } from './core/services/connectivity.service';
import { LibraryService } from './core/services/library.service';
import { Icon, IconName } from './shared/icon';

/** Chrome y Edge lo emiten; TypeScript aún no incluye el tipo. */
interface InstallPromptEvent extends Event {
  prompt(): Promise<unknown>;
}

@Component({
  selector: 'app-root',
  imports: [Icon, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(window:beforeinstallprompt)': 'keepInstallPrompt($event)',
    '(window:appinstalled)': 'installPrompt.set(null)',
  },
})
export class App {
  private readonly updates = inject(SwUpdate);
  protected readonly online = inject(ConnectivityService).online;
  protected readonly saved = inject(LibraryService).count;

  protected readonly updateReady = signal(false);
  protected readonly installPrompt = signal<InstallPromptEvent | null>(null);

  protected readonly links: readonly { path: string; label: string; icon: IconName }[] = [
    { path: '/explorar', label: 'Explorar', icon: 'compass' },
    { path: '/biblioteca', label: 'Biblioteca', icon: 'shelf' },
    { path: '/avisos', label: 'Avisos', icon: 'bell' },
  ];

  constructor() {
    this.updates.versionUpdates
      .pipe(
        filter((event) => event.type === 'VERSION_READY'),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.updateReady.set(true));
  }

  protected reload(): void {
    location.reload();
  }

  protected keepInstallPrompt(event: Event): void {
    event.preventDefault();
    this.installPrompt.set(event as InstallPromptEvent);
  }

  protected async install(): Promise<void> {
    await this.installPrompt()?.prompt();
    this.installPrompt.set(null);
  }
}
