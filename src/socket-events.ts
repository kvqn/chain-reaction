export type Player = {
  socketId: string
  name: string
  color: "red" | "blue" | null
}

export type Game = {
  roomId: string
  players: Player[]
  leader: Player
}

export interface ServerToClientEvents {
  "room-data": (data: { roomId: string }) => void
  "update-players": (data: { players: Player[] }) => void
}

export interface ClientToServerEvents {
  "join-room": (data: { roomId: string; playerName: string }) => void
  "create-room": (data: { playerName: string }) => void
}
