import { createContext, useContext, useState } from "react"
import { Game, Player } from "./socket-events"
import { useSearchParams } from "react-router-dom"
import { socket } from "./socket"

const GameContext = createContext<{
  name: string
  setName: React.Dispatch<React.SetStateAction<string>>
  room: string | null
  roomError: string | null
  players: Player[]
  settings: Game["settings"]
  state: Game["state"]
} | null>(null)

export function GameContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const _name = localStorage.getItem("name") ?? ""
  const [name, setName] = useState(_name)
  const [searchParams, setSearchParams] = useSearchParams()
  const room = searchParams.get("room")
  const [players, setPlayers] = useState<Player[]>([])
  const [settings, setSettings] = useState<Game["settings"]>({
    gridSize: {
      rows: 16,
      cols: 8,
    },
  })
  const [state, setState] = useState<Game["state"]>("lobby")
  const [roomError, setRoomError] = useState<string | null>(null)

  socket.on("room-data", (data) => {
    if (data.roomId != null) setSearchParams({ room: data.roomId })
    else {
      setSearchParams({})
      setRoomError(data.error)
    }
  })

  socket.on("update-players", ({ players }) => {
    setPlayers(players)
  })

  socket.on("change-settings", ({ settings }) => {
    setSettings(settings)
  })

  socket.on("start-game", ({ players }) => {
    setPlayers(players)
    setState("playing")
  })

  return (
    <GameContext.Provider
      value={{ name, room, players, settings, setName, state, roomError }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGameContext() {
  const context = useContext(GameContext)

  if (context === null) {
    throw new Error("useGameContext must be used within a GameContextProvider")
  }
  return context
}
