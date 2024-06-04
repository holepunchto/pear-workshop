# Exercise 4 - `pear release`

The `pear release` command sets a release pointer on a staged application core.

Ensure that current working directory is the chat folder.

Make a change to a file (say `index.html`) in the chat folder and the stage the changes:

```sh
pear stage my-app
```

Note how the stage outputs the new length number. This forms part of the application version (`key.fork.length`).

Run the app to view the update:

```sh
pear run pear://<key>
```

Close the app then let's mark a release:

```sh
pear release my-app
```

This marks the release at the current version length.

Undo the change made in `index.html` (or make another one) and then stage again:

```sh
pear stage my-app
```

Running the application (`pear run pear://<key>`) this time will show the application without the new change.

The `pear run` command has a checkout flag that can be used to preview prerelease content:

```sh
pear run --checkout=staged pear://<key>
```

When happy with the staged application, the latest length can be marked for release by running `pear release` again:

```sh
pear release my-app
```

Run `pear help release` for more information about `pear release`.