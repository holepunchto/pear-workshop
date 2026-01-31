# Exercise 2 - `pear run`

The `pear run` command runs a peer-to-peer application from a link. This can be a `pear://` link or a `file://` link or a filepath (which is converted to a `file://` link internally).

Ensure that the current working directory is the `chat` application folder generated with `pear init` in Exercise 1 and then open the intiialized application with:

 ```sh
 pear run --dev .
 ```

The `--dev` (or `-d`) flag opens the application in Development Mode and opens Devtools automatically.

Pear links take the form `pear://<key>` or `pear://<alias>`. We'll use keys later for now try the following alias:

```sh
pear run pear://keet
```

Whether or not Keet was installed on system via it's distributable, this will open Keet. 

Keet is loaded peer-to-peer by Pear Runtime.

Run `pear help run` for more information about `pear run`.