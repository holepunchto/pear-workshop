# Exercise 4 - Seeding Deployment

Staging puts the app into a Pear Drive. Seeding makes it available to peers.

```sh
pear seed pear://<your-link>
```

This opens a long-running process that announces the drive on the DHT and serves it to any peer requesting it. Keep it running — as long as it's up, your deployment is live.

The terminal will output when the link is announced and when peers connect or disconnect.

Run `pear help seed` for more information.
