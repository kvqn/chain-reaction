import { Server } from "socket.io"
import cuid from "cuid"
import type {
  Player,
  Game,
  ClientToServerEvents,
  ServerToClientEvents,
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
})
