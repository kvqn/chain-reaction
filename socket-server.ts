import { Server } from "socket.io"
import cuid from "cuid"
import {
  type Player,
  type Game,
  type ClientToServerEvents,
  type ServerToClientEvents,
  COLORS,
} from "./src/socket-events"

const io = new Server<ClientToServerEvents, ServerToClientEvents>(
  parseInt(process.env.SOCKET_PORT!),
  {
    cors: {
      origin: process.env.REACT_SERVER!,
    },
  },
)

console.log("Socket server started on port", process.env.SOCKET_PORT)

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
    isLeader: false,
    lost: false,
  }
  players.push(player)
  return player
}

function createGame(roomId: string, leader: Player) {
  leader.isLeader = true
  const game: Game = {
    roomId,
    players: [leader],
    leader: leader,
    settings: {
      gridSize: {
        rows: 16,
        cols: 8,
      },
    },
    state: "lobby",
    turn: null,
    cells: [[]],
    cellCounts: new Map(),
    countTurns: 0,
  }
  games.push(game)
  return game
}

io.on("connection", (socket) => {
  console.log("connected", socket.id)

  socket.on("join-room", ({ roomId, playerName }) => {
    const player = createPlayer(socket.id, playerName)
    const game = getGame(roomId)
    if (!game) {
      io.to(socket.id).emit("room-data", {
        roomId: null,
        error: "This room does not exist.",
      })
      return
    }
    if (game.players.length == 2) {
      io.to(socket.id).emit("room-data", {
        roomId: null,
        error: "This room is full.",
      })
      return
    }
    if (game.state != "lobby") {
      io.to(socket.id).emit("room-data", {
        roomId: null,
        error: "This game has already started.",
      })
    }
    // TODO: handle more than 2 players

    if (game.players.some((p) => p.socketId === socket.id)) return
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

    if (game.state != "game-over" && game.players.length <= 1) {
      io.to(game.roomId).emit("game-over", { winner: game.players[0] })
      games.splice(games.indexOf(game), 1)
      console.log("game over")
    }
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
    game.cells = Array.from({ length: game.settings.gridSize.rows }, () =>
      Array.from({ length: game.settings.gridSize.cols }, () => {
        return { count: 0, owner: null }
      }),
    )
    game.turn = game.players[0]
    game.countTurns = 0

    io.to(game.roomId).emit("start-game", { players: game.players })
    io.to(game.roomId).emit("change-turn", { player: game.turn })
  })

  socket.on("place", ({ row, col }) => {
    const player = getPlayer(socket.id)
    const game = getPlayerGame(socket.id)
    if (!player || !game) return
    if (game.state != "playing") return
    if (player.socketId !== game.turn?.socketId) return

    console.log("gbfdkb")

    io.to(game.roomId).emit("place", { row, col, color: player.color! })
    game.cellCounts.set(
      player.socketId,
      game.cellCounts.get(player.socketId) ?? 0 + 1,
    )
    game.countTurns++

    const queue: Array<[number, number]> = [[row, col]]
    while (queue.length > 0) {
      const [r, c] = queue.shift()!
      if (r < 0 || r >= game.settings.gridSize.rows) continue
      if (c < 0 || c >= game.settings.gridSize.cols) continue
      if (
        game.cells[r][c].owner !== player.socketId &&
        game.cells[r][c].owner !== null
      ) {
        game.cellCounts.set(
          game.cells[r][c].owner!,
          game.cellCounts.get(game.cells[r][c].owner!)! -
            game.cells[r][c].count,
        )
        game.cellCounts.set(
          player.socketId,
          game.cellCounts.get(player.socketId)! + game.cells[r][c].count,
        )
        game.cells[r][c].owner = player.socketId
      }
      game.cells[r][c].count++

      // checking if a player lost
      let count_alive = 0
      if (game.countTurns > game.players.length) {
        for (const [socketId, count] of game.cellCounts) {
          if (count == 0) {
            const player = game.players.find((p) => p.socketId === socketId)!
            if (player.lost) continue
            player.lost = true
            io.to(game.roomId).emit("player-lost", { player })
          } else {
            count_alive++
          }
        }
      }
      if (count_alive == 1) {
        const winner = game.players.find((p) => !p.lost)!
        io.to(game.roomId).emit("game-over", { winner })
        game.state = "game-over"
        console.log("game over")
        return
      }

      if (
        ((r == 0 || r == game.settings.gridSize.rows - 1) &&
          (c == 0 || c == game.settings.gridSize.cols - 1) &&
          game.cells[r][c].count == 2) ||
        ((r == 0 ||
          r == game.settings.gridSize.rows - 1 ||
          c == 0 ||
          c == game.settings.gridSize.cols - 1) &&
          game.cells[r][c].count == 3) ||
        game.cells[r][c].count == 4
      ) {
        // game.cellCounts.set(
        //   player.socketId,
        //   game.cellCounts.get(player.socketId)! - 1,
        // )
        game.cells[r][c].owner = null
        game.cells[r][c].count = 0
        queue.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1])
        // if (r > 0) queue.push([r - 1, c])
        // if (r < game.settings.gridSize.rows - 1) queue.push([r + 1, c])
        // if (c > 0) queue.push([r, c - 1])
        // if (c < game.settings.gridSize.cols - 1) queue.push([r, c + 1])
      }
    }

    console.log("vkjfnbvbkdfb")

    const countAlive = game.players.filter((p) => !p.lost).length
    const playerIndex = game.countTurns % countAlive
    let i = 0
    for (const player of game.players) {
      if (player.lost) continue
      if (i == playerIndex) {
        game.turn = player
        io.to(game.roomId).emit("change-turn", {
          player: game.players[playerIndex % game.players.length],
        })
        break
      }
      i++
    }
  })
})
