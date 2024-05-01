import { Server } from "socket.io"
import cuid from "cuid"
import {
  type Player,
  type Game,
  type ClientToServerEvents,
  type ServerToClientEvents,
  COLORS,
} from "./src/socket-events"

const io = new Server<ClientToServerEvents, ServerToClientEvents>(3000, {
  cors: {
    origin: "http://localhost:5173",
  },
})

const players: Player[] = []
const games: Game[] = []

function getGame(roomId: string) {
  return games.find((game) => game.roomId === roomId)
}

function getPlayer(socketId: string) {
  return players.find((player) => player.socketId === socketId)
}

function getPlayerGame(socketId: string) {
  return games.find((game) =>
    game.players.some((player) => player.socketId === socketId),
  )
}

function createPlayer(socketId: string, name: string) {
  const player: Player = {
    socketId,
    name,
    color: null,
  }
  players.push(player)
  return player
}

function createGame(roomId: string, leader: Player) {
  const game: Game = {
    roomId,
    players: [leader],
    leader: {
      socketId: leader.socketId,
      name: leader.name,
      color: null,
    },
    settings: {
      gridSize: {
        rows: 16,
        cols: 8,
      },
    },
    state: "lobby",
  }
  games.push(game)
  return game
}

io.on("connection", (socket) => {
  console.log("connected", socket.id)

  socket.on("join-room", ({ roomId, playerName }) => {
    const player = createPlayer(socket.id, playerName)
    const game = getGame(roomId)
    if (!game) return
    if (game.players.length == 2) return
    // TODO: handle more than 2 players

    game.players.push(player)
    socket.join(roomId)
    io.to(socket.id).emit("room-data", { roomId })
    io.to(roomId).emit("update-players", { players: game.players })

    console.log(socket.id, "joined", roomId)
  })

  socket.on("create-room", ({ playerName }) => {
    const player = createPlayer(socket.id, playerName)
    const roomId = cuid()
    const game = createGame(roomId, player)
    socket.join(roomId)
    io.to(socket.id).emit("room-data", { roomId })
    io.to(roomId).emit("update-players", { players: game.players })

    console.log(socket.id, "created", roomId)
  })

  socket.on("disconnect", () => {
    const player = getPlayer(socket.id)
    if (!player) return
    const game = getPlayerGame(socket.id)
    if (!game) return

    game.players = game.players.filter((p) => p.socketId !== socket.id)
    socket.leave(game.roomId)
    io.to(game.roomId).emit("update-players", { players: game.players })

    console.log("disconnected", socket.id)
  })

  socket.on("change-settings", ({ settings }) => {
    const player = getPlayer(socket.id)
    const game = getPlayerGame(socket.id)
    if (!player || !game) return
    if (player.socketId !== game.leader.socketId) return

    game.settings = settings
    io.to(game.roomId).emit("change-settings", { settings })
    console.log("changed settings")
  })

  socket.on("start-game", () => {
    const player = getPlayer(socket.id)
    const game = getPlayerGame(socket.id)
    if (!player || !game) return
    if (player.socketId !== game.leader.socketId) return

    game.players.forEach((player, i) => {
      player.color = COLORS[i]
    })
    game.state = "playing"

    io.to(game.roomId).emit("start-game", { players: game.players })
  })
})
