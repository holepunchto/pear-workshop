# Exercise 1 - Starting

Clone the starter application:

```sh
git clone https://github.com/holepunchto/hello-pear-electron chat
cd chat
npm pkg set name=chat productName=Chat version=0.0.0
npm install
npm start
```

A window should open. That's the application shell — an Electron app wired to [Pear Runtime](https://github.com/holepunchto/pear-runtime) for peer-to-peer delivery.

The key files:

- `electron/main.js` — starts the app, manages workers
- `electron/preload.js` — exposes `window.bridge` to the renderer
- `renderer/` — the UI (standard sandboxed web page)
- `workers/` — Bare workers: embedded JS runtime for P2P code
