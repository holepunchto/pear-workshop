# Exercise 3 - Building Deployment

Deploying a Pear app means building a native binary, bundling it into a Pear Drive, and staging it to the network.

## Get a Pear Link

A Pear Drive is identified by a key. Create one:

```sh
pear touch
```

Copy the `pear://` link from the output and add it to `package.json`:

```json
{
  "upgrade": "pear://<your-link-here>"
}
```

This is the permanent address of your deployment — it doesn't change between versions.

## Build

Build the native binary for your platform:

```sh
# macOS
npm run make:darwin

# Linux
npm run make:linux

# Windows
npm run make:win32
```

Output lands in `out/`.

## Assemble

`pear-build` assembles the build output into a Pear Drive directory. Pass the path to your built app:

```sh
# macOS (arm64)
pear-build --darwin-arm64-app "./out/<ProductName>-darwin-arm64/<ProductName>.app" ./out/dist

# macOS (universal)
pear-build \
  --darwin-arm64-app "./out/<ProductName>-darwin-arm64/<ProductName>.app" \
  --darwin-x64-app  "./out/<ProductName>-darwin-x64/<ProductName>.app"  \
  ./out/dist
```

Replace `<ProductName>` with the `productName` from your `package.json`.

## Stage

Stage the assembled drive to the network:

```sh
pear stage pear://<your-link> ./out/dist
```

This synchronizes the local `out/dist` to the Pear Drive at your link and outputs a diff of what changed.

Run `pear help stage` for more information.
