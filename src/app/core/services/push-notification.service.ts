import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom } from 'rxjs';
import { PUSH_API_URL, VAPID_PUBLIC_KEY } from '../config/push.config';
import { PushPreferences } from '../models/push.model';
import { readStorage, writeStorage } from '../utils/storage';

const PREFERENCES_KEY = 'push:preferences';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private readonly swPush = inject(SwPush);
  private readonly http = inject(HttpClient);

  readonly isSupported = this.swPush.isEnabled && 'Notification' in window;
  readonly isConfigured = PUSH_API_URL !== '';

  private readonly _enabled = signal(false);
  readonly enabled = this._enabled.asReadonly();

  private readonly _preferences = signal<PushPreferences>(
    readStorage(PREFERENCES_KEY, { newGames: true, weekly: true, genres: [] }),
  );
  readonly preferences = this._preferences.asReadonly();

  constructor() {
    this.restore();
  }

  async enable(): Promise<void> {
    // Si quedó una suscripción creada con otra clave VAPID, el navegador rechazaría la nueva.
    await (await this.current())?.unsubscribe();
    const subscription = await this.swPush.requestSubscription({
      serverPublicKey: VAPID_PUBLIC_KEY,
    });
    try {
      await this.register(subscription);
      this._enabled.set(true);
    } catch (error) {
      // Sin registro en el servidor la suscripción no sirve: se deshace.
      await subscription.unsubscribe();
      this._enabled.set(false);
      throw error;
    }
  }

  async disable(): Promise<void> {
    const subscription = await this.current();
    if (subscription) {
      const { endpoint } = subscription;
      await subscription.unsubscribe();
      // Si el servidor no responde, él mismo la borrará al recibir un 410 en el próximo envío.
      await this.post('/unsubscribe', { endpoint }).catch(() => undefined);
    }
    this._enabled.set(false);
  }

  async savePreferences(preferences: PushPreferences): Promise<void> {
    const previous = this._preferences();
    this._preferences.set(preferences);
    try {
      const subscription = await this.current();
      if (subscription) await this.register(subscription, true);
      writeStorage(PREFERENCES_KEY, preferences);
    } catch (error) {
      this._preferences.set(previous);
      throw error;
    }
  }

  async sendTest(): Promise<void> {
    await this.post('/test', { endpoint: await this.registeredEndpoint() });
  }

  async setReminder(gameId: number, remindAt: string): Promise<void> {
    const endpoint = await this.registeredEndpoint();
    await this.post('/reminders', { endpoint, gameId, remindAt });
  }

  async cancelReminder(gameId: number): Promise<void> {
    await this.post('/reminders/cancel', { endpoint: await this.registeredEndpoint(), gameId });
  }

  /** Convierte cualquier fallo en un mensaje que diga qué hacer. */
  describeError(error: unknown): string {
    if (this.isSupported && Notification.permission === 'denied') {
      return 'El navegador tiene bloqueadas las notificaciones de este sitio. Permítelas en sus ajustes y vuelve a intentarlo.';
    }
    if (error instanceof HttpErrorResponse) {
      const message: unknown = error.error?.error;
      if (error.status === 400 && typeof message === 'string') return message;
      return 'El servidor de avisos no responde. Si llevaba rato inactivo puede tardar un minuto en despertar.';
    }
    return 'No se pudo completar. Comprueba que aceptaste el permiso de notificaciones.';
  }

  /** El servidor gratuito puede perder sus datos al reiniciarse: se vuelve a registrar al abrir. */
  private async restore(): Promise<void> {
    if (!this.isSupported || !this.isConfigured) return;
    const subscription = await this.current();
    if (!subscription) return;
    this._enabled.set(true);
    await this.register(subscription, true).catch(() => undefined);
  }

  private register(subscription: PushSubscription, silent = false): Promise<unknown> {
    return this.post('/subscribe', { subscription, preferences: this._preferences(), silent });
  }

  private async current(): Promise<PushSubscription | null> {
    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.getSubscription();
  }

  /** Se asegura de que el servidor conoce este dispositivo, por si perdió sus datos. */
  private async registeredEndpoint(): Promise<string> {
    const subscription = await this.current();
    if (!subscription) throw new Error('Este dispositivo no está suscrito.');
    await this.register(subscription, true);
    return subscription.endpoint;
  }

  private post(path: string, body: unknown): Promise<unknown> {
    return firstValueFrom(this.http.post(`${PUSH_API_URL}${path}`, body));
  }
}
