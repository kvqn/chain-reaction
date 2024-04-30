import { Server } from "socket.io"
import cuid from "cuid"
import {
  Player,
  Game,
  ClientToServerEvents,
  ServerToClientEvents,
} from "../frontend/src/socket-events"

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
  }
  games.push(game)
  return game
}

io.on("connection", (socket) => {
  console.log(socket.id)

  socket.on("join-room", ({ roomId, playerName }) => {
    const player = createPlayer(socket.id, playerName)
    const game = getGame(roomId)
    if (!game) return
    game.players.push(player)
    socket.join(roomId)
    io.to(socket.id).emit("room-data", { roomId })
    io.to(roomId).emit("update-players", { players: game.players })
  })

  socket.on("create-room", ({ playerName }) => {
    const player = createPlayer(socket.id, playerName)
    const roomId = cuid()
    const game = createGame(roomId, player)
    socket.join(roomId)
    io.to(socket.id).emit("room-data", { roomId })
    io.to(roomId).emit("update-players", { players: game.players })
  })
})
