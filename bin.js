const Corestore = require('corestore')
const Hyperswarm = require('hyperswarm')
const goodbye = require('graceful-goodbye')
const Registry = require('./index.js')

async function main () {
  // Create a corestore to manage hypercore storage
  const store = new Corestore('./registry-storage')

  // Create a registry instance using a named hypercore
  const registry = new Registry(store.get({ name: 'registry' }))

  // Wait for the registry to be ready
  await registry.ready()

  // Create a hyperswarm instance for P2P networking
  const swarm = new Hyperswarm()

  // Set up graceful shutdown
  goodbye(() => {
    console.log('Shutting down...')
    return Promise.all([
      swarm.destroy(),
      registry.close(),
      store.close()
    ])
  })

  // Set up connection handler for replicating the corestore
  swarm.on('connection', (connection) => {
    console.log('New peer connected from:', connection.remoteAddress)
    // Replicate the corestore with the connected peer
    store.replicate(connection)
  })

  // Add error handling for swarm
  swarm.on('error', (error) => {
    console.error('Swarm error:', error)
  })

  // Join the swarm using the registry's discovery key
  // This allows other peers to find and connect to this registry
  const topic = registry.discoveryKey
  console.log('Server discovery key:', topic.toString('hex'))
  
  swarm.join(topic, { server: true, client: true })
  console.log('Joined swarm as server and client')

  // Add swarm event listeners for debugging
  swarm.on('peer-add', (peer) => {
    console.log('Peer discovered:', peer.publicKey.toString('hex'))
  })

  swarm.on('peer-remove', (peer) => {
    console.log('Peer removed:', peer.publicKey.toString('hex'))
  })

  // Log the public key so clients can connect to this registry
  console.log('Registry server started!')
  console.log('Public key:', registry.publicKey.toString('hex'))
  console.log('Discovery key:', registry.discoveryKey.toString('hex'))
  console.log('Waiting for connections...')

  // Show connection count periodically
  setInterval(() => {
    console.log('Current connections:', swarm.connections.size)
  }, 10000)

  // Add some sample data for testing
  await addSampleData(registry)
}

/**
 * Adds sample data to the registry for testing purposes
 */
async function addSampleData (registry) {
  try {
    console.log('Adding sample data...')

    await registry.put({
      name: 'Tomatoes',
      driveKey: 'a'.repeat(64),
      type: 'vegetable',
      description: 'Fresh organic tomatoes',
      owner: 'Local Farm Co'
    })

    await registry.put({
      name: 'Mountain Bike',
      driveKey: 'b'.repeat(64),
      type: 'sports-equipment',
      description: 'All-terrain mountain bicycle',
      owner: 'Bike World'
    })

    await registry.put({
      name: 'Coffee Beans',
      driveKey: 'c'.repeat(64),
      type: 'beverage',
      description: 'Premium arabica coffee beans',
      owner: 'Coffee Roasters Inc'
    })

    console.log('Sample data added successfully!')
  } catch (error) {
    console.error('Error adding sample data:', error.message)
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error)
  process.exit(1)
})

// Start the server
main().catch((error) => {
  console.error('Failed to start registry server:', error)
  process.exit(1)
})
