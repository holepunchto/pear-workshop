## Exercise 2 - `pear stage`

The `pear stage` command synchronizes from disk to a Hyperdrive owned by the Pear CLI addressed by its `pear://` link.

The stage command outputs a diff of what changed, this is helpful to understanding changes made. Use the `--dry-run` flag to see what changes would be made first:


```sh
pear stage --dry-run pear://<your-link> ./out/build
```

Stage the deployment build to the network:

```sh
pear stage pear://<your-link> ./out/build
```

This synchronizes the local `out/build` to a Hyperdrive in Pear addressed by the upgrade link. 

Run `pear help stage` for more.

The next step is to seed the application build drive.
