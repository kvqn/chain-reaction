export type Player = {
  socketId: string
  name: string
  color: "red" | "blue" | null
  isLeader: boolean
  lost: boolean
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
  turn: Player | null
  cells: Array<Array<{ count: number; owner: string | null }>>
  cellCounts: Map<string, number>
  countTurns: number
}

export interface ServerToClientEvents {
  "room-data": (
    data: { roomId: string } | { roomId: null; error: string },
  ) => void
  "update-players": (data: { players: Player[] }) => void
  "change-settings": (data: { settings: Game["settings"] }) => void
  "start-game": (data: { players: Player[] }) => void
  "game-over": (data: { winner: Player }) => void
  place: (data: { row: number; col: number; color: "red" | "blue" }) => void
  "change-turn": (data: { player: Player }) => void
  "player-lost": (data: { player: Player }) => void
}

export interface ClientToServerEvents {
  "join-room": (data: { roomId: string; playerName: string }) => void
  "create-room": (data: { playerName: string }) => void
  "change-settings": (data: { settings: Game["settings"] }) => void
  "start-game": () => void
  place: (data: { row: number; col: number }) => void
}
