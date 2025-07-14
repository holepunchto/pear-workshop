# HyperDB Workshop

The goal of this workshop is to get used to the basic hyperdb patterns.

We will do so by creating a simple registry of AI models.

Its entries look like
```
{
  name: string, // model name, primary key
  driveKey: fixed32, // Hyperdrive where the model is stored
  type: string, // model type, for easier search (for example 'text-generation' or 'translation')
  description?: string // optional
}
```
The database supports:
- Lookup by model name
- Lookup by (Hyperdrive) key
- Listing all models of a certain type

## Setup

Fork this repository and clone your fork.

Then run:

```
npm i
```

Run `npm t` to verify that everything works correctly.

## Documentation

Hyperdb is documented [here](https://github.com/holepunchto/hyperdb).

Hyperschema is documented [here](https://github.com/holepunchto/hyperschema). Its example.js file is a good source for basic schema patterns.

## Assignment

### 1. Support deleting entries

Add a `delete (name)` method. Unskip the `'delete'` test to verify it works.

Hint: Hyperdb exposes a `tx.delete()` method.

### 2. Add an 'owner' field

### 2.1 Update schema
Add an optional `owner` field to the `entry` definition in [build.js](build.js). The field is a string identifying the person responsible for a particular model.

Hint: you can update the schema by re-running `build.js`. Note that the process will error if you try to make backwards-incompatible changes (like adding a new required field).

### 2.2 Update indices
Add an 'entry-by-owner' index, thereby supporting efficient searches for all models of a particular owner.

Hint: it is very similar to the `entry-by-type` index.

### 2.3 Support listing all models of an owner
Add a `getEntriesOfOwner (owner)` method. Unskip the `'get entries of owner'` test to verify it works.

Hint: don't forget to include the `owner` field in your `put` method.

### 3. Networked service

This workshop focussed on defining the database logic, but it is not yet a usable service. For this it needs networking, so users can insert and query records.

Note: this part of the workshop assumes basic knowledge of Hyperswarm. The 'Lookups' part is straightforward, while the 'Inserts' part is challenging.

### 3.1 Lookups

Lookups can rely on the Holepunch connectivity and storage stack. Peers who know the public key of the registry can swarm on it, then simply create a `Registry` instance to query as you would a local one.

Assignment: create a bin.js file which launches a registry, and announces its public key over hyperswarm. Then create a client.js file which connects to peers on the registry's public key, and looks up an entry.

Hint: do not forget to add a `swarm.on('connection')` handler which sets up corestore replication.

### 3.2 Inserts (Bonus)

Inserting and modifying records can be done by exposing the API over some service. This could be through a REST API, but the most 'holepunchy' way is by using [https://github.com/holepunchto/protomux-rpc](protomux-rpc), a remote-prodedure-call module specifically made to work well with our stack.

Assignment: create an RPC service which exposes a `put` method, allowing remote peers to insert new records. Also define an rpc-client.js file which can use the RPC service (see [protomux-rpc-client](https://github.com/holepunchto/protomux-rpc-client)).

### 4. Redundancy (BONUS)

Warning: this is an advanced topic, added to provide additional context for what a production-quality service would look like. Do not look into this until you feel comfortable with the Holepunch stack and the rest of this workshop. In particular, you should be comfortable with [github.com/holepunchto/autobase](autobase).

Our current service is not very reliable, because it has only a single writer (the owner of the database). If that peer goes down, nobody can modify the database (note that lookups are still supported, since other peers help serve the database).

A further issue is that there is no sane way to take backups in the holepunch ecosystem (unless you know very well what you are doing, you should never take a backup of a corestore or hypercore).

The clean way to solve both issues is by using autobase to create a multi-writer database. Then users can simply switch to another writer if one goes down. Recovering from losing a writer (for example by losing the hard disk containing the private key of one of the writer peers) is done by removing that writer and adding a new one, which is possible as long as a majority of writers is still available.

If you are already (very) comfortable with autobase, you can try extending your networked service of the previous exercise to support multiple writers.

Note that you should set the `{ extension: false }` option for Hyperbee when using autobase (`db = HyperDB.bee(core, spec, { extension: false, autoUpdate: true })`)
