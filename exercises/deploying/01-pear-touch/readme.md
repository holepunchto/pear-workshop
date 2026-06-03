# Exercise 1 - `pear touch`


We'll be deploying [snake](https://github.com/holepunchto/snake)

```sh
git clone git@github.com:holepunchto/snake
```

The Pear CLI is required for these exercises, install it like so:

```js
npx pear
```

Deploying a Pear app means building a native binary, bundling it into a Pear Drive, and staging it to the network.

A Pear Drive is identified by a key, which is held in a `pear://` link.

Create one:

```sh
pear touch
```

Copy the `pear://` link from the output and add it to snake's `package.json`:

```json
{
  "upgrade": "pear://<your-link-here>"
}
```

The pear link is the deployments address, when the application starts the `pear-runtime` module listens for updates at that address and then applies them on demand.