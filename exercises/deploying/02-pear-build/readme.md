# Exercise 2 - `pear build`

Deploying a Pear app means building a native binary, bundling it into a Pear Drive, and staging it to the network.

Make sure the `upgrade` field is set to the pear link created with `pear touch`.

## Install Dependencies

```sh
npm install
```

## Make Distributables

Build the native application distributables

```sh
npm run make
```

Output lands in `out/`.

Depending on your machine the `out` folder will contain either Mac, Linux or Windows application builds.

### Vendor Signing

On Mac and Windows in order to run distributables they need to be signed, see https://github.com/holepunchto/hello-pear-electron#3-make-distributables- but for demonstration purposes we're skipping that here.

## Build Deployment Folder

```
$ pear build -h
Pear ~ Welcome to the Internet of Peers
🍐 v0.3243.pzcjqmpoo6szkoc4bpkw65ib9ctnrq7b6mneeinbhbheihaq6p6o

  pear build [flags]

  Create project deployment folder

  Flags:
    --help|-h                      Show help
    --package [path]               Path to project package.json
    --target [path]                Target build dir
    --darwin-arm64-app [path]      Path to Mac ARM64 app
    --darwin-x64-app [path]        Path to Mac x64 app
    --linux-arm64-app [path]       Path to Linux ARM64 app
    --linux-x64-app [path]         Path to Linux x64 app
    --win32-x64-app [path]         Path to Windows x64 app
    --win32-arm64-app [path]       Path to Windows ARM64 app
    --ios-arm64 [path]             Path to iOS ARM64 folder (ota bundle and assets)
    --ios-arm64-simulator [path]   Path to iOS ARM64-Simulator folder (ota bundle and asset)
    --ios-x64-simulator [path]     Path to iOS x64-Simulator folder (ota bundle and assets)
    --android-arm64 [path]         Path to Android ARM64 folder (ota bundle and assets)
    --json                         Newline delimited JSON output
```

`pear build` is for creating multi-OS-architecture deployment folder per a the following format:

```
by-arch/
 package.json
 app/[platform]-[arch]/...
```
So for example, `by-arch/app/darwin-arm64/` would contain the Mac ARM application build.

Pass the path to your built app via a flag per OS, for arm64 mac the flag would be `--darwin-arm64-app`, for x64 linux, `--linux-x64-app`. 

We're building a multiarch deployment folder with just one arch, in a production scenario we'd want to make distributables on each machine, move them to one machine and then pass them to `pear build` to create the final deployment folder format.

Supply the `*-app` flag(s) with `--package` and `--target` flags to create the deployment build. For example:

```sh
# macOS (arm64)
pear build --darwin-arm64-app "./out/Chat-darwin-arm64/Chat.app" --package package.json --target ./out/build
```

