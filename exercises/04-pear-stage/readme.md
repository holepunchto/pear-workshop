# Exercise 4 - `pear stage`

In the `chat` dir first make sure dependencies are installed:

```sh
npm install
```

Under the hood, the `pear stage` command synchronizes files from disk into a peer-to-peer data structure
called a Hypercore. This data structure can then be seeded to peers.

Ensuring that the current working directory is in the `chat` folder, stage the chat project with:

```sh
pear stage my-app
```

This will output a Pear link for the app of the form `pear://<key>`, along with a file diff of changes resulting from disk to Hypercore synchronization.

When staging an application it must be given a channel name, in this case we use `my-app`. In real-world usage we use `pear stage dev` for the development key, `pear stage staging` for internal preview, `pear stage rc` for release-candidate and `pear stage production` to go live.

Run `pear help stage` for more information about `pear stage`.