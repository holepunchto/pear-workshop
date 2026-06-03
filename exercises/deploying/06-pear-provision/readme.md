# Exercise 6 - `pear provision`

With `pear stage` both additions and deletions are appended to the application drive. 

A provision synchronizes from another pear:// link in a way that strips additions/deletions resulting in a smaller data footprint.

So use `pear provision` to optimally sync from a staged link in order to create a prerelease link.

Let's create a new link:

```js
pear touch
```

Right now the `upgrade` field is pointing to the stage link, we need to update it to point to the prerelease link that we're going to `pear provision` to:

```
npm pkg set upgrade=<PRERELEASE_PEAR_LINK>
```

The `pear provision` command has the following signature:

```sh
pear provision <versioned-source-link> <target-link> <versioned-production-link>
```

First versioned-production-link is synced to target-link, then versioned-source-link is synced on top. 

A versioned link is `pear://<fork>.<length>.<key>`.

The staging link is our source, the versioned link is printed out after every stage. We can get the current versioned link with:

 ```sh
 pear stage --dry-run <STAGING_LINK>
 ```

The production link doesn't exist yet, we'll create it in the next exercise with `pear multisig`. So to bootstrap the prerelease link we use pear://0.0.<source> as the versioned-production-link.

The target-link is prerelease link we just created with `pear touch`.

Always dry run first so the diff can be checked before writing:

```sh
pear provision --dry-run <versioned-source-link> <target-link> <versioned-production-link>
```

Replace the following example Pear links with versioned staging link, the prerelease link, and `pear://0.0.<stagingkey>`:

```sh
pear provision --dry-run pear://0.3243.majyfnkt4tf4gaubdzpjyggrzffambc86x4nyw5ymgo7iz3gmaky pear://1ppmhno719h6r5cq8rs1dud159naunmopgm7hjf9n1ywjjy8mjuo pear://0.0.majyfnkt4tf4gaubdzpjyggrzffambc86x4nyw5ymgo7iz3gmaky
```

If the dry run looks good, provision:

```sh
pear provision pear://0.3243.majyfnkt4tf4gaubdzpjyggrzffambc86x4nyw5ymgo7iz3gmaky pear://1ppmhno719h6r5cq8rs1dud159naunmopgm7hjf9n1ywjjy8mjuo pear://0.0.majyfnkt4tf4gaubdzpjyggrzffambc86x4nyw5ymgo7iz3gmaky
```