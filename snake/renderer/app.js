const bridge = window.bridge
const decoder = new TextDecoder('utf-8')
const encoder = new TextEncoder()

const WORKER = '/workers/main.js'

function sendToWorker(msg) {
  bridge.writeWorkerIPC(WORKER, encoder.encode(JSON.stringify(msg)))
}

// TODO: bridge.startWorker(WORKER)

// TODO: bridge.onWorkerIPC(WORKER, (data) => {
//   parse the message and handle each type:
//
//   'ready'        → hexToBytes(msg.topic) for topicBuffer
//                    set #game-topic text, hide #loading, show #game
//                    call game.start(msg.id, topicBuffer)
//
//   'connected'    → if game.players doesn't have msg.id,
//                    call game.addPlayer(new Player(msg.id, game))
//
//   'disconnected' → get player from game.players, call game.dropPlayer(player)
//
//   'data'         → JSON.parse(msg.payload) into state
//                    get player from game.players by state.id
//                    if state.drop: game.dropPlayer(player)
//                    if state.snake and longer than player's: update game.food
//                    update player.snake = state.snake
//
//   'update'       → set #peers-count text to msg.connections
// })

document.querySelector('#create-game').addEventListener('click', createGame)
document.querySelector('#join-form').addEventListener('submit', joinGame)

function loading() {
  document.querySelector('#setup').classList.add('hidden')
  document.querySelector('#loading').classList.remove('hidden')
}

function createGame() {
  loading()
  // TODO: sendToWorker({ type: 'join', topic: null })
}

function joinGame(e) {
  e.preventDefault()
  const topicHex = document.querySelector('#join-game-topic').value
  loading()
  // TODO: sendToWorker({ type: 'join', topic: topicHex })
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

class Player {
  constructor(id, game) {
    this.id = id
    this.color = '#' + id.slice(0, 6)
    this.game = game
    this.score = 0
    this.snake = []
    this.direction = { x: 0, y: 0 }
  }

  tick(food) {
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

  collides(player) {
    const head = this.snake[0]
    if (!head) return false
    return player.snake.some((seg) => seg.x === head.x && seg.y === head.y)
  }

  selfCollides() {
    const [head, ...body] = this.snake
    return body.some((segment) => segment.x === head.x && segment.y === head.y)
  }
}

class Game extends HTMLElement {
  static grid = 20
  static tiles = 30
  static pear = '🍐'

  constructor() {
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
      if (e.key === 'ArrowUp' && this.player.direction.y === 0) {
        this.player.direction = { x: 0, y: -1 }
      } else if (e.key === 'ArrowDown' && this.player.direction.y === 0) {
        this.player.direction = { x: 0, y: 1 }
      } else if (e.key === 'ArrowLeft' && this.player.direction.x === 0) {
        this.player.direction = { x: -1, y: 0 }
      } else if (e.key === 'ArrowRight' && this.player.direction.x === 0) {
        this.player.direction = { x: 1, y: 0 }
      }
      setTimeout(() => this.tick(), 0)
    }
  }

  connectedCallback() {
    this.canvas.width = Game.grid * Game.tiles
    this.canvas.height = Game.grid * Game.tiles
  }

  start(playerId, topicBuffer) {
    this.topicBuffer = topicBuffer
    this.food = { x: this.topicBuffer[0] % Game.tiles, y: this.topicBuffer[1] % Game.tiles }
    this.player = new Player(playerId, this)
    this.addPlayer(this.player)
    this.loop()
    this.draw()
    document.addEventListener('keydown', this.keydown)
  }

  over() {
    document.removeEventListener('keydown', this.keydown)
    this.canvas.style.background = '#151815'
    this.drop = true
    this.dropPlayer(this.player)
  }

  sync() {
    // TODO: sendToWorker({ type: 'send', data: JSON.stringify({ id, food, snake, drop }) })
    //       where id = this.player.id, food = this.food,
    //             snake = this.player.snake, drop = this.drop
  }

  pos() {
    const coords = {
      x: Math.floor(Math.random() * Game.tiles),
      y: Math.floor(Math.random() * Game.tiles)
    }
    if (coords.x === this.food?.x && coords.y === this.food?.y) return this.pos()
    if (
      [...this.players.values()].some(
        (player) => coords.x === player.snake[0]?.x && coords.y === player.snake[0]?.y
      )
    ) {
      return this.pos()
    }
    return coords
  }

  tick() {
    if (this.topicBuffer === null) return
    if (this.food === null) this.food = this.pos()
    const ate = this.player.tick(this.food)
    if (ate) this.food = this.pos()
    for (const opponent of this.players.values()) {
      if (opponent === this.player) {
        if (this.player.selfCollides()) this.over()
      } else if (this.player.collides(opponent)) this.over()
      else if (opponent.collides(this.player)) this.dropPlayer(opponent)
    }
  }

  draw() {
    requestAnimationFrame(() => this.draw())
    if (this.food === null) return
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.font = `${Game.grid}px sans-serif`
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText(
      Game.pear,
      this.food.x * Game.grid + Game.grid / 2,
      this.food.y * Game.grid + Game.grid / 2
    )
    for (const player of this.players.values()) {
      this.ctx.fillStyle = player.color
      for (const seg of player.snake) {
        this.ctx.fillRect(seg.x * Game.grid, seg.y * Game.grid, Game.grid, Game.grid)
      }
    }
  }

  loop() {
    this.tick()
    this.sync()
    setTimeout(() => this.loop(), this.speed)
  }

  addPlayer(player) {
    this.players.set(player.id, player)
  }

  dropPlayer(player) {
    if (!this.players.has(player.id)) return
    this.players.delete(player.id)
  }
}

customElements.define('pear-snake', Game)
