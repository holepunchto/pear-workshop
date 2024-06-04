# Exercise 3 - Making the Application

## Dependencies

```js
npm install hyperswarm hypercore-crypto b4a
```

## HTML

Update `chat/index.html` to:

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      pear-ctrl {
        margin-top: 7px;
        margin-left: 7px;
        position: absolute;
      }

      pear-ctrl:after {
        content: '';
        display: block;
        height: 1.8rem;
        position: fixed;
        z-index: -1;
        left: 0;
        top: 0;
        width: 100%;
        background-color: #B0D94413;
        filter: drop-shadow(2px 10px 6px #888);
      }

      button, input {
        all: unset;
        border: 1px ridge #B0D944;
        background: #000;
        color: #B0D944;
        padding: .45rem;
        font-family: monospace;
        font-size: 1rem;
        line-height: 1rem;
      }

      body {
        background-color: #001601;
        font-family: monospace;
        margin: 0;
        padding: 0;
        --title-bar-height: 30px;
        padding-top: var(--title-bar-height);
      }

      main {
        display: flex;
        height: 100vh;
        color: white;
        justify-content: center;
        margin: 0;
        padding: 0;
        margin-top: -30px;
      }

      .hidden {
        display: none !important;
      }

      #or {
        margin: 1.5rem auto;
      }

      #setup {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      #loading {
        align-self: center;
      }

      #chat {
        display: flex;
        flex-direction: column;
        width: 100vw;
        padding: .75rem;
      }

      #header {
        margin-top: 2.2rem;
        margin-bottom: 0.75rem;
      }

      #details {
        display: flex;
        justify-content: space-between;
      }

      #messages {
        flex: 1;
        font-family: 'Courier New', Courier, monospace;
        overflow-y: scroll;
      }

      #message-form {
        display: flex;
      }

      #message {
        flex: 1;
      }

      #bar {
        -webkit-app-region: drag;
        height: var(--title-bar-height);
        padding: 0;
        white-space: nowrap;
        box-sizing: border-box;
        position: fixed;
        z-index: 20;
        width: 100%;
        left: 0;
        top: 0;
      }
      pear-ctrl[data-platform="darwin"] { 
        float: left;
        margin-top: 14px;
        margin-left: 12px;
      }
    </style>
    <script type='module' src='./app.js'></script>
  </head>
  <body>
    <div id="bar"><pear-ctrl></pear-ctrl></div>
    <main>
      <div id="setup">
        <div>
          <button id="create-chat-room">Create</button>
        </div>
        <div id="or">
          - or -
        </div>
        <form id="join-form">
          <button type="submit" id="join-chat-room">Join</button>
          <input required id="join-chat-room-topic" type="text" placeholder="Chat room Topic" />
        </form>
      </div>
      <div id="loading" class="hidden">Loading ...</div>
      <div id="chat" class="hidden">
        <div id="header">
          <div id="details">
            <div>
              Topic: <span id="chat-room-topic"></span>
            </div>
            <div>
              Peers: <span id="peers-count">0</span>
            </div>
          </div>
        </div>
        <div id="messages"></div>
        <form id="message-form">
          <input id="message" type="text" />
          <input type="submit" value="Send" />
        </form>
      </div>
    </main>
  </body>
</html>
```


## JavaScript

Update `app.js` to:

```js
/* global Pear */
import Hyperswarm from 'hyperswarm'   // Module for P2P networking and connecting peers
import crypto from 'hypercore-crypto' // Cryptographic functions for generating the key in app
import b4a from 'b4a'                 // Module for buffer-to-string and vice-versa conversions 
const { teardown } = Pear             // Cleanup function

const swarm = new Hyperswarm()

// Unannounce the public key before exiting the process
// (This is not a requirement, but it helps avoid DHT pollution)
teardown(() => swarm.destroy())

// When there's a new connection, listen for new messages, and add them to the UI
swarm.on('connection', (peer) => {
  // name incoming peers after first 6 chars of its public key as hex
  const name = b4a.toString(peer.remotePublicKey, 'hex').substr(0, 6)
  peer.on('data', message => onMessageAdded(name, message))
  peer.on('error', e => console.log(`Connection error: ${e}`))
})

// When there's updates to the swarm, update the peers count
swarm.on('update', () => {
  document.querySelector('#peers-count').textContent = swarm.connections.size
})

document.querySelector('#create-chat-room').addEventListener('click', createChatRoom)
document.querySelector('#join-form').addEventListener('submit', joinChatRoom)
document.querySelector('#message-form').addEventListener('submit', sendMessage)

async function createChatRoom() {
  // Generate a new random topic (32 byte string)
  const topicBuffer = crypto.randomBytes(32)
  joinSwarm(topicBuffer)
}

async function joinChatRoom (e) {
  e.preventDefault()
  const topicStr = document.querySelector('#join-chat-room-topic').value
  const topicBuffer = b4a.from(topicStr, 'hex')
  joinSwarm(topicBuffer)
}

async function joinSwarm (topicBuffer) {
  document.querySelector('#setup').classList.add('hidden')
  document.querySelector('#loading').classList.remove('hidden')

  // Join the swarm with the topic. Setting both client/server to true means that this app can act as both.
  const discovery = swarm.join(topicBuffer, { client: true, server: true })
  await discovery.flushed()

  const topic = b4a.toString(topicBuffer, 'hex')
  document.querySelector('#chat-room-topic').innerText = topic
  document.querySelector('#loading').classList.add('hidden')
  document.querySelector('#chat').classList.remove('hidden')
}

function sendMessage (e) {
  const message = document.querySelector('#message').value
  document.querySelector('#message').value = ''
  e.preventDefault()

  onMessageAdded('You', message)

  // Send the message to all peers (that you are connected to)
  const peers = [...swarm.connections]
  for (const peer of peers) peer.write(message)
}

// appends element to #messages element with content set to sender and message
function onMessageAdded (from, message) {
  const $div = document.createElement('div')
  $div.textContent = `<${from}> ${message}`
  document.querySelector('#messages').appendChild($div)
}
```
