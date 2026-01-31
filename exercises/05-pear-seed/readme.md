# Exercise 5 - `pear seed`

To share an application with peers, seed it with `pear seed`.

To seed the peer-to-peer chat application we've been building, ensure that current working directory is the `chat` folder and then run:

```sh
pear seed dev
```

This will open a terminal process that outputs when the Pear Link has been announced on the DHT and when peers join or drop. As long as this process stays open and the machine stays online the application is being seeded to any peers with the Pear Link for the application.

The `pear seed` command can also be used to reseed by passing a Pear Link `pear seed pear://<key-to-reseed>`.

Run `pear help seed` for more information about `pear seed`.