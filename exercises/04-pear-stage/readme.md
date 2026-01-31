# Exercise 4 - `pear stage`

In the `chat` dir first make sure dependencies are installed:

```sh
npm install
```

Then make sure that development depencencies are pruned, we only ever want to stage production dependencies:

```sh
npm prune --omit=dev
```

Under the hood, the `pear stage` command synchronizes files from disk into a peer-to-peer data structure called a Hypercore. This data structure can then be seeded to peers.

Ensuring that the current working directory is in the `chat` folder, stage the chat project with:

```sh
pear stage dev
```

This will output a file diff of changes resulting from disk to Hypercore synchronization along with a Pear link that can be used to run application remotely of the form:
 `pear://<key>`.

When staging an application it must be given a channel name. In real-world usage we use `pear stage dev` for the development key to be shared among the development team, `pear stage stage` for internal preview and `pear stage rc` for release-candidate.

Run `pear help stage` for more information about `pear stage`.