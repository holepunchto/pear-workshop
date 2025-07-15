#!/usr/bin/env node

const path = require('path')
const Corestore = require('corestore')
const IdEnc = require('hypercore-id-encoding')
const Hyperswarm = require('hyperswarm')
const goodbye = require('graceful-goodbye')
const Registry = require('.')

async function main () {
  const storage = path.resolve('hyperdb-workshop-corestore')
  const store = new Corestore(storage)
  await store.ready()

  const swarm = new Hyperswarm({
    // Trick to get a keyPair that remains consistent across restarts
    keyPair: await store.createKeyPair('public-key')
  })

  swarm.on('connection', (conn, peerInfo) => {
    store.replicate(conn)
    const key = IdEnc.normalize(peerInfo.publicKey)
    console.info(`Opened connection to ${key}`)
    conn.on('close', () => console.info(`Closed connection to ${key}`))
  })

  const registry = new Registry(store.get({ name: 'registry' }))

  goodbye(async () => {
    console.info('Shutting down...')
    await swarm.destroy()
    await registry.close()
    console.info('Shut down')
  })

  await registry.ready()

  await registry.put({
    name: 'en-fr',
    driveKey: 'a'.repeat(64),
    type: 'translation',
    owner: 'John Doe'
  })
  await registry.put({
    name: 'en-es',
    driveKey: 'b'.repeat(64),
    type: 'translation',
    owner: 'John Doe'
  })
  await registry.put({
    name: 'en-ner',
    driveKey: 'b'.repeat(64),
    type: 'named-entity-recognition',
    owner: 'Jane Doe'
  })
  console.info('Added dummy entries')

  swarm.join(registry.discoveryKey, { client: false, server: true })
  console.info(`Registry database available at ${IdEnc.normalize(registry.publicKey)}`)
}

main()
