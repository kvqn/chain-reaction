import { createContext, useContext, useState } from "react"
import { Player } from "./socket-events"
import { useSearchParams } from "react-router-dom"
import { socket } from "./socket"

const GameContext = createContext<{
  name: string
  setName: React.Dispatch<React.SetStateAction<string>>
  room: string | null
  players: Player[]
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>
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

  socket.on("room-data", ({ roomId }) => {
    setSearchParams({ room: roomId })
  })

  socket.on("update-players", ({ players }) => {
    setPlayers(players)
  })

  return (
    <GameContext.Provider value={{ name, setName, room, players, setPlayers }}>
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
