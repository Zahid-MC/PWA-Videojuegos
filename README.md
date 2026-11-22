# Partida

PWA en Angular con un catálogo de videojuegos gratuitos ([FreeToGame](https://www.freetogame.com)),
biblioteca personal, modo sin conexión y notificaciones push. El servidor de avisos es
`pwa-videojuegos-push`.

## Ejecutar en local

```bash
npm install
npm run build
npx http-server -p 8081 -c-1 dist/pwa-videojuegos/browser
```

Abre `http://localhost:8081`. Con `ng serve` no hay service worker, caché ni avisos. Para los avisos,
arranca también el servidor.

## Estructura

- `src/app/core`: configuración, modelos, servicios y utilidades.
- `src/app/shared`: componentes reutilizables.
- `src/app/features`: pantallas (explorar, ficha, biblioteca y avisos).
- `ngsw-config.json`: políticas de caché.

## Desplegar en Vercel

1. Despliega antes el servidor y escribe su URL en `PRODUCTION_PUSH_API_URL`
   (`src/app/core/config/push.config.ts`). La clave `VAPID_PUBLIC_KEY` debe ser la del servidor.
2. Sube este proyecto a GitHub e impórtalo en Vercel. `vercel.json` ya define todo lo demás.
3. Añade la URL de Vercel a `ALLOWED_ORIGINS` en el servidor.
