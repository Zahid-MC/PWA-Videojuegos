import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

// En la primera visita los datos se piden antes de que el service worker tome el control y no
// quedan en caché. Se recarga una sola vez para que esas peticiones pasen por él.
if ('serviceWorker' in navigator && !navigator.serviceWorker.controller) {
  navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), {
    once: true,
  });
}
