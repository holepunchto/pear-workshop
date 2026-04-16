const Hyperswarm = require('hyperswarm')
const crypto = require('hypercore-crypto')
const b4a = require('b4a')

const swarm = new Hyperswarm()

function send(msg) {
  Bare.IPC.write(Buffer.from(JSON.stringify(msg)))
}

// TODO: listen on Bare.IPC 'data' for messages from the renderer
//       msg.type 'join' → call joinSwarm(msg.topic)
//       msg.type 'send' → write msg.data to every peer in swarm.connections

// TODO: swarm.on('connection', (peer) => { ... })
//       derive id: b4a.toString(peer.remotePublicKey, 'hex').slice(0, 6)
//       send { type: 'connected', id }
//       peer.on('data'): send { type: 'data', id, payload: message.toString() }
//       peer.on('error') and peer.on('close'): send { type: 'disconnected', id }

// TODO: swarm.on('update', () => { ... })
//       send { type: 'update', connections: swarm.connections.size }

async function joinSwarm(topicHex) {
  // TODO: build topicBuffer — b4a.from(topicHex, 'hex') if provided, otherwise crypto.randomBytes(32)
  //       const discovery = swarm.join(topicBuffer, { client: true, server: true })
  //       await discovery.flushed()
  //       derive id: b4a.toString(swarm.keyPair.publicKey, 'hex').slice(0, 6)
  //       send { type: 'ready', id, topic: b4a.toString(topicBuffer, 'hex') }
}
