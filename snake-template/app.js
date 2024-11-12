/** @typedef {import('pear-interface')} */
/* global Pear */
import crypto from 'hypercore-crypto'
import b4a from 'b4a'

// TODO: create swarm and addPlayer on new peer connection
//       listen for data events of JSON objects { drop, snake, food }
//       on peer error or if receiving state.drop dropPlayer
//       otherwise sync food and snake onto relevant peer.
//       On swarm update event, update the #peers-count element

document.querySelector('#create-game').addEventListener('click', createGame)
document.querySelector('#join-form').addEventListener('submit', joinGame)

function loading () {
  document.querySelector('#setup').classList.add('hidden')
  document.querySelector('#loading').classList.remove('hidden')
}

function ready (topicBuffer) {
  const topic = b4a.toString(topicBuffer, 'hex')
  document.querySelector('#game-topic').innerText = topic
  document.querySelector('#loading').classList.add('hidden')
  document.querySelector('#game').classList.remove('hidden')
}

async function createGame () {
  const topicBuffer = crypto.randomBytes(32)
  loading()
  await joinSwarm(topicBuffer)
  const game = document.querySelector('pear-snake')
  // TODO: update id to real id from swarm with following
  // const id = b4a.toString(swarm.keyPair.publicKey, 'hex').slice(0, 6)
  const id = 'fedcab'
  game.start(id, topicBuffer)
  ready(topicBuffer)
}

async function joinGame (e) {
  e.preventDefault()
  const topicStr = document.querySelector('#join-game-topic').value
  const topicBuffer = b4a.from(topicStr, 'hex')
  loading()
  await joinSwarm(topicBuffer)
  const game = document.querySelector('pear-snake')
  // TODO: update id to real id from swarm with following
  // const id = b4a.toString(swarm.keyPair.publicKey, 'hex').slice(0, 6)
  const id = 'fedcab'
  game.start(id, topicBuffer)
  ready(topicBuffer)
}

async function joinSwarm (topicBuffer) {
  // TODO: implement
}

class Player {
  constructor (id, game, peer = null) {
    this.id = id
    this.color = '#' + id.slice(0, 6)
    this.game = game
    this.score = 0
    this.snake = []
    this.direction = { x: 0, y: 0 }
    this.peer = peer
  }

  tick (food) {
    if (this.snake.length === 0) this.snake.unshift(this.game.pos())
    const head = { 
      x: (this.snake[0].x + this.direction.x + Game.tiles) % Game.tiles, 
      y: (this.snake[0].y + this.direction.y + Game.tiles) % Game.tiles
    }
    this.snake.unshift(head)
    const ate = head.x === food.x && head.y === food.y
    if (ate) this.score++
    else this.snake.pop()
    return ate
  }

  collides (player) {
    const head = this.snake[0]
    if (!head) return false
    return player.snake.some((seg) => seg.x === head.x && seg.y === head.y)
  }

  selfCollides () {
    const [head, ...body] = this.snake
    return body.some(segment => segment.x === head.x && segment.y === head.y)
  }
}

class Game extends HTMLElement {
  static grid = 20
  static tiles = 30
  static pear = '🍐'

  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.topicBuffer = null
    this.players = new Map()
    this.speed = 100
    this.food = null
    this.player = null
    this.drop = false
    this.shadowRoot.innerHTML = `
      <style> canvas { background: #000; display: block; margin: auto } </style>
      <canvas></canvas>
    `
    this.canvas = this.shadowRoot.querySelector('canvas')
    this.ctx = this.canvas.getContext('2d')

    this.keydown = (e) => {
      if (e.key === 'ArrowUp' && this.player.direction.y === 0) this.player.direction = { x: 0, y: -1 }
      else if (e.key === 'ArrowDown' && this.player.direction.y === 0) this.player.direction = { x: 0, y: 1 }
      else if (e.key === 'ArrowLeft' && this.player.direction.x === 0) this.player.direction = { x: -1, y: 0 }
      else if (e.key === 'ArrowRight' && this.player.direction.x === 0) this.player.direction = { x: 1, y: 0 }
      setImmediate(() => { this.tick() })
    }
  }

  connectedCallback () {
    this.canvas.width = Game.grid * Game.tiles
    this.canvas.height = Game.grid * Game.tiles
  }

  start (playerId, topicBuffer) {
    this.topicBuffer = topicBuffer
    this.food = { x: this.topicBuffer[0] % Game.tiles, y: this.topicBuffer[1] % Game.tiles }
    this.player = new Player(playerId, this)
    this.addPlayer(this.player)
    this.loop()
    this.draw()
    document.addEventListener('keydown', this.keydown)
  }

  over () {
    document.removeEventListener('keydown', this.keydown)
    this.canvas.style.background = '#151815'
    this.drop = true
    this.dropPlayer(this.player)
  }

  sync () {
    // TODO: implement
  }

  pos () {
    const coords = { x: Math.floor(Math.random() * Game.tiles), y: Math.floor(Math.random() * Game.tiles) }
    if (coords.x === this.food?.x && coords.y === this.food?.y) return this.pos()
    if ([...this.players.values()].some((player) => coords.x === player.snake[0]?.x && coords.y === player.snake[0]?.y)) return this.pos()
    return coords
  }

  tick () {
    if (this.topicBuffer === null) return
    if (this.food === null) this.food = this.pos()
    const ate = this.player.tick(this.food)
    if (ate) this.food = this.pos()
    for (const opponent of this.players.values()) {
      if (opponent === this.player) {
        if (this.player.selfCollides()) this.over()
      }
      else if (this.player.collides(opponent)) this.over()
      else if (opponent.collides(this.player)) this.dropPlayer(opponent)
    }
  }

  draw () {
    requestAnimationFrame(() => this.draw())
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.font = `${Game.grid}px sans-serif`
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText(Game.pear, this.food.x * Game.grid + Game.grid / 2, this.food.y * Game.grid + Game.grid / 2)
    for (const player of this.players.values()) {
      this.ctx.fillStyle = player.color
      for (const seg of player.snake) {
        this.ctx.fillRect(seg.x * Game.grid, seg.y * Game.grid, Game.grid, Game.grid)
      }
    }
  }

  loop () {
    this.tick()
    this.sync()
    setTimeout(() => this.loop(), this.speed)
  }

  addPlayer (player) {
    this.players.set(player.id, player)
  }

  dropPlayer (player) {
    if (!this.players.has(player.id)) return
    this.players.delete(player.id)
  }
}

customElements.define('pear-snake', Game)
