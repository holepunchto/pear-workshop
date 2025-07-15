const Corestore = require('corestore')
const Hyperswarm = require('hyperswarm')
const goodbye = require('graceful-goodbye')
const Registry = require('./index.js')

async function main () {
  // Get the public key from command line arguments
  const publicKeyHex = process.argv[2]

  if (!publicKeyHex) {
    console.error('Usage: node client.js <public-key-hex>')
    console.error('Example: node client.js a1b2c3d4e5f6...')
    process.exit(1)
  }

  try {
    // Convert hex string to buffer
    const publicKey = Buffer.from(publicKeyHex, 'hex')

    console.log('Connecting to registry with public key:', publicKeyHex)

    // Create a local corestore for the client
    const store = new Corestore('./client-storage')

    // Create a registry instance using the server's public key
    const core = store.get({ key: publicKey })
    const registry = new Registry(core)

    // Create a hyperswarm instance for P2P networking
    const swarm = new Hyperswarm()

    // Set up graceful shutdown
    goodbye(() => {
      console.log('Client shutting down...')
      return Promise.all([
        swarm.destroy(),
        registry.close(),
        store.close()
      ])
    })

    // Set up connection handler for replicating the corestore
    swarm.on('connection', (connection) => {
      console.log('Connected to registry peer')
      // Replicate the corestore with the connected peer
      store.replicate(connection)
    })

    // Join the swarm using the registry's discovery key
    // This allows the client to find and connect to the registry server
    const topic = registry.discoveryKey
    console.log('Client discovery key:', topic.toString('hex'))

    swarm.join(topic, { server: false, client: true })
    console.log('Joined swarm as client')

    // Add swarm event listeners for debugging
    swarm.on('peer-add', (peer) => {
      console.log('Peer discovered:', peer.publicKey.toString('hex'))
    })

    swarm.on('peer-remove', (peer) => {
      console.log('Peer removed:', peer.publicKey.toString('hex'))
    })

    swarm.on('error', (error) => {
      console.error('Swarm error:', error)
    })

    // Wait for the registry to be ready and synced
    await registry.ready()

    // Give some time for initial sync and check connection status
    console.log('Waiting for initial sync...')
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Check if we have any connections
    console.log('Number of swarm connections:', swarm.connections.size)

    // Wait a bit more if no connections yet
    if (swarm.connections.size === 0) {
      console.log('No connections yet, waiting longer...')
      await new Promise(resolve => setTimeout(resolve, 3000))
    }

    console.log('Final connection count:', swarm.connections.size)

    // Perform lookups to demonstrate the functionality
    await performLookups(registry)
  } catch (error) {
    console.error('Client error:', error.message)
    process.exit(1)
  }
}

/**
 * Performs various lookup operations on the registry
 */
async function performLookups (registry) {
  console.log('\n--- Performing Lookups ---')

  try {
    // Lookup by name
    console.log('\n1. Looking up entry by name "Tomatoes":')
    try {
      const tomatoes = await registry.get('Tomatoes')
      console.log('Found:', {
        name: tomatoes.name,
        type: tomatoes.type,
        description: tomatoes.description,
        owner: tomatoes.owner
      })
    } catch (error) {
      console.log('Entry not found')
    }

    // Lookup by drive key
    console.log('\n2. Looking up entry by drive key:')
    const byDriveKey = await registry.getByDriveKey('b'.repeat(64))
    if (byDriveKey) {
      console.log('Found:', {
        name: byDriveKey.name,
        type: byDriveKey.type,
        description: byDriveKey.description,
        owner: byDriveKey.owner
      })
    } else {
      console.log('Entry not found')
    }

    // List entries by type
    console.log('\n3. Listing all "sports-equipment" items:')
    const sportsItems = registry.getEntriesOfType('sports-equipment')
    const items = []
    for await (const item of sportsItems) {
      items.push({
        name: item.name,
        description: item.description,
        owner: item.owner
      })
    }
    console.log('Found items:', items)

    // List entries by owner
    console.log('\n4. Listing all items owned by "Bike World":')
    const bikeWorldItems = registry.getEntriesOfOwner('Bike World')
    const ownerItems = []
    for await (const item of bikeWorldItems) {
      ownerItems.push({
        name: item.name,
        type: item.type,
        description: item.description
      })
    }
    console.log('Found items:', ownerItems)

    console.log('\n--- Lookups completed successfully! ---')
  } catch (error) {
    console.error('Error during lookups:', error.message)
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

// Start the client
main().catch((error) => {
  console.error('Failed to start registry client:', error)
  process.exit(1)
})
