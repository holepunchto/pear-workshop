const path = require('path')
const Corestore = require('corestore')
const IdEnc = require('hypercore-id-encoding')
const Hyperswarm = require('hyperswarm')

const Registry = require('.')

async function main () {
  const key = process.argv[2]
  if (!key) {
    console.error('ERROR: specify the database public key as argument')
    process.exit(1)
  }
  console.info(`Using public key ${IdEnc.normalize(key)}`)
  const storage = path.resolve('hyperdb-workshop-client-corestore')
  const store = new Corestore(storage)
  await store.ready()

  const swarm = new Hyperswarm()
  swarm.on('connection', (conn, peerInfo) => {
    store.replicate(conn)
    const key = IdEnc.normalize(peerInfo.publicKey)
    console.info(`Opened connection to ${key}`)
    conn.on('close', () => console.info(`Closed connection to ${key}`))
  })

  const core = store.get(IdEnc.decode(key))
  const registry = new Registry(core)
  await registry.ready()

  console.info(`Swarming on the discovery key (${IdEnc.normalize(registry.discoveryKey)})`)
  swarm.join(registry.discoveryKey, { client: true, server: false })

  // Hack to ensure we're connected (only needed the first time, after that we have the entry locally)
  // Note: there are cleaner ways to do this, for example using hyperdb watchers, but those are out of scope for this workshop
  await new Promise(resolve => setTimeout(resolve, 1000))

  console.log('Getting entry...')
  const entry = await registry.get('en-fr')
  console.log(entry)

  await swarm.destroy()
  await registry.close()
}

main()
