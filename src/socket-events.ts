export type Player = {
  socketId: string
  name: string
  color: "red" | "blue" | null
  isLeader: boolean
}

export const COLORS = ["red", "blue"] as const

export type Game = {
  roomId: string
  players: Player[]
  leader: Player
  settings: {
    gridSize:
      | {
          rows: 16
          cols: 8
        }
      | {
          rows: 32
          cols: 16
        }
  }
  state: "lobby" | "playing" | "game-over"
}

export interface ServerToClientEvents {
  "room-data": (data: { roomId: string | null }) => void
  "update-players": (data: { players: Player[] }) => void
  "change-settings": (data: { settings: Game["settings"] }) => void
  "start-game": (data: { players: Player[] }) => void
  "game-over": (data: { winner: Player }) => void
}

export interface ClientToServerEvents {
  "join-room": (data: { roomId: string; playerName: string }) => void
  "create-room": (data: { playerName: string }) => void
  "change-settings": (data: { settings: Game["settings"] }) => void
  "start-game": () => void
}
