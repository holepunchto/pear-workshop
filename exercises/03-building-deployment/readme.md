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

Install `pear-build`

```sh
npm i -g pear-build
```

`pear-build` assembles the build output into a Pear Drive directory. 

Pass the path to your built app via a flag per OS, for arm64 mac the flag would be `--darwin-arm64-app`, for x64 linux, `--linux-x64-app`. We're building a multiarch deployment folder with just one arch, in a production scenarion we'd want to build all archs and move.
Supply the `*-app` flag(s) with `--package` and `--target` flags to create a 

```sh
# macOS (arm64)
pear-build --darwin-arm64-app "./out/Chat-darwin-arm64/Chat.app" --package package.json --target ./out/build
```

## Stage

Stage the assembled drive to the network:

```sh
pear stage pear://<your-link> ./out/build
```

This synchronizes the local `out/build` to the Pear Drive at your link and outputs a diff of what changed.

Run `pear help stage` for more information.
